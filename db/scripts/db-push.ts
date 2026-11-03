import 'reflect-metadata';
import './load-env';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';
import { STATIC_JOURNAL_CATEGORIES } from '../../features/journals/lib/constants';
import { DEFAULT_LIFE_AREAS, getDefaultLifeAreaTitle } from '../../features/life-areas/lib/constants';

async function seedStaticCategoriesAndTags(orm: MikroORM) {
  const conn = orm.em.getConnection();

  // 1. Create tables if they don't exist yet so migration can reference them
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS "journal_categories" (
      "id" serial PRIMARY KEY,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "slug" varchar(255) NOT NULL UNIQUE,
      "name_en" varchar(255) NOT NULL,
      "name_fa" varchar(255) NOT NULL,
      "sort_number" int NOT NULL DEFAULT 0
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS "journal_tags" (
      "id" serial PRIMARY KEY,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "slug" varchar(255) NOT NULL,
      "name_en" varchar(255) NOT NULL,
      "name_fa" varchar(255) NOT NULL,
      "sort_number" int NOT NULL DEFAULT 0,
      "category_id" int NOT NULL REFERENCES "journal_categories"("id") ON DELETE CASCADE
    );
  `);

  // Ensure missing columns exist and legacy constraints are dropped
  try {
    await conn.execute(`ALTER TABLE "journal_tags" DROP CONSTRAINT IF EXISTS "journal_tags_user_id_foreign";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP CONSTRAINT IF EXISTS "journal_tags_user_id_title_unique";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP CONSTRAINT IF EXISTS "journal_tags_user_id_title_category_unique";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP CONSTRAINT IF EXISTS "journal_tags_category_check";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP COLUMN IF EXISTS "user_id";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP COLUMN IF EXISTS "title";`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP COLUMN IF EXISTS "category";`);
    await conn.execute(`ALTER TABLE "journal_tags" ADD COLUMN IF NOT EXISTS "slug" varchar(255);`);
    await conn.execute(`ALTER TABLE "journal_tags" ADD COLUMN IF NOT EXISTS "name_en" varchar(255);`);
    await conn.execute(`ALTER TABLE "journal_tags" ADD COLUMN IF NOT EXISTS "name_fa" varchar(255);`);
    await conn.execute(`ALTER TABLE "journal_tags" ADD COLUMN IF NOT EXISTS "sort_number" int DEFAULT 0;`);
    await conn.execute(`ALTER TABLE "journal_tags" ADD COLUMN IF NOT EXISTS "category_id" int;`);
  } catch {
    // Column alter safety
  }

  // 2. Upsert static categories
  for (const cat of STATIC_JOURNAL_CATEGORIES) {
    await conn.execute(
      `
      INSERT INTO "journal_categories" ("id", "slug", "name_en", "name_fa", "sort_number", "created_at", "updated_at")
      VALUES (?, ?, ?, ?, ?, now(), now())
      ON CONFLICT ("id") DO UPDATE SET
        "slug" = EXCLUDED."slug",
        "name_en" = EXCLUDED."name_en",
        "name_fa" = EXCLUDED."name_fa",
        "sort_number" = EXCLUDED."sort_number",
        "updated_at" = now();
    `,
      [cat.id, cat.slug, cat.nameEn, cat.nameFa, cat.sortNumber],
    );
  }

  // 3. Upsert static tags
  for (const cat of STATIC_JOURNAL_CATEGORIES) {
    for (const tag of cat.tags) {
      await conn.execute(
        `
        INSERT INTO "journal_tags" ("id", "slug", "name_en", "name_fa", "sort_number", "category_id", "created_at", "updated_at")
        VALUES (?, ?, ?, ?, ?, ?, now(), now())
        ON CONFLICT ("id") DO UPDATE SET
          "slug" = EXCLUDED."slug",
          "name_en" = EXCLUDED."name_en",
          "name_fa" = EXCLUDED."name_fa",
          "sort_number" = EXCLUDED."sort_number",
          "category_id" = EXCLUDED."category_id",
          "updated_at" = now();
      `,
        [tag.id, tag.slug, tag.nameEn, tag.nameFa, tag.sortNumber, cat.id],
      );
    }
  }

  // Clean up any obsolete tags that don't belong to static list
  await conn.execute(`DELETE FROM "journal_tags" WHERE "slug" IS NULL OR "id" > 20;`);

  // Reset sequences if needed
  try {
    await conn.execute(`SELECT setval(pg_get_serial_sequence('journal_categories', 'id'), coalesce(max(id), 1)) FROM "journal_categories";`);
    await conn.execute(`SELECT setval(pg_get_serial_sequence('journal_tags', 'id'), coalesce(max(id), 1)) FROM "journal_tags";`);
  } catch {
    // Ignore sequence adjust error
  }
}

