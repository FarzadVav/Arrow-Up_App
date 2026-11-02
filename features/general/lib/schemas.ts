import { type } from 'arktype';

/**
 * ArkType schema for ActionResult returned by form-driven mutations.
 */
export const ActionResultSchema = type({
  success: 'boolean',
  'error?': 'string',
});
export type ActionResultType = typeof ActionResultSchema.infer;

/**
 * ArkType schema for CapacityCheckResult.
 */
export const CapacityCheckResultSchema = type({
  valid: 'boolean',
  currentSum: 'number',
  totalAfter: 'number',
  max: 'number',
});
export type CapacityCheckResultType = typeof CapacityCheckResultSchema.infer;
