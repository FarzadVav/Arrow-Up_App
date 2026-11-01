import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {
  User,
  Todo,
  TodoAction,
  TodoDiscipline,
  DisciplineHistory,
  Journal,
} from '../entities';
import {
  SEED_USER,
  SEED_TODOS,
  SEED_JOURNALS,
} from './seedData';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Starting Database Seeding...');

    // 1. Create or load Demo User
    let user = await em.findOne(User, { username: SEED_USER.username });
    if (!user) {
      user = em.create(User, {
        username: SEED_USER.username,
        password: SEED_USER.password,
        email: SEED_USER.email,
        locale: SEED_USER.locale,
        colorScheme: SEED_USER.colorScheme,
      });
      em.persist(user);
      console.log(`👤 Created user: ${user.username}`);
    } else {
      console.log(`👤 Using existing user: ${user.username}`);
    }

    // Clear previous items for clean idempotent test seeding
    const existingTodos = await em.find(Todo, { user });
    if (existingTodos.length > 0) {
      em.remove(existingTodos);
    }

    const existingJournals = await em.find(Journal, { user });
    if (existingJournals.length > 0) {
      em.remove(existingJournals);
    }

    await em.flush();

    // 2. Seed Todos & Missions
    let totalActions = 0;
    let totalDisciplines = 0;
    let totalHistory = 0;

    for (const todoData of SEED_TODOS) {
      const { actions, disciplines, ...mainTodo } = todoData;
      const todo = em.create(Todo, {
        ...mainTodo,
        user,
      });

      if (actions && actions.length > 0) {
        for (const act of actions) {
          const action = em.create(TodoAction, {
            title: act.title,
            deadline: act.deadline,
            isDone: act.isDone,
            mission: todo,
          });
          todo.actions.add(action);
          totalActions++;
        }
      }

      if (disciplines && disciplines.length > 0) {
        for (const disc of disciplines) {
          const discipline = em.create(TodoDiscipline, {
            title: disc.title,
            mission: todo,
          });
          todo.disciplines.add(discipline);
          totalDisciplines++;

          if (disc.history && disc.history.length > 0) {
            for (const hist of disc.history) {
              const historyLog = em.create(DisciplineHistory, {
                date: hist.date,
                isDone: hist.isDone,
                discipline,
              });
              discipline.history.add(historyLog);
              totalHistory++;
            }
          }
        }
      }

      em.persist(todo);
    }
    console.log(
      `🎯 Seeded ${SEED_TODOS.length} Todos/Missions (${totalActions} actions, ${totalDisciplines} disciplines, ${totalHistory} history records)`,
    );

    // 3. Seed Journals
    for (const journalData of SEED_JOURNALS) {
      const journal = em.create(Journal, {
        title: journalData.title,
        content: journalData.content,
        type: journalData.type,
        createdAt: journalData.createdAt,
        user,
      });
      em.persist(journal);
    }
    console.log(`📖 Seeded ${SEED_JOURNALS.length} Journal entries across 6 categories`);

    // Flush all seeded entities
    await em.flush();
    console.log('✨ All seed data successfully committed to PostgreSQL database!');
  }
}

export default DatabaseSeeder;