async function preMigrateJournals(orm: MikroORM) {
  const conn = orm.em.getConnection();

  // Drop obsolete framework_items table
  await conn.execute('DROP TABLE IF EXISTS "framework_items" CASCADE;');

  // Check if journals table exists
  try {
    const res = await conn.execute(`SELECT 1 FROM information_schema.tables WHERE table_name = 'journals';`);
    if (res.length === 0) return;

    // Migrate any legacy 'Lessons' or 'Ideas' journals
    await conn.execute(`UPDATE "journals" SET "type" = 'Notes' WHERE "type"::text = 'Lessons';`);
    await conn.execute(`UPDATE "journals" SET "type" = 'Thoughts' WHERE "type"::text = 'Ideas';`);

    // Ensure category_id and tag_id exist in journals
    await conn.execute(`ALTER TABLE "journals" ADD COLUMN IF NOT EXISTS "category_id" int;`);
    await conn.execute(`ALTER TABLE "journals" ADD COLUMN IF NOT EXISTS "tag_id" int;`);

    // Backfill category_id from legacy type column if present
    try {
      await conn.execute(`
        UPDATE "journals" SET "category_id" = CASE
          WHEN "type"::text = 'Thoughts' THEN 2
          WHEN "type"::text = 'Feelings' THEN 3
          WHEN "type"::text = 'Notes' THEN 4
          ELSE 1
        END
        WHERE "category_id" IS NULL;
      `);
    } catch {
      await conn.execute(`UPDATE "journals" SET "category_id" = 1 WHERE "category_id" IS NULL;`);
    }

    // Backfill tag_id: default to first tag of the respective category
    await conn.execute(`UPDATE "journals" SET "tag_id" = 1 WHERE "category_id" = 1 AND ("tag_id" IS NULL OR "tag_id" > 20);`);
    await conn.execute(`UPDATE "journals" SET "tag_id" = 7 WHERE "category_id" = 2 AND ("tag_id" IS NULL OR "tag_id" > 20);`);
    await conn.execute(`UPDATE "journals" SET "tag_id" = 13 WHERE "category_id" = 3 AND ("tag_id" IS NULL OR "tag_id" > 20);`);
    await conn.execute(`UPDATE "journals" SET "tag_id" = 17 WHERE "category_id" = 4 AND ("tag_id" IS NULL OR "tag_id" > 20);`);
    await conn.execute(`UPDATE "journals" SET "tag_id" = 1 WHERE "tag_id" IS NULL OR "tag_id" > 20;`);

    // Drop old enum / string columns if they exist
    await conn.execute(`ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journals_type_check";`);
    await conn.execute(`ALTER TABLE "journals" DROP COLUMN IF EXISTS "type";`);
    await conn.execute(`ALTER TABLE "journals" DROP COLUMN IF EXISTS "tag";`);
    console.log('🔄 Pre-migrated journals to category_id and tag_id foreign keys.');
  } catch (err) {
    console.warn('⚠️ Notice during pre-migration check:', (err as Error).message);
  }
}

