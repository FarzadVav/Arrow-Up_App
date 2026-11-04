import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { User } from '@/db/entities/User';
import { Journal } from '@/db/entities/Journal';
import { JournalCategory } from '@/db/entities/JournalCategory';
import { JournalTag } from '@/db/entities/JournalTag';
import type {
  CreateJournalData,
  UpdateJournalData,
  Journal as JournalDto,
  JournalTag as JournalTagDto,
} from '../lib/types';

export type {
  CreateJournalData,
  UpdateJournalData,
};

/**
 * Safely transforms a MikroORM Journal entity into a plain Journal DTO object.
 */
export function serializeJournal(journal: Journal): JournalDto {
  const cat = journal.category;
  const tag = journal.tag;

  const serializedCategory = {
    id: cat ? (typeof cat === 'object' ? cat.id : Number(cat)) : 1,
    slug: cat && typeof cat === 'object' && cat.slug ? cat.slug : 'logs',
    nameEn: cat && typeof cat === 'object' && cat.nameEn ? cat.nameEn : 'Logs',
    nameFa: cat && typeof cat === 'object' && cat.nameFa ? cat.nameFa : 'گزارش‌ها',
  };

  const serializedTag = {
    id: tag ? (typeof tag === 'object' ? tag.id : Number(tag)) : 1,
    slug: tag && typeof tag === 'object' && tag.slug ? tag.slug : 'good-things',
    nameEn: tag && typeof tag === 'object' && tag.nameEn ? tag.nameEn : 'good things',
    nameFa: tag && typeof tag === 'object' && tag.nameFa ? tag.nameFa : 'اتفاقات خوب',
    categoryId: serializedCategory.id,
    categorySlug: serializedCategory.slug,
    title: tag && typeof tag === 'object' && tag.nameEn ? tag.nameEn : 'good things',
  };

  return {
    id: journal.id,
    title: journal.title,
    content: journal.content,
    category: serializedCategory,
    tag: serializedTag,
    type: serializedCategory.nameEn,
    createdAt:
      journal.createdAt instanceof Date
        ? journal.createdAt.toISOString()
        : String(journal.createdAt),
    deletedAt:
      journal.deletedAt instanceof Date
        ? journal.deletedAt.toISOString()
        : journal.deletedAt
          ? String(journal.deletedAt)
          : null,
  };
}

