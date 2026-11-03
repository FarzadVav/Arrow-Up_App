import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { User } from '@/db/entities/User';
import { LifeArea } from '@/db/entities/LifeArea';
import { HabitTag } from '@/db/entities/HabitTag';
import { HabitHistory } from '@/db/entities/HabitHistory';
import { assertOwnedLifeAreas } from '@/features/general/api/repository';
import type { Habit } from '@/db/entities/Habit';
import type {
  CreateFrameworkData,
  UpdateFrameworkData,
  Framework as FrameworkDto,
  CreateFrameworkTagData,
  UpdateFrameworkTagData,
  FrameworkTag as FrameworkTagDto,
} from '../lib/types';

export type {
  CreateFrameworkData,
  UpdateFrameworkData,
  CreateFrameworkTagData,
  UpdateFrameworkTagData,
};

export function serializeFramework(habit: Habit): FrameworkDto {
  const historyList = habit.history?.isInitialized?.()
    ? habit.history.getItems().map((h) => ({
        id: h.id,
        date: h.date,
        isDone: h.isDone,
      }))
    : [];

  const tagTitle = habit.tag && typeof habit.tag === 'object' && 'title' in habit.tag ? habit.tag.title : null;
  const tagId = habit.tag && typeof habit.tag === 'object' && 'id' in habit.tag ? habit.tag.id : null;

  return {
    id: habit.id,
    title: habit.title,
    description: habit.description || '',
    lifeAreaId: habit.lifeArea?.id ?? null,
    lifeArea: habit.lifeArea
      ? {
          id: habit.lifeArea.id,
          title: habit.lifeArea.title,
        }
      : undefined,
    tagId,
    tag: tagTitle,
    history: historyList,
    createdAt:
      habit.createdAt instanceof Date
        ? habit.createdAt.toISOString()
        : String(habit.createdAt),
    updatedAt:
      habit.updatedAt instanceof Date
        ? habit.updatedAt.toISOString()
        : String(habit.updatedAt),
    deletedAt:
      habit.deletedAt instanceof Date
        ? habit.deletedAt.toISOString()
        : habit.deletedAt
          ? String(habit.deletedAt)
          : null,
  };
}

export function serializeFrameworkTag(tag: HabitTag): FrameworkTagDto {
  return {
    id: tag.id,
    title: tag.title,
    lifeAreaId: tag.lifeArea?.id ?? null,
    createdAt:
      tag.createdAt instanceof Date
        ? tag.createdAt.toISOString()
        : String(tag.createdAt),
    updatedAt:
      tag.updatedAt instanceof Date
        ? tag.updatedAt.toISOString()
        : String(tag.updatedAt),
  };
}

export class FrameworkRepository extends EntityRepository<Habit> {
  async findAllFrameworks(
    userId: number,
    options?: { lifeAreaId?: number | null },
  ): Promise<Habit[]> {
    const where: FilterQuery<Habit> = { user: userId, deletedAt: null };
    if (options?.lifeAreaId !== undefined) {
      where.lifeArea = options.lifeAreaId;
    }

    return this.find(where, {
      populate: ['lifeArea', 'tag', 'history'],
      orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
    });
  }

  async findById(id: number, userId: number): Promise<Habit | null> {
    return this.findOne({ id, user: userId, deletedAt: null }, { populate: ['lifeArea', 'tag', 'history'] });
  }