async function preMigrateRelations(orm: MikroORM) {
  const conn = orm.em.getConnection();

  // 1. Ensure journals foreign keys allow null and have ON DELETE SET NULL
  try {
    await conn.execute(`ALTER TABLE "journals" ALTER COLUMN "category_id" DROP NOT NULL;`);
    await conn.execute(`ALTER TABLE "journals" ALTER COLUMN "tag_id" DROP NOT NULL;`);
    await conn.execute(`ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journals_category_id_foreign";`);
    await conn.execute(`
      ALTER TABLE "journals"
      ADD CONSTRAINT "journals_category_id_foreign"
      FOREIGN KEY ("category_id") REFERENCES "journal_categories"("id") ON DELETE SET NULL;
    `);
    await conn.execute(`ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journals_tag_id_foreign";`);
    await conn.execute(`
      ALTER TABLE "journals"
      ADD CONSTRAINT "journals_tag_id_foreign"
      FOREIGN KEY ("tag_id") REFERENCES "journal_tags"("id") ON DELETE SET NULL;
    `);
    console.log('🔄 Updated journals foreign keys to ON DELETE SET NULL.');
  } catch (err) {
    console.warn('⚠️ Notice during journals relation update:', (err as Error).message);
  }

  // 2. Ensure journal_tags category foreign key allows null and has ON DELETE SET NULL
  try {
    await conn.execute(`ALTER TABLE "journal_tags" ALTER COLUMN "category_id" DROP NOT NULL;`);
    await conn.execute(`ALTER TABLE "journal_tags" DROP CONSTRAINT IF EXISTS "journal_tags_category_id_foreign";`);
    await conn.execute(`
      ALTER TABLE "journal_tags"
      ADD CONSTRAINT "journal_tags_category_id_foreign"
      FOREIGN KEY ("category_id") REFERENCES "journal_categories"("id") ON DELETE SET NULL;
    `);
    console.log('🔄 Updated journal_tags foreign keys to ON DELETE SET NULL.');
  } catch (err) {
    console.warn('⚠️ Notice during journal_tags relation update:', (err as Error).message);
  }

  // 3. Drop obsolete skills tables (the Skills feature was removed)
  await conn.execute('DROP TABLE IF EXISTS "skills" CASCADE;');
  await conn.execute('DROP TABLE IF EXISTS "skill_tags" CASCADE;');

  // 4. Migrate habits: tag varchar to tag_id integer foreign key
  try {
    await conn.execute(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'habits' AND column_name = 'tag' AND data_type LIKE '%char%'
        ) THEN
          ALTER TABLE "habits" DROP COLUMN "tag";
        END IF;
      END $$;
    `);
    await conn.execute(`ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "tag_id" int;`);
    await conn.execute(`ALTER TABLE "habits" DROP CONSTRAINT IF EXISTS "habits_tag_id_foreign";`);
    await conn.execute(`
      ALTER TABLE "habits"
      ADD CONSTRAINT "habits_tag_id_foreign"
      FOREIGN KEY ("tag_id") REFERENCES "habit_tags"("id") ON DELETE SET NULL;
    `);
    console.log('🔄 Updated habits tag_id relation to ON DELETE SET NULL.');
  } catch (err) {
    console.warn('⚠️ Notice during habits relation update:', (err as Error).message);
  }

  // 5. Ensure all life_area_id foreign keys allow null and have ON DELETE SET NULL
  const lifeAreaTables = [
    { table: 'todos', constraint: 'todos_life_area_id_foreign' },
    { table: 'habits', constraint: 'habits_life_area_id_foreign' },
    { table: 'habit_tags', constraint: 'habit_tags_life_area_id_foreign' },
  ];

  for (const { table, constraint } of lifeAreaTables) {
    try {
      const tableCheck = await conn.execute(`SELECT 1 FROM information_schema.tables WHERE table_name = ?;`, [table]);
      if (tableCheck.length > 0) {
        await conn.execute(`ALTER TABLE "${table}" ALTER COLUMN "life_area_id" DROP NOT NULL;`);
        await conn.execute(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint}";`);
        await conn.execute(`
          ALTER TABLE "${table}"
          ADD CONSTRAINT "${constraint}"
          FOREIGN KEY ("life_area_id") REFERENCES "life_areas"("id") ON DELETE SET NULL;
        `);
        console.log(`🔄 Updated ${table}.life_area_id to ON DELETE SET NULL.`);
      }
    } catch (err) {
      console.warn(`⚠️ Notice during ${table} life_area relation update:`, (err as Error).message);
    }
  }
}

