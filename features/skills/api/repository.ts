import { EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { User } from '@/db/entities/User';
import { LifeArea } from '@/db/entities/LifeArea';
import { SkillTag } from '@/db/entities/SkillTag';
import { assertOwnedLifeAreas } from '@/features/general/api/repository';
import type { Skill } from '@/db/entities/Skill';
import type {
  CreateSkillData,
  UpdateSkillData,
  Skill as SkillDto,
  CreateSkillTagData,
  UpdateSkillTagData,
  SkillTag as SkillTagDto,
} from '../lib/types';

export type { CreateSkillData, UpdateSkillData, CreateSkillTagData, UpdateSkillTagData };

/**
 * Safely transforms a MikroORM Skill entity into a plain Skill DTO object.
 */
export function serializeSkill(skill: Skill): SkillDto {
  const lifeAreaDto =
    skill.lifeArea && typeof skill.lifeArea === 'object' && 'title' in skill.lifeArea
      ? {
          id: skill.lifeArea.id,
          title: skill.lifeArea.title,
          vision: skill.lifeArea.vision,
        }
      : undefined;

  const tagTitle = skill.tag && typeof skill.tag === 'object' && 'title' in skill.tag ? skill.tag.title : null;
  const tagId = skill.tag && typeof skill.tag === 'object' && 'id' in skill.tag ? skill.tag.id : null;

  return {
    id: skill.id,
    title: skill.title,
    content: skill.content,
    lifeAreaId: skill.lifeArea?.id ?? null,
    lifeArea: lifeAreaDto,
    tagId,
    tag: tagTitle,
    createdAt: skill.createdAt instanceof Date ? skill.createdAt.toISOString() : String(skill.createdAt),
    updatedAt: skill.updatedAt instanceof Date ? skill.updatedAt.toISOString() : String(skill.updatedAt),
    deletedAt: skill.deletedAt instanceof Date ? skill.deletedAt.toISOString() : skill.deletedAt ? String(skill.deletedAt) : null,
  };
}

export function serializeSkillTag(tag: SkillTag): SkillTagDto {
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

export class SkillRepository extends EntityRepository<Skill> {
  async findAllSkills(userId: number, lifeAreaId?: number): Promise<Skill[]> {
    const where: FilterQuery<Skill> = { user: userId, deletedAt: null };
    if (lifeAreaId) {
      where.lifeArea = lifeAreaId;
    }

    return this.find(where, {
      populate: ['lifeArea', 'tag'],
      orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
    });
  }

  async findById(id: number, userId: number): Promise<Skill | null> {
    return this.findOne({ id, user: userId, deletedAt: null }, {
      populate: ['lifeArea', 'tag'],
    });
  }

  async createSkill(data: CreateSkillData, userId: number): Promise<Skill> {
    await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId]);

    let tagEntity: SkillTag | null = null;
    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId) {
      tagEntity = await this.em.findOne(SkillTag, { id: rawTagId, user: userId }) ?? null;
    } else if (typeof data.tag === 'string' && data.tag.trim()) {
      tagEntity = await this.em.findOne(SkillTag, { title: data.tag.trim(), user: userId }) ?? null;
    }

    if (!tagEntity) {
      throw new Error('Tag is required for skill');
    }

    const skill = this.create({
      title: data.title.trim(),
      content: data.content || '',
      tag: tagEntity,
      lifeArea: this.em.getReference(LifeArea, data.lifeAreaId),
      user: this.em.getReference(User, userId),
    });

    await this.em.flush();
    return skill;
  }

  async updateSkill(
    id: number,
    data: UpdateSkillData,
    userId: number,
  ): Promise<Skill | null> {
    const skill = await this.findOne({ id, user: userId }, {
      populate: ['lifeArea', 'tag'],
    });

    if (!skill) {
      return null;
    }

    if (data.lifeAreaId !== undefined) {
      await assertOwnedLifeAreas(this.em, userId, [data.lifeAreaId], {
        keepInactiveId: skill.lifeArea?.id ?? null,
      });
    }

    let tagEntity = skill.tag;
    const rawTagId = data.tagId ?? (typeof data.tag === 'number' ? data.tag : data.tag && !isNaN(Number(data.tag)) ? Number(data.tag) : undefined);
    if (rawTagId !== undefined) {
      tagEntity = rawTagId ? (await this.em.findOne(SkillTag, { id: rawTagId, user: userId }) ?? null) : null;
      if (!tagEntity) {
        throw new Error('Tag is required for skill');
      }
    } else if (typeof data.tag === 'string') {
      tagEntity = data.tag.trim() ? (await this.em.findOne(SkillTag, { title: data.tag.trim(), user: userId }) ?? null) : null;
      if (!tagEntity) {
        throw new Error('Tag is required for skill');
      }
    }

    if (data.lifeAreaId !== undefined && (!data.lifeAreaId || data.lifeAreaId <= 0)) {
      throw new Error('Life area is required for skill');
    }

    const lifeArea =
      data.lifeAreaId !== undefined
        ? (data.lifeAreaId ? this.em.getReference(LifeArea, data.lifeAreaId) : undefined)
        : skill.lifeArea;

    this.assign(skill, {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(rawTagId !== undefined || data.tag !== undefined ? { tag: tagEntity } : {}),
      ...(data.lifeAreaId !== undefined ? { lifeArea } : {}),
    });

    await this.em.flush();
    return skill;
  }

  async deleteSkill(id: number, userId: number): Promise<boolean> {
    const skill = await this.findOne({ id, user: userId });
    if (!skill) {
      return false;
    }

    skill.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  async restoreSkill(id: number, userId: number): Promise<boolean> {
    const skill = await this.findOne({ id, user: userId, deletedAt: { $ne: null } });
    if (!skill) {
      return false;
    }

    skill.deletedAt = null;
    await this.em.flush();
    return true;
  }

  async hardDeleteSkill(id: number, userId: number): Promise<boolean> {
    const skill = await this.findOne({ id, user: userId });
    if (!skill) {
      return false;
    }

    this.em.remove(skill);
    await this.em.flush();
    return true;
  }

  async findHistory(userId: number): Promise<Skill[]> {
    return this.find(
      { user: userId, deletedAt: { $ne: null } },
      {
        populate: ['lifeArea', 'tag'],
        orderBy: [{ deletedAt: 'DESC' }],
      },
    );
  }
}

export class SkillTagRepository extends EntityRepository<SkillTag> {
  async findAllTags(userId: number): Promise<SkillTag[]> {
    return this.find({ user: userId }, { orderBy: { createdAt: 'DESC' } });
  }
  async findByLifeArea(lifeAreaId: number | null, userId: number): Promise<SkillTag[]> {
    return this.find(
      { lifeArea: lifeAreaId, user: userId },
      { orderBy: { title: 'ASC' } },
    );
  }

  async findByTitle(
    title: string,
    lifeAreaId: number | null,
    userId: number,
  ): Promise<SkillTag | null> {
    return this.findOne({
      title: title.trim(),
      lifeArea: lifeAreaId,
      user: userId,
    });
  }

  async findById(id: number, userId: number): Promise<SkillTag | null> {
    return this.findOne({ id, user: userId });
  }

  async createTag(
    data: CreateSkillTagData,
    userId: number,
  ): Promise<SkillTag> {
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
    data: UpdateSkillTagData,
    userId: number,
  ): Promise<SkillTag | null> {
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