  async createFramework(data: CreateFrameworkData, userId: number): Promise<Habit> {
    await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId]);

    let tagEntity: HabitTag | null = null;
    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId) {
      tagEntity = await this.em.findOne(HabitTag, { id: rawTagId, user: userId }) ?? null;
    } else if (typeof data.tag === 'string' && data.tag.trim()) {
      tagEntity = await this.em.findOne(HabitTag, { title: data.tag.trim(), user: userId }) ?? null;
    }

    if (!tagEntity) {
      throw new Error('Tag is required for framework');
    }

    const habit = this.create({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      tag: tagEntity,
      lifeArea: this.em.getReference(LifeArea, data.lifeAreaId),
      user: this.em.getReference(User, userId),
    });

    await this.em.flush();
    await this.em.populate(habit, ['lifeArea', 'tag', 'history']);
    return habit;
  }

  async updateFramework(
    id: number,
    data: UpdateFrameworkData,
    userId: number,
  ): Promise<Habit | null> {
    const habit = await this.findOne({ id, user: userId }, { populate: ['lifeArea', 'tag', 'history'] });
    if (!habit) {
      return null;
    }

    if (data.lifeAreaId !== undefined) {
      await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId], {
        keepInactiveId: habit.lifeArea?.id ?? null,
      });
    }

    if (data.title !== undefined) {
      habit.title = data.title.trim();
    }
    if (data.description !== undefined) {
      habit.description = data.description.trim();
    }

    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId !== undefined) {
      const foundTag = rawTagId ? (await this.em.findOne(HabitTag, { id: rawTagId, user: userId }) ?? null) : null;
      if (!foundTag) {
        throw new Error('Tag is required for framework');
      }
      habit.tag = foundTag;
    } else if (typeof data.tag === 'string') {
      const foundTag = data.tag.trim() ? (await this.em.findOne(HabitTag, { title: data.tag.trim(), user: userId }) ?? null) : null;
      if (!foundTag) {
        throw new Error('Tag is required for framework');
      }
      habit.tag = foundTag;
    }

    if (data.lifeAreaId !== undefined) {
      if (!data.lifeAreaId || data.lifeAreaId <= 0) {
        throw new Error('Life area is required for framework');
      }
      habit.lifeArea = this.em.getReference(LifeArea, data.lifeAreaId);
    }

    await this.em.flush();
    return habit;
  }

  async deleteFramework(id: number, userId: number): Promise<boolean> {
    const habit = await this.findOne({ id, user: userId });
    if (!habit) {
      return false;
    }

    habit.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  async restoreFramework(id: number, userId: number): Promise<boolean> {
    const habit = await this.findOne({ id, user: userId, deletedAt: { $ne: null } });
    if (!habit) {
      return false;
    }

    habit.deletedAt = null;
    await this.em.flush();
    return true;
  }

  async hardDeleteFramework(id: number, userId: number): Promise<boolean> {
    const habit = await this.findOne({ id, user: userId });
    if (!habit) {
      return false;
    }

    this.em.remove(habit);
    await this.em.flush();
    return true;
  }

  async findHistory(userId: number): Promise<Habit[]> {
    return this.find(
      { user: userId, deletedAt: { $ne: null } },
      {
        populate: ['lifeArea', 'tag', 'history'],
        orderBy: [{ deletedAt: 'DESC' }],
      },
    );
  }

  async recordHistory(
    habitId: number,
    date: string,
    isDone: boolean,
    userId: number,
  ): Promise<HabitHistory | null> {
    const habit = await this.findOne({ id: habitId, user: userId });
    if (!habit) {
      return null;
    }

    const dayPrefix = date.slice(0, 10);
    const existing = await this.em.findOne(HabitHistory, {
      habit: habit.id,
      date: { $like: `${dayPrefix}%` },
    });

    if (existing) {
      existing.isDone = isDone;
      existing.date = date;
      await this.em.flush();
      return existing;
    }

    const history = this.em.create(HabitHistory, {
      date,
      isDone,
      habit,
    });

    await this.em.flush();
    return history;
  }
}

export class FrameworkTagRepository extends EntityRepository<HabitTag> {
  async findAllTags(userId: number): Promise<HabitTag[]> {
    return this.find({ user: userId }, { orderBy: { createdAt: 'DESC' } });
  }
  async findByLifeArea(lifeAreaId: number | null, userId: number): Promise<HabitTag[]> {
    return this.find(
      { lifeArea: lifeAreaId, user: userId },
      { orderBy: { title: 'ASC' } },
    );
  }

  async findByTitle(
    title: string,
    lifeAreaId: number | null,
    userId: number,
  ): Promise<HabitTag | null> {
    return this.findOne({
      title: title.trim(),
      lifeArea: lifeAreaId,
      user: userId,
    });
  }

  async findById(id: number, userId: number): Promise<HabitTag | null> {
    return this.findOne({ id, user: userId });
  }

  async createTag(
    data: CreateFrameworkTagData,
    userId: number,
  ): Promise<HabitTag> {
    await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId]);

    const tag = this.create({
      title: data.title.trim(),
      lifeArea: this.em.getReference(LifeArea, data.lifeAreaId),
      user: this.em.getReference(User, userId),
    });
    await this.em.flush();
    return tag;
  }

  async updateTag(
    id: number,
    data: UpdateFrameworkTagData,
    userId: number,
  ): Promise<HabitTag | null> {
    const tag = await this.findOne({ id, user: userId });
    if (!tag) {
      return null;
    }

    if (data.lifeAreaId !== undefined) {
      await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId], {
        keepInactiveId: tag.lifeArea?.id ?? null,
      });
    }

    const lifeArea =
      data.lifeAreaId !== undefined
        ? (data.lifeAreaId ? this.em.getReference(LifeArea, data.lifeAreaId) : undefined)
        : tag.lifeArea;

    this.assign(tag, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.lifeAreaId !== undefined ? { lifeArea } : {}),
    });

    await this.em.flush();
    return tag;
  }

  async deleteTag(id: number, userId: number): Promise<boolean> {
    const tag = await this.findOne({ id, user: userId });
    if (!tag) {
      return false;
    }

    this.em.remove(tag);
    await this.em.flush();
    return true;
  }
}
