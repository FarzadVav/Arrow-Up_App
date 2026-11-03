import 'reflect-metadata';
import {
  MikroORM,
  RequestContext,
  type Options,
  type EntityManager,
  type EntityRepository,
} from '@mikro-orm/postgresql';
import config from './mikro-orm.config';
import {
  User,
  Todo,
  TodoAction,
  TodoDiscipline,
  DisciplineHistory,
  Journal,
  JournalCategory,
  JournalTag,
  LifeArea,
  Skill,
  SkillTag,
  Habit,
  HabitHistory,
  HabitTag,
} from './entities';
import { UserRepository } from '@/features/auth/api/repository';
import {
  TodoRepository,
  TodoActionRepository,
  TodoDisciplineRepository,
} from '@/features/todos/api/repository';
import {
  JournalRepository,
  JournalTagRepository,
} from '@/features/journals/api/repository';
import { LifeAreaRepository } from '@/features/life-areas/api/repository';
import { SkillRepository, SkillTagRepository } from '@/features/skills/api/repository';
import {
  FrameworkRepository,
  FrameworkTagRepository,
} from '@/features/framework/api/repository';

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  user: UserRepository;
  todo: TodoRepository;
  todoAction: TodoActionRepository;
  todoDiscipline: TodoDisciplineRepository;
  disciplineHistory: EntityRepository<DisciplineHistory>;
  journal: JournalRepository;
  journalCategory: EntityRepository<JournalCategory>;
  journalTag: JournalTagRepository;
  lifeArea: LifeAreaRepository;
  skill: SkillRepository;
  skillTag: SkillTagRepository;
  framework: FrameworkRepository;
  frameworkTag: FrameworkTagRepository;
  frameworkHistory: EntityRepository<HabitHistory>;
}

declare global {
  var __mikro_orm_cache__: Services | undefined;
}

function createServices(orm: MikroORM, em: EntityManager): Services {
  return {
    orm,
    em,
    user: new UserRepository(em, User),
    todo: new TodoRepository(em, Todo),
    todoAction: new TodoActionRepository(em, TodoAction),
    todoDiscipline: new TodoDisciplineRepository(em, TodoDiscipline),
    disciplineHistory: em.getRepository(DisciplineHistory),
    journal: new JournalRepository(em, Journal),
    journalCategory: em.getRepository(JournalCategory),
    journalTag: new JournalTagRepository(em, JournalTag),
    lifeArea: new LifeAreaRepository(em, LifeArea),
    skill: new SkillRepository(em, Skill),
    skillTag: new SkillTagRepository(em, SkillTag),
    framework: new FrameworkRepository(em, Habit),
    frameworkTag: new FrameworkTagRepository(em, HabitTag),
    frameworkHistory: em.getRepository(HabitHistory),
  };
}

/**
 * Initializes and returns the MikroORM services singleton with custom feature repositories.
 */
export async function initORM(options?: Partial<Options>): Promise<Services> {
  if (globalThis.__mikro_orm_cache__) {
    return globalThis.__mikro_orm_cache__;
  }

  const orm = await MikroORM.init({
    ...config,
    ...options,
  });

  const services = createServices(orm, orm.em);

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__mikro_orm_cache__ = services;
  }

  return services;
}

/**
 * Runs a transactional unit of work inside an active MikroORM RequestContext.
 */
export async function withRequestContext<T>(
  callback: (services: Services) => Promise<T>,
): Promise<T> {
  const services = await initORM();

  return RequestContext.create(services.em, async () => {
    const forkEm = services.em.fork();
    const forkedServices = createServices(services.orm, forkEm);
    return callback(forkedServices);
  });
}
