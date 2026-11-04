import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { TodoType } from '@/db/entities/enums';
import { User } from '@/db/entities/User';
import { Todo } from '@/db/entities/Todo';
import { TodoAction } from '@/db/entities/TodoAction';
import { TodoDiscipline } from '@/db/entities/TodoDiscipline';
import { DisciplineHistory } from '@/db/entities/DisciplineHistory';
import { LifeArea } from '@/db/entities/LifeArea';
import { assertOwnedLifeAreas } from '@/features/general/api/repository';
import type {
  CreateTodoData,
  UpdateTodoData,
  CreateActionData,
  UpdateActionData,
  CreateDisciplineData,
  Todo as TodoDto,
} from '../lib/types';

export type {
  CreateTodoData,
  UpdateTodoData,
  CreateActionData,
  UpdateActionData,
  CreateDisciplineData,
};

/**
 * Safely transforms a MikroORM Todo entity and its initialized collections
 * into a plain Todo DTO object matching the ArkType Todo schema.
 */
export function serializeTodo(todo: Todo): TodoDto {
  const lifeAreaDto =
    todo.lifeArea && typeof todo.lifeArea === 'object' && 'title' in todo.lifeArea
      ? {
          id: todo.lifeArea.id,
          title: todo.lifeArea.title,
          vision: todo.lifeArea.vision,
        }
      : undefined;

  return {
    id: todo.id,
    title: todo.title,
    description: todo.description ?? '',
    type: todo.type as unknown as TodoDto['type'],
    deadline: todo.deadline,
    isDone: todo.isDone,
    difficulty: todo.difficulty,
    lifeAreaId: todo.lifeArea?.id ?? null,
    lifeArea: lifeAreaDto,
    actions: todo.actions?.isInitialized()
      ? todo.actions.getItems().map((a) => ({
          id: a.id,
          title: a.title,
          deadline: a.deadline,
          isDone: a.isDone,
          createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
          updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt),
        }))
      : undefined,
    disciplines: todo.disciplines?.isInitialized()
      ? todo.disciplines.getItems().map((d) => ({
          id: d.id,
          title: d.title,
          history: d.history?.isInitialized()
            ? d.history.getItems().map((h) => ({
                date: h.date,
                isDone: h.isDone,
              }))
            : undefined,
        }))
      : undefined,
    createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : String(todo.createdAt),
    updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt.toISOString() : String(todo.updatedAt),
    deletedAt: todo.deletedAt instanceof Date ? todo.deletedAt.toISOString() : todo.deletedAt ? String(todo.deletedAt) : null,
  };
}

export class TodoRepository extends EntityRepository<Todo> {
  async findDaily(userId: number): Promise<Todo[]> {
    return this.find({ type: TodoType.DAILY, user: userId, deletedAt: null }, {
      populate: ['lifeArea'],
      orderBy: [{ sortNumber: 'ASC' }, { deadline: 'ASC' }],
    });
  }

  async findUpcoming(userId: number): Promise<Todo[]> {
    return this.find({ type: TodoType.UPCOMING, user: userId, deletedAt: null }, {
      populate: ['lifeArea'],
      orderBy: [{ sortNumber: 'ASC' }, { deadline: 'ASC' }],
    });
  }

  async findMissions(
    userId: number,
    options?: { populateRelations?: boolean },
  ): Promise<Todo[]> {
    return this.find({ type: TodoType.MISSION, user: userId, deletedAt: null }, {
      populate: options?.populateRelations
        ? ['actions', 'disciplines.history', 'lifeArea']
        : ['lifeArea'],
      orderBy: [{ sortNumber: 'ASC' }, { deadline: 'ASC' }],
    });
  }

  async findAllTodos(
    userId: number,
    options?: { populateRelations?: boolean },
  ): Promise<Todo[]> {
    return this.find({ user: userId, deletedAt: null }, {
      populate:
        options?.populateRelations !== false
          ? ['actions', 'disciplines.history', 'lifeArea']
          : ['lifeArea'],
      orderBy: [{ sortNumber: 'ASC' }, { deadline: 'ASC' }],
    });
  }

  async findById(id: number, userId: number): Promise<Todo | null> {
    return this.findOne({ id, user: userId, deletedAt: null }, {
      populate: ['actions', 'disciplines.history', 'lifeArea'],
    });
  }

  async findMissionById(id: number, userId: number): Promise<Todo | null> {
    return this.findOne({ id, type: TodoType.MISSION, user: userId, deletedAt: null }, {
      populate: ['actions', 'disciplines.history', 'lifeArea'],
    });
  }

