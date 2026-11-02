import { EntityRepository } from '@mikro-orm/postgresql';
import type { User } from '@/db/entities';
import { verifyPassword, hashPassword } from '../lib/utils';
import type { CreateUserData, UpdateUserData } from '../lib/types';

export type { CreateUserData, UpdateUserData };

/**
 * The `*Self` methods take the acting user's id as their only identity input,
 * so there is no separate target id to forge — the row being read or written is
 * always the caller's own. Pre-session lookups (username/email/credentials) are
 * the only methods that accept an untrusted identifier.
 */
export class UserRepository extends EntityRepository<User> {
  async findSelf(actorId: number): Promise<User | null> {
    return this.findOne({ id: actorId });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  /**
   * Verifies username and password using the password verification utility.
   * Returns user if credentials match, otherwise null.
   */
  async verifyCredentials(username: string, password: string): Promise<User | null> {
    const cleanUsername = username.trim();
    const user = await this.findOne({ username: cleanUsername });
    if (!user || !user.password) {
      return null;
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Attempts to authenticate an existing user or creates a new user if not found.
   * - If user exists and password matches: returns { user, status: 'LOGGED_IN' }
   * - If user exists and password fails: returns { user: null, status: 'INVALID_CREDENTIALS' }
   * - If user does not exist: creates a new user and returns { user, status: 'CREATED' }
   */
  async loginOrCreate(
    username: string,
    password: string,
    options?: { locale?: string; colorScheme?: string },
  ): Promise<{
    user: User | null;
    status: 'LOGGED_IN' | 'CREATED' | 'INVALID_CREDENTIALS';
  }> {
    const cleanUsername = username.trim();
    const existingUser = await this.findOne({ username: cleanUsername });

    if (existingUser) {
      if (!existingUser.password) {
        return { user: null, status: 'INVALID_CREDENTIALS' };
      }

      const isValid = verifyPassword(password, existingUser.password);
      if (!isValid) {
        return { user: null, status: 'INVALID_CREDENTIALS' };
      }

      return { user: existingUser, status: 'LOGGED_IN' };
    }

    try {
      const hashedPassword = hashPassword(password);
      const newUser = this.create({
        username: cleanUsername,
        password: hashedPassword,
        locale: options?.locale ?? 'fa',
        colorScheme: options?.colorScheme ?? 'system',
      });
      await this.em.flush();
      return { user: newUser, status: 'CREATED' };
    } catch {
      return { user: null, status: 'INVALID_CREDENTIALS' };
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = this.create({
      username: data.username.trim(),
      password: data.password,
      email: data.email?.trim().toLowerCase(),
      locale: data.locale ?? 'fa',
      colorScheme: data.colorScheme ?? 'system',
    });
    await this.em.flush();
    return user;
  }

  async updatePreferencesSelf(
    actorId: number,
    preferences: { locale?: string; colorScheme?: string },
  ): Promise<User | null> {
    const user = await this.findOne({ id: actorId });
    if (!user) {
      return null;
    }

    if (preferences.locale) {
      user.locale = preferences.locale;
    }
    if (preferences.colorScheme) {
      user.colorScheme = preferences.colorScheme;
    }

    await this.em.flush();
    return user;
  }
}
