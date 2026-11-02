import 'server-only';
import { getLocale } from '../lib/i18n/server';

/**
 * Server query for retrieving the current active locale.
 */
export async function getLocaleQuery(): Promise<string> {
  return await getLocale();
}