export function serializeJournalTag(tag: JournalTag): JournalTagDto {
  const cat = tag.category;
  return {
    id: tag.id,
    slug: tag.slug,
    nameEn: tag.nameEn,
    nameFa: tag.nameFa,
    categoryId: cat ? (typeof cat === 'object' ? cat.id : Number(cat)) : undefined,
    categorySlug: cat && typeof cat === 'object' ? cat.slug : undefined,
    title: tag.nameEn,
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
    return this.find(
      { user: userId, deletedAt: null },
      {
        populate: ['category', 'tag'],
        orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
        limit: options?.limit,
        offset: options?.offset,
      },
    );
  }

  async findByCategory(
    categoryParam: string,
    userId: number,
    tagParam?: string | null,
  ): Promise<Journal[]> {
    const cleanCat = categoryParam.trim().toLowerCase();
    const catEntity = await this.em.findOne(JournalCategory, {
      $or: [
        { slug: cleanCat },
        { nameEn: { $ilike: cleanCat } },
      ],
    });

    const where: FilterQuery<Journal> = {
      user: userId,
      deletedAt: null,
    };

    if (catEntity) {
      where.category = catEntity.id;
    }

    if (tagParam && tagParam.toLowerCase() !== 'all') {
      const cleanTag = tagParam.trim().toLowerCase();
      const tagNum = Number(cleanTag);
      const tagEntity = await this.em.findOne(JournalTag, {
        $or: [
          ...(Number.isInteger(tagNum) && tagNum > 0 ? [{ id: tagNum }] : []),
          { slug: cleanTag },
          { nameEn: { $ilike: cleanTag } },
        ],
      });

      if (tagEntity) {
        where.tag = tagEntity.id;
      }
    }

    return this.find(where, {
      populate: ['category', 'tag'],
      orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
    });
  }

  async findById(id: number, userId: number): Promise<Journal | null> {
    return this.findOne(
      { id, user: userId, deletedAt: null },
      { populate: ['category', 'tag'] },
    );
  }

  async searchJournals(query: string, userId: number): Promise<Journal[]> {
    const cleanQuery = query.trim().toLowerCase();
    const where: FilterQuery<Journal> = {
      $or: [
        { title: { $like: `%${cleanQuery}%` } },
        { content: { $like: `%${cleanQuery}%` } },
      ],
      user: userId,
      deletedAt: null,
    };

    return this.find(where, {
      populate: ['category', 'tag'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  async createJournal(data: CreateJournalData, userId: number): Promise<Journal> {
    // 1. Resolve category
    const catInput = String(data.categoryId ?? data.category ?? data.type ?? '').trim().toLowerCase();
    if (!catInput || catInput === 'none') {
      throw new Error('Category is required for journal');
    }
    const catNum = Number(catInput);
    const category = await this.em.findOne(JournalCategory, {
      $or: [
        ...(Number.isInteger(catNum) && catNum > 0 ? [{ id: catNum }] : []),
        { slug: catInput },
        { nameEn: { $ilike: catInput } },
      ],
    });

    if (!category) {
      throw new Error('Category is required for journal');
    }

    // 2. Resolve tag
    const tagInput = data.tagId !== undefined ? String(data.tagId) : data.tag !== undefined && data.tag !== null ? String(data.tag).trim().toLowerCase() : '';
    if (!tagInput || tagInput === 'none') {
      throw new Error('Tag is required for journal');
    }
    const tagNum = Number(tagInput);
    let tag: JournalTag | null = null;

    if (tagInput && tagInput !== 'none') {
      tag = await this.em.findOne(JournalTag, {
        $or: [
          ...(Number.isInteger(tagNum) && tagNum > 0 ? [{ id: tagNum }] : []),
          { slug: tagInput },
          { nameEn: { $ilike: tagInput } },
        ],
      });
    }

    if (!tag) {
      throw new Error('Tag is required for journal');
    }

    const journal = this.create({
      title: data.title.trim(),
      content: data.content,
      category,
      tag,
      user: this.em.getReference(User, userId),
    });

    await this.em.flush();
    return journal;
  }

  async updateJournal(
    id: number,
    data: UpdateJournalData,
    userId: number,
  ): Promise<Journal | null> {
    const journal = await this.findOne({ id, user: userId }, { populate: ['category', 'tag'] });
    if (!journal) {
      return null;
    }

    if (data.title !== undefined) {
      journal.title = data.title.trim();
    }
    if (data.content !== undefined) {
      journal.content = data.content;
    }

    // Category update if provided
    const catInput = data.categoryId ?? data.category ?? data.type;
    if (catInput !== undefined) {
      const cleanCat = String(catInput).trim().toLowerCase();
      if (!cleanCat || cleanCat === 'none') {
        throw new Error('Category cannot be null for journal');
      }
      const catNum = Number(cleanCat);
      const category = await this.em.findOne(JournalCategory, {
        $or: [
          ...(Number.isInteger(catNum) && catNum > 0 ? [{ id: catNum }] : []),
          { slug: cleanCat },
          { nameEn: { $ilike: cleanCat } },
        ],
      });
      if (!category) {
        throw new Error('Category is required for journal');
      }
      journal.category = category;
    }

    // Tag update if provided
    const tagInput = data.tagId !== undefined ? String(data.tagId) : data.tag !== undefined && data.tag !== null ? String(data.tag).trim().toLowerCase() : undefined;
    if (tagInput !== undefined) {
      if (!tagInput || tagInput === 'none') {
        throw new Error('Tag cannot be null for journal');
      }
      const tagNum = Number(tagInput);
      const tag = await this.em.findOne(JournalTag, {
        $or: [
          ...(Number.isInteger(tagNum) && tagNum > 0 ? [{ id: tagNum }] : []),
          { slug: tagInput },
          { nameEn: { $ilike: tagInput } },
        ],
      });
      if (!tag) {
        throw new Error('Tag is required for journal');
      }
      journal.tag = tag;
    }

    await this.em.flush();
    return journal;
  }

  async deleteJournal(id: number, userId: number): Promise<boolean> {
    const journal = await this.findOne({ id, user: userId });
    if (!journal) {
      return false;
    }

    journal.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  async restoreJournal(id: number, userId: number): Promise<boolean> {
    const journal = await this.findOne({ id, user: userId, deletedAt: { $ne: null } });
    if (!journal) {
      return false;
    }

    journal.deletedAt = null;
    await this.em.flush();
    return true;
  }

  async hardDeleteJournal(id: number, userId: number): Promise<boolean> {
    const journal = await this.findOne({ id, user: userId });
    if (!journal) {
      return false;
    }

    this.em.remove(journal);
    await this.em.flush();
    return true;
  }

  async findHistory(
    userId: number,
    categoryParam?: string,
    tagParam?: string,
  ): Promise<Journal[]> {
    const where: FilterQuery<Journal> = {
      user: userId,
      deletedAt: { $ne: null },
    };

    if (categoryParam && categoryParam !== 'all') {
      const cleanCat = categoryParam.trim().toLowerCase();
      const catEntity = await this.em.findOne(JournalCategory, {
        $or: [{ slug: cleanCat }, { nameEn: { $ilike: cleanCat } }],
      });
      if (catEntity) {
        where.category = catEntity.id;
      }
    }

    if (tagParam && tagParam !== 'all') {
      const cleanTag = tagParam.trim().toLowerCase();
      const tagNum = Number(cleanTag);
      const tagEntity = await this.em.findOne(JournalTag, {
        $or: [
          ...(Number.isInteger(tagNum) && tagNum > 0 ? [{ id: tagNum }] : []),
          { slug: cleanTag },
          { nameEn: { $ilike: cleanTag } },
        ],
      });
      if (tagEntity) {
        where.tag = tagEntity.id;
      }
    }

    return this.find(where, {
      populate: ['category', 'tag'],
      orderBy: [{ deletedAt: 'DESC' }],
    });
  }

  async getCategoryCounts(userId: number): Promise<Record<string, number>> {
    const categories = await this.em.find(JournalCategory, {}, { orderBy: { sortNumber: 'ASC' } });
    const result: Record<string, number> = {};

    for (const cat of categories) {
      const count = await this.count({
        user: userId,
        category: cat.id,
        deletedAt: null,
      });
      result[cat.nameEn] = count;
      result[cat.slug] = count;
    }

    return result;
  }
}

export class JournalTagRepository extends EntityRepository<JournalTag> {
  async findAllTags(): Promise<JournalTag[]> {
    return this.find(
      {},
      {
        populate: ['category'],
        orderBy: [{ category: { sortNumber: 'ASC' } }, { sortNumber: 'ASC' }],
      },
    );
  }

  async findByCategory(
    categoryParam: string,
  ): Promise<JournalTag[]> {
    const cleanCat = categoryParam.trim().toLowerCase();
    const cat = await this.em.findOne(JournalCategory, {
      $or: [{ slug: cleanCat }, { nameEn: { $ilike: cleanCat } }],
    });

    if (!cat) {
      return [];
    }

    return this.find(
      { category: cat.id },
      {
        populate: ['category'],
        orderBy: [{ sortNumber: 'ASC' }],
      },
    );
  }

  async findById(id: number): Promise<JournalTag | null> {
    return this.findOne({ id }, { populate: ['category'] });
  }

  // Tags are static, mutating methods reject alterations
  async createTag(): Promise<never> {
    throw new Error('Journal tags are static and cannot be created.');
  }

  async updateTag(): Promise<never> {
    throw new Error('Journal tags are static and cannot be edited.');
  }

  async deleteTag(): Promise<never> {
    throw new Error('Journal tags are static and cannot be deleted.');
  }
}
