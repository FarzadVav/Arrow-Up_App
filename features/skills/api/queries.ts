import 'server-only';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeSkill, serializeSkillTag } from './repository';
import type { Skill, SkillTag } from '../lib/types';

export async function getSkillsQuery(lifeAreaId?: number): Promise<Skill[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ skill }) => {
    const items = await skill.findAllSkills(userId, lifeAreaId);
    return items.map(serializeSkill);
  });
}

export async function getSkillByIdQuery(id: number): Promise<Skill | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ skill }) => {
    const item = await skill.findById(id, userId);
    return item ? serializeSkill(item) : null;
  });
}

export async function getSkillTagsQuery(lifeAreaId?: number | null): Promise<SkillTag[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ skillTag }) => {
    const tags =
      lifeAreaId !== undefined
        ? await skillTag.findByLifeArea(lifeAreaId, userId)
        : await skillTag.findAllTags(userId);
    return tags.map(serializeSkillTag);
  });
}
