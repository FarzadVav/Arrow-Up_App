import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from '@/db/entities/User';
import type { LifeArea } from '@/db/entities/LifeArea';
import type { CreateLifeAreaData, UpdateLifeAreaData, LifeArea as LifeAreaDto } from '../lib/types';
import { DEFAULT_LIFE_AREAS, getDefaultLifeAreaTitle } from '../lib/constants';

export type { CreateLifeAreaData, UpdateLifeAreaData };

/**
 * Safely transforms a MikroORM LifeArea entity into a plain LifeArea DTO object.
 */
export function serializeLifeArea(lifeArea: LifeArea): LifeAreaDto {
  return {
    id: lifeArea.id,
    title: lifeArea.title,
    vision: lifeArea.vision,
    active: lifeArea.active ?? true,
    difficulty: lifeArea.difficulty,
    createdAt: lifeArea.createdAt instanceof Date ? lifeArea.createdAt.toISOString() : String(lifeArea.createdAt),
    updatedAt: lifeArea.updatedAt instanceof Date ? lifeArea.updatedAt.toISOString() : String(lifeArea.updatedAt),
  };
}

export class LifeAreaRepository extends EntityRepository<LifeArea> {
  async findAllLifeAreas(userId: number): Promise<LifeArea[]> {
    return this.find({ user: userId }, {
      orderBy: { createdAt: 'ASC' },
    });
  }

  async findById(id: number, userId: number): Promise<LifeArea | null> {
    return this.findOne({ id, user: userId });
  }

  async createLifeArea(data: CreateLifeAreaData, userId: number): Promise<LifeArea> {
    const lifeArea = this.create({
      title: data.title.trim(),
      vision: data.vision || '',
      active: data.active ?? true,
      difficulty: data.difficulty,
      user: this.em.getReference(User, userId),
    });
    await this.em.flush();
    return lifeArea;
  }

  /**
   * Creates the 4 default life areas (lifestyle, health, career, social connections)
   * for a newly created user in their active locale.
   */
  async createDefaultLifeAreasForUser(user: User, locale?: string): Promise<LifeArea[]> {
    const areas: LifeArea[] = [];
    const targetLocale = locale ?? user.locale ?? 'fa';

    for (const def of DEFAULT_LIFE_AREAS) {
      const title = getDefaultLifeAreaTitle(def, targetLocale);
      const lifeArea = this.create({
        title,
        vision: '',
        active: true,
        difficulty: def.defaultDifficulty,
        user,
      });
      areas.push(lifeArea);
    }

    await this.em.flush();
    return areas;
  }

  async updateLifeArea(
    id: number,
    data: UpdateLifeAreaData,
    userId: number,
  ): Promise<LifeArea | null> {
    const lifeArea = await this.findOne({ id, user: userId });
    if (!lifeArea) {
      return null;
    }

    this.assign(lifeArea, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.vision !== undefined ? { vision: data.vision } : {}),
      ...(data.active !== undefined ? { active: Boolean(data.active) } : {}),
      ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
    });

    await this.em.flush();
    return lifeArea;
  }

  async deleteLifeArea(id: number, userId: number): Promise<boolean> {
    const lifeArea = await this.findOne({ id, user: userId });
    if (!lifeArea) {
      return false;
    }

    this.em.remove(lifeArea);
    await this.em.flush();
    return true;
  }
}
