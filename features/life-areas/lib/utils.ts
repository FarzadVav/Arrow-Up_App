import {
  ForbiddenReferenceError,
  InactiveReferenceError,
} from '@/features/general/lib/utils';
import type { LifeArea } from './types';


/**
 * Message for the lifeAreaId form field when a reference was refused, or null
 * when the error belongs to the caller's normal handling.
 */
export function lifeAreaFieldError(error: unknown): string | null {
  if (error instanceof ForbiddenReferenceError) {
    return 'This value is not available to you.';
  }

  if (error instanceof InactiveReferenceError) {
    return 'This life area is not active.';
  }

  return null;
}

/**
 * Archived areas only stay in the list when a record already belongs to one, so
 * nothing new can be assigned to them while editing still shows the current area.
 */
export function selectableLifeAreas(
  lifeAreas: readonly LifeArea[],
  selectedId?: number | null,
): LifeArea[] {
  return lifeAreas.filter(
    (area) => area.active !== false || area.id === selectedId,
  );
}
