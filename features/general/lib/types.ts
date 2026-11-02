import type { LucideIcon } from "lucide-react";
import type { ActionResultType, CapacityCheckResultType } from "./schemas";

export { ActionResultSchema, CapacityCheckResultSchema } from "./schemas";

/**
 * State returned by form-driven mutations (delete, toggle, record).
 * Doubles as the `useActionState` initial state, hence the `undefined` member.
 */
export type ActionResult = ActionResultType | undefined;

export type CapacityCheckResult = CapacityCheckResultType;

export type NavigationLink = {
  href: string;
  Icon: LucideIcon;
  matchPathname: string;
};