async function ensureDefaultLifeAreasForUsers(orm: MikroORM) {
  const conn = orm.em.getConnection();

  try {
    const tableRes = await conn.execute(`SELECT 1 FROM information_schema.tables WHERE table_name = 'life_areas';`);
    if (tableRes.length === 0) return;

    const users: Array<{ id: number; locale?: string }> = await conn.execute(`SELECT id, locale FROM users;`);

    for (const u of users) {
      const existing: Array<{ id: number; title: string }> = await conn.execute(
        `SELECT id, title FROM life_areas WHERE user_id = ?;`,
        [u.id],
      );

      const existingTitles = new Set(existing.map((a) => a.title.toLowerCase().trim()));
      const userLocale = u.locale ?? 'fa';

      for (const def of DEFAULT_LIFE_AREAS) {
        const localizedTitle = getDefaultLifeAreaTitle(def, userLocale);
        const hasEn = existingTitles.has(def.nameEn.toLowerCase().trim());
        const hasFa = existingTitles.has(def.nameFa.toLowerCase().trim());
        const hasKey = existingTitles.has(def.key.toLowerCase().trim());

        if (!hasEn && !hasFa && !hasKey) {
          await conn.execute(
            `INSERT INTO life_areas (title, vision, active, difficulty, user_id, created_at, updated_at)
             VALUES (?, '', true, ?, ?, now(), now());`,
            [localizedTitle, def.defaultDifficulty, u.id],
          );
          console.log(`🌱 Created default life area "${localizedTitle}" for user ID ${u.id}`);
        }
      }
    }

    try {
      await conn.execute(`SELECT setval(pg_get_serial_sequence('life_areas', 'id'), coalesce(max(id), 1)) FROM life_areas;`);
    } catch {
      // ignore sequence adjust error
    }
  } catch (err) {
    console.warn('⚠️ Notice during ensureDefaultLifeAreasForUsers:', (err as Error).message);
  }
}

async function dbPush() {
  console.log('🔄 Running db:push (PostgreSQL Schema Synchronization)...');

  const orm = await MikroORM.init(config);

  try {
    // 1. Seed or ensure static journal categories and tags
    await seedStaticCategoriesAndTags(orm);
    console.log('🏷️ Static journal categories and tags initialized.');

    // 2. Pre-migrate legacy data in journals
    await preMigrateJournals(orm);

    // 2.1 Pre-migrate relations: ensure ON DELETE SET NULL on life_area, category, and tag FKs
    await preMigrateRelations(orm);

    // 3. Schema update
    const generator = orm.schema;
    const updateDump = await generator.getUpdateSchemaSQL({ wrap: false, dropTables: true });

    if (!updateDump.trim()) {
      console.log('✅ Database schema is already up to date! No changes needed.');
    } else {
      console.log('🔨 Applying schema changes to PostgreSQL:');
      console.log(updateDump.trim());
      await generator.update({ dropTables: true });
      console.log('✨ Database schema successfully synchronized!');
    }

    // 4. Re-ensure static entries after update
    await seedStaticCategoriesAndTags(orm);
    console.log('✅ Static journal categories and tags verified.');

    // 5. Ensure all users have default life areas
    await ensureDefaultLifeAreasForUsers(orm);
    console.log('🌐 Default life areas checked/initialized for users.');
  } catch (error) {
    console.error('❌ Failed to push schema to PostgreSQL:', error);
    process.exit(1);
  } finally {
    await orm.close(true);
  }
}

dbPush().catch((err) => {
  console.error('❌ Fatal error in db:push:', err);
  process.exit(1);
});
