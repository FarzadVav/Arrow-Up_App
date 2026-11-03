import crypto from 'node:crypto';
import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {
  User,
  LifeArea,
  Todo,
  TodoAction,
  TodoDiscipline,
  DisciplineHistory,
  Journal,
  JournalCategory,
  JournalTag,
  Habit,
  HabitTag,
  HabitHistory,
  Skill,
  SkillTag,
} from '../entities';
import {
  SEED_USER,
  SEED_LIFE_AREAS,
  SEED_FRAMEWORK_TAGS,
  SEED_FRAMEWORKS,
  SEED_SKILL_TAGS,
  SEED_SKILLS,
  SEED_TODOS,
  SEED_JOURNALS,
} from './seedData';
import { STATIC_JOURNAL_CATEGORIES } from '@/features/journals/lib/constants';

function hashSeedPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Starting Database Seeding...');
    const conn = em.getConnection();

    // =========================================================================
    // 0. Clear Database before Seed (Clean Slate)
    // =========================================================================
    console.log('🧹 Clearing all data from database before seeding...');

    try {
      const existingTables: Array<{ table_name: string }> = await conn.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE';
      `);

      const tableNames = existingTables
        .map((t) => t.table_name)
        .filter((name) => !name.includes('migration'));

      if (tableNames.length > 0) {
        const quoted = tableNames.map((name) => `"${name}"`).join(', ');
        await conn.execute(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
        console.log(`🗑️ Truncated ${tableNames.length} tables with RESTART IDENTITY CASCADE.`);
      }
    } catch (clearErr) {
      console.warn('⚠️ Notice during database clear:', (clearErr as Error).message);
    }

    em.clear();

    // =========================================================================
    // 1. Seed Static Journal Categories and Tags (Fixed IDs 1..4 and 1..20)
    // =========================================================================
    for (const catDef of STATIC_JOURNAL_CATEGORIES) {
      const cat = em.create(JournalCategory, {
        id: catDef.id,
        slug: catDef.slug,
        nameEn: catDef.nameEn,
        nameFa: catDef.nameFa,
        sortNumber: catDef.sortNumber,
      });
      em.persist(cat);

      for (const tagDef of catDef.tags) {
        const tag = em.create(JournalTag, {
          id: tagDef.id,
          slug: tagDef.slug,
          nameEn: tagDef.nameEn,
          nameFa: tagDef.nameFa,
          sortNumber: tagDef.sortNumber,
          category: cat,
        });
        em.persist(tag);
      }
    }
    await em.flush();

    try {
      await conn.execute(
        `SELECT setval(pg_get_serial_sequence('journal_categories', 'id'), coalesce(max(id), 1)) FROM "journal_categories";`,
      );
      await conn.execute(
        `SELECT setval(pg_get_serial_sequence('journal_tags', 'id'), coalesce(max(id), 1)) FROM "journal_tags";`,
      );
    } catch {
      // Sequence adjust fallback
    }
    console.log('🏷️ Seeded static journal categories and tags.');

    // =========================================================================
    // 2. Seed Demo User
    // =========================================================================
    const hashedPassword = hashSeedPassword(SEED_USER.password);
    const user = em.create(User, {
      username: SEED_USER.username,
      password: hashedPassword,
      email: SEED_USER.email,
      locale: SEED_USER.locale,
      colorScheme: SEED_USER.colorScheme,
    });
    em.persist(user);
    await em.flush();
    console.log(`👤 Created user: ${user.username} (ID: ${user.id})`);

    // =========================================================================
    // 3. Seed Default Life Areas (lifestyle, health, career, social connections)
    // =========================================================================
    const lifeAreasByKey = new Map<string, LifeArea>();

    for (const def of SEED_LIFE_AREAS) {
      const localizedTitle = user.locale === 'fa' ? def.titleFa : def.titleEn;
      const area = em.create(LifeArea, {
        title: localizedTitle,
        vision: def.vision,
        active: true,
        difficulty: def.difficulty,
        user,
      });
      em.persist(area);
      lifeAreasByKey.set(def.key, area);
    }
    await em.flush();
    console.log(`🌐 Seeded ${SEED_LIFE_AREAS.length} default life areas.`);

    // =========================================================================
    // 4. Seed Framework Tags & Frameworks (Habits)
    // =========================================================================
    const habitTagsByKey = new Map<string, HabitTag>();

    for (const tagDef of SEED_FRAMEWORK_TAGS) {
      const lifeArea = lifeAreasByKey.get(tagDef.lifeAreaKey);
      const tag = em.create(HabitTag, {
        title: tagDef.title,
        lifeArea,
        user,
      });
      em.persist(tag);
      habitTagsByKey.set(tagDef.key, tag);
    }
    await em.flush();

    let totalFrameworkHistory = 0;
    for (let i = 0; i < SEED_FRAMEWORKS.length; i++) {
      const fwData = SEED_FRAMEWORKS[i];
      const lifeArea = fwData.lifeAreaKey ? lifeAreasByKey.get(fwData.lifeAreaKey) : undefined;
      const tag = fwData.tagKey ? habitTagsByKey.get(fwData.tagKey) : undefined;

      const framework = em.create(Habit, {
        title: fwData.title,
        description: fwData.description,
        sortNumber: i + 1,
        lifeArea,
        tag,
        user,
      });

      if (fwData.history && fwData.history.length > 0) {
        for (const hist of fwData.history) {
          const historyEntry = em.create(HabitHistory, {
            date: hist.date,
            isDone: hist.isDone,
            habit: framework,
          });
          framework.history.add(historyEntry);
          totalFrameworkHistory++;
        }
      }

      em.persist(framework);
    }
    await em.flush();
    console.log(
      `🧱 Seeded ${SEED_FRAMEWORKS.length} Frameworks (${SEED_FRAMEWORK_TAGS.length} tags, ${totalFrameworkHistory} history records, including 1 abandoned framework)`,
    );

    // =========================================================================
    // 5. Seed Skill Tags & Skills
    // =========================================================================
    const skillTagsByKey = new Map<string, SkillTag>();

    for (const tagDef of SEED_SKILL_TAGS) {
      const lifeArea = lifeAreasByKey.get(tagDef.lifeAreaKey);
      const tag = em.create(SkillTag, {
        title: tagDef.title,
        lifeArea,
        user,
      });
      em.persist(tag);
      skillTagsByKey.set(tagDef.key, tag);
    }
    await em.flush();

    for (let i = 0; i < SEED_SKILLS.length; i++) {
      const skillData = SEED_SKILLS[i];
      const lifeArea = skillData.lifeAreaKey ? lifeAreasByKey.get(skillData.lifeAreaKey) : undefined;
      const tag = skillData.tagKey ? skillTagsByKey.get(skillData.tagKey) : undefined;

      const skill = em.create(Skill, {
        title: skillData.title,
        content: skillData.content,
        sortNumber: i + 1,
        lifeArea,
        tag,
        user,
      });
      em.persist(skill);
    }
    await em.flush();
    console.log(
      `💡 Seeded ${SEED_SKILLS.length} Skills (${SEED_SKILL_TAGS.length} tags, including 1 abandoned skill)`,
    );

    // =========================================================================
    // 6. Seed Todos & Missions
    // =========================================================================
    let totalActions = 0;
    let totalDisciplines = 0;
    let totalTodoHistory = 0;

    for (let i = 0; i < SEED_TODOS.length; i++) {
      const todoData = SEED_TODOS[i];
      const { actions, disciplines, lifeAreaKey, ...mainTodo } = todoData;
      const lifeArea = lifeAreaKey ? lifeAreasByKey.get(lifeAreaKey) : undefined;

      const todo = em.create(Todo, {
        ...mainTodo,
        sortNumber: i + 1,
        lifeArea,
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
              totalTodoHistory++;
            }
          }
        }
      }

      em.persist(todo);
    }
    await em.flush();
    console.log(
      `🎯 Seeded ${SEED_TODOS.length} Todos/Missions (${totalActions} actions, ${totalDisciplines} disciplines, ${totalTodoHistory} history records)`,
    );

    // =========================================================================
    // 7. Seed Journals across all Static Categories & Tags
    // =========================================================================
    for (let i = 0; i < SEED_JOURNALS.length; i++) {
      const journalData = SEED_JOURNALS[i];
      const category = await em.findOneOrFail(JournalCategory, { slug: journalData.categorySlug });
      const tag = await em.findOneOrFail(JournalTag, { slug: journalData.tagSlug });

      const journal = em.create(Journal, {
        title: journalData.title,
        content: journalData.content,
        sortNumber: i + 1,
        category,
        tag,
        createdAt: journalData.createdAt,
        user,
      });
      em.persist(journal);
    }
    await em.flush();
    console.log(`📖 Seeded ${SEED_JOURNALS.length} Journal entries across static categories and tags.`);

    // =========================================================================
    // 8. Align All Primary Key Sequences to max(id)
    // =========================================================================
    const allTables = [
      'users',
      'life_areas',
      'habit_tags',
      'habits',
      'habit_history',
      'skill_tags',
      'skills',
      'todos',
      'todo_actions',
      'todo_disciplines',
      'discipline_history',
      'journal_categories',
      'journal_tags',
      'journals',
    ];

    for (const table of allTables) {
      try {
        await conn.execute(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), coalesce(max(id), 1)) FROM "${table}";`,
        );
      } catch {
        // Table or sequence may not have a serial generator
      }
    }

    console.log('✨ All seed data successfully cleared, repopulated, and committed to PostgreSQL database!');
  }
}

export default DatabaseSeeder;
