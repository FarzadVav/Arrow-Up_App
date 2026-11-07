import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { User } from '@/db/entities/User';
import { LifeArea } from '@/db/entities/LifeArea';
import { FrameworkTag } from '@/db/entities/FrameworkTag';
import { FrameworkHistory } from '@/db/entities/FrameworkHistory';
import { FrameworkPractice } from '@/db/entities/FrameworkPractice';
import { assertOwnedLifeAreas } from '@/features/general/api/repository';
import type { Framework } from '@/db/entities/Framework';
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

export function serializeFramework(framework: Framework): FrameworkDto {
  const historyList = framework.history?.isInitialized?.()
    ? framework.history.getItems().map((h) => ({
        id: h.id,
        date: h.date,
        isDone: h.isDone,
      }))
    : [];

  const practicesList = framework.practices?.isInitialized?.()
    ? framework.practices.getItems().map((p) => ({
        id: p.id,
        title: p.title,
      }))
    : [];

  const tagTitle = framework.tag && typeof framework.tag === 'object' && 'title' in framework.tag ? framework.tag.title : null;
  const tagId = framework.tag && typeof framework.tag === 'object' && 'id' in framework.tag ? framework.tag.id : null;

  return {
    id: framework.id,
    title: framework.title,
    content: framework.content || '',
    lifeAreaId: framework.lifeArea?.id ?? null,
    lifeArea: framework.lifeArea
      ? {
          id: framework.lifeArea.id,
          title: framework.lifeArea.title,
        }
      : undefined,
    tagId,
    tag: tagTitle,
    practices: practicesList,
    history: historyList,
    createdAt:
      framework.createdAt instanceof Date
        ? framework.createdAt.toISOString()
        : String(framework.createdAt),
    updatedAt:
      framework.updatedAt instanceof Date
        ? framework.updatedAt.toISOString()
        : String(framework.updatedAt),
    deletedAt:
      framework.deletedAt instanceof Date
        ? framework.deletedAt.toISOString()
        : framework.deletedAt
          ? String(framework.deletedAt)
          : null,
  };
}