  async createTodo(data: CreateTodoData, userId: number): Promise<Todo> {
    if (!data.lifeAreaId || data.lifeAreaId <= 0) {
      throw new Error('Life area is required for todo');
    }
    await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId]);

    const lifeArea = this.em.getReference(LifeArea, data.lifeAreaId);

    const todo = this.create({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      type: data.type as unknown as TodoType,
      deadline: data.deadline ? data.deadline.trim() : null,
      difficulty: data.difficulty,
      isDone: data.isDone ?? false,
      user: this.em.getReference(User, userId),
      lifeArea,
    });

    if (data.actions && data.actions.length > 0) {
      for (const act of data.actions) {
        todo.actions.add(
          this.em.create(TodoAction, {
            title: act.title.trim(),
            deadline: act.deadline ? act.deadline.trim() : null,
            isDone: act.isDone ?? false,
            mission: todo,
          }),
        );
      }
    }

    if (data.disciplines && data.disciplines.length > 0) {
      for (const disc of data.disciplines) {
        todo.disciplines.add(
          this.em.create(TodoDiscipline, {
            title: disc.title.trim(),
            mission: todo,
          }),
        );
      }
    }

    await this.em.flush();
    return todo;
  }

  async updateTodo(id: number, data: UpdateTodoData, userId: number): Promise<Todo | null> {
    const todo = await this.findOne({ id, user: userId }, {
      populate: ['actions', 'disciplines.history', 'lifeArea'],
    });

    if (!todo) {
      return null;
    }

    if (data.lifeAreaId !== undefined) {
      if (!data.lifeAreaId || data.lifeAreaId <= 0) {
        throw new Error('Life area is required for todo');
      }
      await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId], {
        keepInactiveId: todo.lifeArea?.id ?? null,
      });
    }

    const lifeArea =
      data.lifeAreaId !== undefined
        ? this.em.getReference(LifeArea, data.lifeAreaId)
        : todo.lifeArea;

    this.assign(todo, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() }
        : {}),
      ...(data.type !== undefined ? { type: data.type as unknown as TodoType } : {}),
      ...(data.deadline !== undefined
        ? { deadline: data.deadline ? data.deadline.trim() : null }
        : {}),
      ...(data.isDone !== undefined ? { isDone: data.isDone } : {}),
      ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
      ...(data.lifeAreaId !== undefined ? { lifeArea } : {}),
    });

    if (data.actions !== undefined) {
      const existingActionMap = new Map(todo.actions.getItems().map((a) => [a.id, a]));
      const newActionIds = new Set<number>();

      for (const actData of data.actions) {
        if (actData.id && existingActionMap.has(actData.id)) {
          const existing = existingActionMap.get(actData.id)!;
          this.em.assign(existing, {
            title: actData.title.trim(),
            deadline: actData.deadline ? actData.deadline.trim() : null,
            ...(actData.isDone !== undefined ? { isDone: actData.isDone } : {}),
          });
          newActionIds.add(existing.id);
        } else {
          const newAct = this.em.create(TodoAction, {
            title: actData.title.trim(),
            deadline: actData.deadline ? actData.deadline.trim() : null,
            isDone: actData.isDone ?? false,
            mission: todo,
          });
          todo.actions.add(newAct);
        }
      }

      for (const existing of todo.actions.getItems()) {
        if (existing.id && !newActionIds.has(existing.id) && !data.actions.some((a) => a.id === existing.id)) {
          todo.actions.remove(existing);
        }
      }
    }

    if (data.disciplines !== undefined) {
      const existingDiscMap = new Map(todo.disciplines.getItems().map((d) => [d.id, d]));
      const newDiscIds = new Set<number>();

      for (const discData of data.disciplines) {
        if (discData.id && existingDiscMap.has(discData.id)) {
          const existing = existingDiscMap.get(discData.id)!;
          this.em.assign(existing, {
            title: discData.title.trim(),
          });
          newDiscIds.add(existing.id);
        } else {
          const newDisc = this.em.create(TodoDiscipline, {
            title: discData.title.trim(),
            mission: todo,
          });
          todo.disciplines.add(newDisc);
        }
      }

      for (const existing of todo.disciplines.getItems()) {
        if (existing.id && !newDiscIds.has(existing.id) && !data.disciplines.some((d) => d.id === existing.id)) {
          todo.disciplines.remove(existing);
        }
      }
    }

    await this.em.flush();
    return todo;
  }

  async toggleDone(id: number, userId: number): Promise<Todo | null> {
    const todo = await this.findOne({ id, user: userId });
    if (!todo) {
      return null;
    }

    todo.isDone = !todo.isDone;
    await this.em.flush();
    return todo;
  }

  async deleteTodo(id: number, userId: number): Promise<boolean> {
    const todo = await this.findOne({ id, user: userId });
    if (!todo) {
      return false;
    }

    todo.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  async restoreTodo(id: number, userId: number): Promise<boolean> {
    const todo = await this.findOne({ id, user: userId, deletedAt: { $ne: null } });
    if (!todo) {
      return false;
    }

    todo.deletedAt = null;
    await this.em.flush();
    return true;
  }

  async hardDeleteTodo(id: number, userId: number): Promise<boolean> {
    const todo = await this.findOne({ id, user: userId });
    if (!todo) {
      return false;
    }

    this.em.remove(todo);
    await this.em.flush();
    return true;
  }

  async findHistory(
    userId: number,
    type?: TodoType | 'Daily' | 'Upcoming' | 'Mission' | string,
  ): Promise<Todo[]> {
    const where: FilterQuery<Todo> = {
      user: userId,
      deletedAt: { $ne: null },
    };
    if (type) {
      const typeStr = String(type).toLowerCase();
      if (typeStr === 'daily') {
        where.type = TodoType.DAILY;
      } else if (typeStr === 'upcoming') {
        where.type = TodoType.UPCOMING;
      } else if (typeStr === 'mission' || typeStr === 'missions') {
        where.type = TodoType.MISSION;
      }
    }

    return this.find(where, {
      populate: ['actions', 'disciplines.history', 'lifeArea'],
      orderBy: [{ deletedAt: 'DESC' }],
    });
  }

  async findHistoryById(id: number, userId: number): Promise<Todo | null> {
    return this.findOne({ id, user: userId, deletedAt: { $ne: null } }, {
      populate: ['actions', 'disciplines.history', 'lifeArea'],
    });
  }

  async getTodosStats(userId: number): Promise<{
    dailyCompleted: number;
    dailyTotal: number;
    upcomingTotal: number;
    missionsTotal: number;
  }> {
    const [dailyCompleted, dailyTotal, upcomingTotal, missionsTotal] = await Promise.all([
      this.count({ user: userId, type: TodoType.DAILY, isDone: true, deletedAt: null }),
      this.count({ user: userId, type: TodoType.DAILY, deletedAt: null }),
      this.count({ user: userId, type: TodoType.UPCOMING, deletedAt: null }),
      this.count({ user: userId, type: TodoType.MISSION, deletedAt: null }),
    ]);

    return {
      dailyCompleted,
      dailyTotal,
      upcomingTotal,
      missionsTotal,
    };
  }
}

