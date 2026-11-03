import 'reflect-metadata';
import path from 'node:path';
import { defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
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
  Habit,
  HabitHistory,
  HabitTag,
} from './entities';

// Connection string lives in .env.local only — it embeds a live database password.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Next loads .env.local automatically; CLI scripts under db/scripts load it via ./load-env.',
  );
}

export const config = defineConfig({
  clientUrl: connectionString,
  schema: 'public',
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
    ignoreSchema: [
      'auth',
      'storage',
      'realtime',
      'vault',
      'extensions',
      'graphql',
      'graphql_public',
      'pgbouncer',
      'pg_catalog',
      'information_schema',
      'pgsodium',
      'pgsodium_masks',
    ],
    ignoreTriggers: true,
    ignoreRoutines: true,
  },
  driverOptions: {
    ssl: { rejectUnauthorized: false },
  },
  entities: [
    User,
    Todo,
    TodoAction,
    TodoDiscipline,
    DisciplineHistory,
    Journal,
    JournalCategory,
    JournalTag,
    LifeArea,
    Habit,
    HabitHistory,
    HabitTag,
  ],
  extensions: [SeedManager],
  allowGlobalContext: true,
  debug: process.env.NODE_ENV === 'development',
  seeder: {
    path: path.resolve(process.cwd(), 'db', 'seeders'),
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
  },
});

export default config;
