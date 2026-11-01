export const MAX_ENERGY_COST = 10;

export interface CapacityCheckResult {
  valid: boolean;
  currentSum: number;
  totalAfter: number;
  max: number;
}

/**
 * Checks if adding or updating an item with newCost exceeds the MAX_ENERGY_COST (10).
 *
 * @param items Existing items that have a difficulty/cost rating and an id.
 * @param newCost The cost being proposed (1-10).
 * @param excludeId Optional ID of the item being updated so its prior cost is not double-counted.
 */
export function checkCostCapacity(
  items: Array<{ id?: number; difficulty?: number | null }>,
  newCost: number,
  excludeId?: number | null,
): CapacityCheckResult {
  const currentSum = items
    .filter((item) => (excludeId ? item.id !== excludeId : true))
    .reduce((acc, item) => acc + (item.difficulty ?? 0), 0);

  const totalAfter = currentSum + newCost;

  return {
    valid: totalAfter <= MAX_ENERGY_COST,
    currentSum,
    totalAfter,
    max: MAX_ENERGY_COST,
  };
}