export class TodoActionRepository extends EntityRepository<TodoAction> {
  async findByMission(missionId: number, userId: number): Promise<TodoAction[]> {
    return this.find({ mission: { id: missionId, user: userId } }, { orderBy: { deadline: 'ASC' } });
  }

  async createAction(
    missionId: number,
    data: CreateActionData,
    userId: number,
  ): Promise<TodoAction | null> {
    const mission = await this.em.findOne(Todo, { id: missionId, user: userId });
    if (!mission) {
      return null;
    }

    const action = this.create({
      title: data.title.trim(),
      deadline: data.deadline ? data.deadline.trim() : null,
      isDone: data.isDone ?? false,
      mission,
    });
    await this.em.flush();
    return action;
  }

  async toggleAction(id: number, userId: number): Promise<TodoAction | null> {
    const action = await this.findOne({ id, mission: { user: userId } });
    if (!action) {
      return null;
    }

    action.isDone = !action.isDone;
    await this.em.flush();
    return action;
  }

  async updateAction(id: number, data: UpdateActionData, userId: number): Promise<TodoAction | null> {
    const action = await this.findOne({ id, mission: { user: userId } });
    if (!action) {
      return null;
    }

    this.assign(action, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.deadline !== undefined
        ? { deadline: data.deadline ? data.deadline.trim() : null }
        : {}),
      ...(data.isDone !== undefined ? { isDone: data.isDone } : {}),
    });

    await this.em.flush();
    return action;
  }

  async deleteAction(id: number, userId: number): Promise<boolean> {
    const action = await this.findOne({ id, mission: { user: userId } });
    if (!action) {
      return false;
    }

    this.em.remove(action);
    await this.em.flush();
    return true;
  }
}

export class TodoDisciplineRepository extends EntityRepository<TodoDiscipline> {
  async findByMission(missionId: number, userId: number): Promise<TodoDiscipline[]> {
    return this.find(
      { mission: { id: missionId, user: userId } },
      { populate: ['history'], orderBy: { id: 'ASC' } },
    );
  }

  async createDiscipline(
    missionId: number,
    data: CreateDisciplineData,
    userId: number,
  ): Promise<TodoDiscipline | null> {
    const mission = await this.em.findOne(Todo, { id: missionId, user: userId });
    if (!mission) {
      return null;
    }

    const discipline = this.create({
      title: data.title.trim(),
      mission,
    });
    await this.em.flush();
    return discipline;
  }

  async recordHistory(
    disciplineId: number,
    date: string,
    isDone: boolean,
    userId: number,
  ): Promise<DisciplineHistory | null> {
    const discipline = await this.findOne({ id: disciplineId, mission: { user: userId } });
    if (!discipline) {
      return null;
    }

    const dayPrefix = date.slice(0, 10);
    const existing = await this.em.findOne(DisciplineHistory, {
      discipline: discipline.id,
      date: { $like: `${dayPrefix}%` },
    });

    if (existing) {
      existing.isDone = isDone;
      existing.date = date;
      await this.em.flush();
      return existing;
    }

    const history = this.em.create(DisciplineHistory, {
      date,
      isDone,
      discipline,
    });
    await this.em.flush();
    return history;
  }

  async deleteDiscipline(id: number, userId: number): Promise<boolean> {
    const discipline = await this.findOne({ id, mission: { user: userId } });
    if (!discipline) {
      return false;
    }

    this.em.remove(discipline);
    await this.em.flush();
    return true;
  }
}