export function serializeFrameworkTag(tag: FrameworkTag): FrameworkTagDto {
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

export class FrameworkRepository extends EntityRepository<Framework> {
  async findAllFrameworks(
    userId: number,
    options?: { lifeAreaId?: number | null },
  ): Promise<Framework[]> {
    const where: FilterQuery<Framework> = { user: userId, deletedAt: null };
    if (options?.lifeAreaId !== undefined) {
      where.lifeArea = options.lifeAreaId;
    }

    return this.find(where, {
      populate: ['lifeArea', 'tag', 'history', 'practices'],
      orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
    });
  }

  async findById(id: number, userId: number): Promise<Framework | null> {
    return this.findOne(
      { id, user: userId, deletedAt: null },
      { populate: ['lifeArea', 'tag', 'history', 'practices'] },
    );
  }

  async createFramework(data: CreateFrameworkData, userId: number): Promise<Framework> {
    await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId]);

    let tagEntity: FrameworkTag | null = null;
    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId) {
      tagEntity = await this.em.findOne(FrameworkTag, { id: rawTagId, user: userId }) ?? null;
    } else if (typeof data.tag === 'string' && data.tag.trim()) {
      tagEntity = await this.em.findOne(FrameworkTag, { title: data.tag.trim(), user: userId }) ?? null;
    }

    if (!tagEntity) {
      throw new Error('Tag is required for framework');
    }

    const framework = this.create({
      title: data.title.trim(),
      content: data.content.trim(),
      tag: tagEntity,
      lifeArea: this.em.getReference(LifeArea, data.lifeAreaId),
      user: this.em.getReference(User, userId),
    });

    if (data.practices && data.practices.length > 0) {
      for (const p of data.practices) {
        const pTitle = typeof p === 'string' ? p.trim() : p.title.trim();
        if (pTitle) {
          framework.practices.add(
            this.em.create(FrameworkPractice, {
              title: pTitle,
              framework,
            }),
          );
        }
      }
    }

    await this.em.flush();
    await this.em.populate(framework, ['lifeArea', 'tag', 'history', 'practices']);
    return framework;
  }

  async updateFramework(
    id: number,
    data: UpdateFrameworkData,
    userId: number,
  ): Promise<Framework | null> {
    const framework = await this.findOne(
      { id, user: userId },
      { populate: ['lifeArea', 'tag', 'history', 'practices'] },
    );
    if (!framework) {
      return null;
    }

    if (data.lifeAreaId !== undefined) {
      await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId], {
        keepInactiveId: framework.lifeArea?.id ?? null,
      });
    }

    if (data.title !== undefined) {
      framework.title = data.title.trim();
    }
    if (data.content !== undefined) {
      framework.content = data.content.trim();
    }

    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId !== undefined) {
      const foundTag = rawTagId ? (await this.em.findOne(FrameworkTag, { id: rawTagId, user: userId }) ?? null) : null;
      if (!foundTag) {
        throw new Error('Tag is required for framework');
      }
      framework.tag = foundTag;
    } else if (typeof data.tag === 'string') {
      const foundTag = data.tag.trim() ? (await this.em.findOne(FrameworkTag, { title: data.tag.trim(), user: userId }) ?? null) : null;
      if (!foundTag) {
        throw new Error('Tag is required for framework');
      }
      framework.tag = foundTag;
    }

    if (data.lifeAreaId !== undefined) {
      if (!data.lifeAreaId || data.lifeAreaId <= 0) {
        throw new Error('Life area is required for framework');
      }
      framework.lifeArea = this.em.getReference(LifeArea, data.lifeAreaId);
    }

    if (data.practices !== undefined) {
      const existingPracticeMap = new Map(framework.practices.getItems().map((p) => [p.id, p]));
      const newPracticeIds = new Set<number>();

      for (const pData of data.practices) {
        const pTitle = typeof pData === 'string' ? pData.trim() : pData.title.trim();
        const pId = typeof pData === 'object' && pData.id ? pData.id : null;

        if (pTitle) {
          if (pId && existingPracticeMap.has(pId)) {
            const existing = existingPracticeMap.get(pId)!;
            existing.title = pTitle;
            newPracticeIds.add(existing.id);
          } else {
            const newPractice = this.em.create(FrameworkPractice, {
              title: pTitle,
              framework,
            });
            framework.practices.add(newPractice);
          }
        }
      }

      for (const existing of framework.practices.getItems()) {
        if (existing.id && !newPracticeIds.has(existing.id)) {
          framework.practices.remove(existing);
        }
      }
    }

    await this.em.flush();
    return framework;
  }

  async deleteFramework(id: number, userId: number): Promise<boolean> {
    const framework = await this.findOne({ id, user: userId });
    if (!framework) {
      return false;
    }

    framework.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  async restoreFramework(id: number, userId: number): Promise<boolean> {
    const framework = await this.findOne({ id, user: userId, deletedAt: { $ne: null } });
    if (!framework) {
      return false;
    }

    framework.deletedAt = null;
    await this.em.flush();
    return true;
  }

  async hardDeleteFramework(id: number, userId: number): Promise<boolean> {
    const framework = await this.findOne({ id, user: userId });
    if (!framework) {
      return false;
    }

    this.em.remove(framework);
    await this.em.flush();
    return true;
  }

  async findHistory(
    userId: number,
    options?: { lifeAreaId?: number | null },
  ): Promise<Framework[]> {
    const where: FilterQuery<Framework> = { user: userId, deletedAt: { $ne: null } };
    if (options?.lifeAreaId !== undefined) {
      where.lifeArea = options.lifeAreaId;
    }

    return this.find(
      where,
      {
        populate: ['lifeArea', 'tag', 'history', 'practices'],
        orderBy: [{ deletedAt: 'DESC' }],
      },
    );
  }

  async recordHistory(
    frameworkId: number,
    date: string,
    isDone: boolean,
    userId: number,
  ): Promise<FrameworkHistory | null> {
    const framework = await this.findOne({ id: frameworkId, user: userId });
    if (!framework) {
      return null;
    }

    const dayPrefix = date.slice(0, 10);
    const existing = await this.em.findOne(FrameworkHistory, {
      framework: framework.id,
      date: { $like: `${dayPrefix}%` },
    });

    if (existing) {
      existing.isDone = isDone;
      existing.date = date;
      await this.em.flush();
      return existing;
    }

    const history = this.em.create(FrameworkHistory, {
      date,
      isDone,
      framework,
    });

    await this.em.flush();
    return history;
  }
}

export class FrameworkTagRepository extends EntityRepository<FrameworkTag> {
  async findAllTags(userId: number): Promise<FrameworkTag[]> {
    return this.find({ user: userId }, { orderBy: { createdAt: 'DESC' } });
  }
  async findByLifeArea(lifeAreaId: number | null, userId: number): Promise<FrameworkTag[]> {
    return this.find(
      { lifeArea: lifeAreaId, user: userId },
      { orderBy: { title: 'ASC' } },
    );
  }

  async findByTitle(
    title: string,
    lifeAreaId: number | null,
    userId: number,
  ): Promise<FrameworkTag | null> {
    return this.findOne({
      title: title.trim(),
      lifeArea: lifeAreaId,
      user: userId,
    });
  }

  async findById(id: number, userId: number): Promise<FrameworkTag | null> {
    return this.findOne({ id, user: userId });
  }

  async createTag(
    data: CreateFrameworkTagData,
    userId: number,
  ): Promise<FrameworkTag> {
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
  ): Promise<FrameworkTag | null> {
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
