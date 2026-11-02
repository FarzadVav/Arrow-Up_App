import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { JournalCategory } from '@/db/entities/enums';
import { User } from '@/db/entities/User';
import type { Journal } from '@/db/entities/Journal';
import type { JournalTag } from '@/db/entities/JournalTag';
import type {
  CreateJournalData,
  UpdateJournalData,
  Journal as JournalDto,
  CreateJournalTagData,
  UpdateJournalTagData,
  JournalTag as JournalTagDto,
} from '../lib/types';

export type {
  CreateJournalData,
  UpdateJournalData,
  CreateJournalTagData,
  UpdateJournalTagData,
};

/**
 * Safely transforms a MikroORM Journal entity into a plain Journal DTO object.
 */
export function serializeJournal(journal: Journal): JournalDto {
  return {
    id: journal.id,
    title: journal.title,
    content: journal.content,
    type: journal.type as unknown as JournalDto['type'],
    tag: journal.tag ?? null,
    createdAt: journal.createdAt instanceof Date ? journal.createdAt.toISOString() : String(journal.createdAt),
  };
}

export function serializeJournalTag(tag: JournalTag): JournalTagDto {
  return {
    id: tag.id,
    title: tag.title,
    category: tag.category as unknown as JournalTagDto['category'],
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

export class JournalRepository extends EntityRepository<Journal> {
  async findAllJournals(
    userId: number,
    options?: { limit?: number; offset?: number },
  ): Promise<Journal[]> {
    return this.find({ user: userId }, {
      orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  async findByCategory(
    category: JournalCategory | string,
    userId: number,
    tag?: string | null,
  ): Promise<Journal[]> {
    const matchedCategory =
      Object.values(JournalCategory).find(
        (c) => c.toLowerCase() === category.toLowerCase(),
      ) ?? JournalCategory.LOGS;

    const where: FilterQuery<Journal> = { type: matchedCategory, user: userId };
    if (tag && tag.toLowerCase() !== 'all') {
      where.tag = tag;
    }

    return this.find(where, { orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }] });
  }

  async findById(id: number, userId: number): Promise<Journal | null> {
    return this.findOne({ id, user: userId });
  }

  async searchJournals(query: string, userId: number): Promise<Journal[]> {
    const cleanQuery = query.trim().toLowerCase();
    const where: FilterQuery<Journal> = {
      $or: [
        { title: { $like: `%${cleanQuery}%` } },
        { content: { $like: `%${cleanQuery}%` } },
      ],
      user: userId,
    };

    return this.find(where, { orderBy: { createdAt: 'DESC' } });
  }

  async createJournal(data: CreateJournalData, userId: number): Promise<Journal> {
    const journal = this.create({
      title: data.title.trim(),
      content: data.content,
      type: data.type as unknown as JournalCategory,
      tag: data.tag ? data.tag.trim() : null,
      user: this.em.getReference(User, userId),
    });
    await this.em.flush();
    return journal;
  }

  async updateJournal(id: number, data: UpdateJournalData, userId: number): Promise<Journal | null> {
    const journal = await this.findOne({ id, user: userId });
    if (!journal) {
      return null;
    }

    this.assign(journal, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.type !== undefined ? { type: data.type as unknown as JournalCategory } : {}),
      ...(data.tag !== undefined ? { tag: data.tag ? data.tag.trim() : null } : {}),
    });

    await this.em.flush();
    return journal;
  }

  async deleteJournal(id: number, userId: number): Promise<boolean> {
    const journal = await this.findOne({ id, user: userId });
    if (!journal) {
      return false;
    }

    this.em.remove(journal);
    await this.em.flush();
    return true;
  }

  async getCategoryCounts(userId: number): Promise<Record<JournalCategory, number>> {
    const categories = Object.values(JournalCategory);
    const counts = await Promise.all(
      categories.map((cat) => this.count({ user: userId, type: cat })),
    );

    const result = {} as Record<JournalCategory, number>;
    categories.forEach((cat, idx) => {
      result[cat] = counts[idx];
    });

    return result;
  }
}

export class JournalTagRepository extends EntityRepository<JournalTag> {
  async findAllTags(userId: number): Promise<JournalTag[]> {
    return this.find({ user: userId }, { orderBy: { createdAt: 'DESC' } });
  }

  async findByCategory(
    category: JournalCategory | string,
    userId: number,
  ): Promise<JournalTag[]> {
    const matchedCategory =
      Object.values(JournalCategory).find(
        (c) => c.toLowerCase() === category.toLowerCase(),
      ) ?? JournalCategory.LOGS;

    return this.find(
      { category: matchedCategory, user: userId },
      { orderBy: { createdAt: 'ASC' } },
    );
  }

  async findById(id: number, userId: number): Promise<JournalTag | null> {
    return this.findOne({ id, user: userId });
  }

  async createTag(
    data: CreateJournalTagData,
    userId: number,
  ): Promise<JournalTag> {
    const matchedCategory =
      Object.values(JournalCategory).find(
        (c) => c.toLowerCase() === data.category.toLowerCase(),
      ) ?? JournalCategory.LOGS;

    const tag = this.create({
      title: data.title.trim(),
      category: matchedCategory,
      user: this.em.getReference(User, userId),
    });
    await this.em.flush();
    return tag;
  }

  async updateTag(
    id: number,
    data: UpdateJournalTagData,
    userId: number,
  ): Promise<JournalTag | null> {
    const tag = await this.findOne({ id, user: userId });
    if (!tag) {
      return null;
    }

    const matchedCategory =
      data.category !== undefined
        ? Object.values(JournalCategory).find(
            (c) => c.toLowerCase() === data.category!.toLowerCase(),
          ) ?? JournalCategory.LOGS
        : undefined;

    this.assign(tag, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(matchedCategory !== undefined ? { category: matchedCategory } : {}),
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
