import { NextResponse } from 'next/server';
import type { CapacityCheckResult } from './types';

export const TEHRAN_TIMEZONE = "Asia/Tehran";

const persianDateFormatter = new Intl.DateTimeFormat(
  "fa-IR-u-ca-persian-nu-latn",
  {
    timeZone: TEHRAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
);

const tehranTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TEHRAN_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Parses an input into a valid Date object, handling strings (including YYYY-MM-DD safely) and dates.
 */
export function parseToDate(
  value: Date | string | number | null | undefined,
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    // Pure calendar date YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T12:00:00Z`);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Formats a Date or date string to Persian (Solar Hijri) calendar based on Asia/Tehran,
 * displaying with English characters in YYYY/MM/DD format (e.g. 1405/07/14).
 */
export function formatPersianDate(
  value: Date | string | number | null | undefined,
  fallback = "",
): string {
  if (!value) {
    return fallback;
  }

  const date = parseToDate(value);
  if (!date) {
    return typeof value === "string" ? value : fallback;
  }

  try {
    const parts = persianDateFormatter.formatToParts(date);
    let year = "";
    let month = "";
    let day = "";

    for (const part of parts) {
      if (part.type === "year") {
        year = part.value;
      } else if (part.type === "month") {
        month = part.value.padStart(2, "0");
      } else if (part.type === "day") {
        day = part.value.padStart(2, "0");
      }
    }

    if (year && month && day) {
      return `${year}/${month}/${day}`;
    }

    return persianDateFormatter.format(date);
  } catch {
    return typeof value === "string" ? value : fallback;
  }
}

/**
 * Alias for formatPersianDate.
 */
export const formatDate = formatPersianDate;

/**
 * Formats a time based on Asia/Tehran in HH:mm 24-hour format with English characters.
 */
export function formatTime(
  value: Date | string | number | null | undefined,
  fallback = "",
): string {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    // Already in HH:mm format
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(":");
      return `${h.padStart(2, "0")}:${m}`;
    }
  }

  const date = parseToDate(value);
  if (!date) {
    return typeof value === "string" ? value : fallback;
  }

  try {
    return tehranTimeFormatter.format(date);
  } catch {
    return typeof value === "string" ? value : fallback;
  }
}

/**
 * Formats date and time together based on Asia/Tehran.
 * e.g. "1405/07/14 16:30"
 */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  separator = " ",
  fallback = "",
): string {
  const d = formatPersianDate(value);
  const t = formatTime(value);

  if (!d && !t) {
    return fallback;
  }
  if (!d) {
    return t;
  }
  if (!t) {
    return d;
  }

  return `${d}${separator}${t}`;
}

/**
 * Parses deadline / form date string to Date object. Returns null if invalid or pure daily time string.
 * Supports UTC ISO timestamps (e.g. 2026-10-30T00:00:00.000Z) and calendar date strings (YYYY-MM-DD).
 */
export function parseDate(date: string | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  const trimmed = date.trim();
  if (!trimmed) {
    return null;
  }

  // Pure daily time string "HH:mm" (e.g. "10:30")
  if (
    /^\d{1,2}:\d{2}$/.test(trimmed) ||
    (!trimmed.includes("-") && trimmed.includes(":"))
  ) {
    return null;
  }

  const parsed = parseToDate(trimmed);
  if (!parsed) {
    return null;
  }

  // If it was stored as UTC ISO timestamp (e.g. "2026-10-30T00:00:00.000Z")
  if (trimmed.includes("T") || trimmed.endsWith("Z")) {
    return new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    );
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
}

/**
 * Serializes a Date object or date string to ISO 8601 UTC timestamp format for storage.
 * Encodes the calendar date chosen by user at midnight UTC (e.g. 2026-10-30T00:00:00.000Z).
 */
export function serializeDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "";
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (!trimmed) {
      return "";
    }
    // Already in full ISO UTC timestamp format: YYYY-MM-DDTHH:mm:ss...Z
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? trimmed : d.toISOString();
    }
    // Pure calendar date YYYY-MM-DD -> convert to UTC ISO timestamp at 00:00:00.000Z
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T00:00:00.000Z`;
    }
  }

  const d = date instanceof Date ? date : parseToDate(date);
  if (!d || isNaN(d.getTime())) {
    return "";
  }

  // Use the local calendar year, month, date picked by the user and encode in UTC
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0)).toISOString();
}

/**
 * Returns current time in Asia/Tehran formatted as HH:mm.
 */
export function getDefaultTime(): string {
  return formatTime(new Date());
}

/**
 * Formats a deadline for tasks/todos based on whether it is daily or upcoming date.
 */
export function formatDeadline(
  deadline: string | null | undefined,
  isDaily = false,
): string {
  if (!deadline) {
    return "";
  }

  if (isDaily || (deadline.includes(":") && !deadline.includes("-"))) {
    return `To ${deadline}`;
  }

  return formatPersianDate(deadline);
}

/* =========================================================================
   Cost & Capacity
   ========================================================================= */

export const MAX_ENERGY_COST = 10;

/**
 * Checks if adding or updating an item with newCost exceeds the MAX_ENERGY_COST (10).
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

/* =========================================================================
   Life Area Slug
   ========================================================================= */

export const UNSET_LIFE_AREA_SLUG = 'not-set';

/**
 * Absent or unparseable means every area,
 * UNSET_LIFE_AREA_SLUG/'0'/'none' means no life area, otherwise the area id.
 */
export function parseLifeAreaSlug(
  raw?: string | null,
): number | null | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (raw === '' || raw === 'none' || raw === '0' || raw === UNSET_LIFE_AREA_SLUG) {
    return null;
  }

  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

/* =========================================================================
   Authorization Errors & Scope
   ========================================================================= */

export class AuthenticationError extends Error {
  readonly code = 'UNAUTHENTICATED';

  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenReferenceError extends Error {
  readonly code = 'FORBIDDEN_REFERENCE';

  constructor(
    readonly field: string,
    readonly id: number,
    message?: string,
  ) {
    super(message ?? `You are not authorized to reference ${field} ${id}.`);
    this.name = 'ForbiddenReferenceError';
  }
}

export class InactiveReferenceError extends Error {
  readonly code = 'INACTIVE_REFERENCE';

  constructor(
    readonly field: string,
    readonly id: number,
    message?: string,
  ) {
    super(message ?? `${field} ${id} is not active.`);
    this.name = 'InactiveReferenceError';
  }
}

/* =========================================================================
   Rich Text (TipTap) Helpers
   ========================================================================= */

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const stripped = stripHtml(html);
  return stripped.length === 0;
}

export function toEditorHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/<(p|h1|h2|h3|ul|ol|li|div|blockquote)[\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\r?\n\r?\n+/)
    .map((paragraph) => {
      const formatted = paragraph.replace(/\r?\n/g, "<br>");
      return `<p>${formatted}</p>`;
    })
    .join("");
}

/* =========================================================================
   HTTP Authorization Response Helper
   ========================================================================= */

export function authzResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { message: 'Unauthenticated' },
      { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  if (error instanceof ForbiddenReferenceError) {
    return NextResponse.json(
      {
        message: `Invalid ${error.field}`,
        errors: { [error.field]: ['This value is not available to you.'] },
      },
      { status: 403 },
    );
  }

  if (error instanceof InactiveReferenceError) {
    return NextResponse.json(
      {
        message: `Inactive ${error.field}`,
        errors: { [error.field]: ['This life area is not active.'] },
      },
      { status: 400 },
    );
  }

  return null;
}
