export interface StaticJournalTag {
  id: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  sortNumber: number;
}

export interface StaticJournalCategory {
  id: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  sortNumber: number;
  tags: StaticJournalTag[];
}

export const JOURNAL_CATEGORY_NAMES = [
  'Logs',
  'Thoughts',
  'Feelings',
  'Notes',
] as const;

export const STATIC_JOURNAL_CATEGORIES: StaticJournalCategory[] = [
  {
    id: 1,
    slug: 'logs',
    nameEn: 'Logs',
    nameFa: 'گزارش‌ها',
    sortNumber: 1,
    tags: [
      { id: 1, slug: 'good-things', nameEn: 'good things', nameFa: 'اتفاقات خوب', sortNumber: 1 },
      { id: 2, slug: 'bad-events', nameEn: 'bad events', nameFa: 'اتفاقات بد', sortNumber: 2 },
      { id: 3, slug: 'new-experiences', nameEn: 'new experiences', nameFa: 'تجربه‌های جدید', sortNumber: 3 },
      { id: 4, slug: 'social-interactions', nameEn: 'social interactions', nameFa: 'تعاملات اجتماعی', sortNumber: 4 },
      { id: 5, slug: 'challenges', nameEn: 'challenges', nameFa: 'چالش‌ها', sortNumber: 5 },
      { id: 6, slug: 'observations', nameEn: 'observations', nameFa: 'مشاهدات', sortNumber: 6 },
    ],
  },
  {
    id: 2,
    slug: 'thoughts',
    nameEn: 'Thoughts',
    nameFa: 'افکار',
    sortNumber: 2,
    tags: [
      { id: 7, slug: 'ideas', nameEn: 'ideas', nameFa: 'ایده‌ها', sortNumber: 1 },
      { id: 8, slug: 'questions', nameEn: 'questions', nameFa: 'پرسش‌ها', sortNumber: 2 },
      { id: 9, slug: 'reflections', nameEn: 'reflections', nameFa: 'تاملات', sortNumber: 3 },
      { id: 10, slug: 'future-plans', nameEn: 'future plans', nameFa: 'برنامه‌های آینده', sortNumber: 4 },
      { id: 11, slug: 'possibilities', nameEn: 'possibilities', nameFa: 'امکان‌ها', sortNumber: 5 },
      { id: 12, slug: 'dreams', nameEn: 'dreams', nameFa: 'رویاها', sortNumber: 6 },
    ],
  },
  {
    id: 3,
    slug: 'feelings',
    nameEn: 'Feelings',
    nameFa: 'احساسات',
    sortNumber: 3,
    tags: [
      { id: 13, slug: 'positives', nameEn: 'positives', nameFa: 'مثبت‌ها', sortNumber: 1 },
      { id: 14, slug: 'negatives', nameEn: 'negatives', nameFa: 'منفی‌ها', sortNumber: 2 },
      { id: 15, slug: 'numbness', nameEn: 'numbness', nameFa: 'بی‌حسی', sortNumber: 3 },
      { id: 16, slug: 'confusion', nameEn: 'confusion', nameFa: 'سردرگمی', sortNumber: 4 },
    ],
  },
  {
    id: 4,
    slug: 'notes',
    nameEn: 'Notes',
    nameFa: 'یادداشت‌ها',
    sortNumber: 4,
    tags: [
      { id: 17, slug: 'playbooks', nameEn: 'playbooks', nameFa: 'راهنماها', sortNumber: 1 },
      { id: 18, slug: 'resources', nameEn: 'resources', nameFa: 'منابع', sortNumber: 2 },
      { id: 19, slug: 'inbox', nameEn: 'inbox', nameFa: 'صندوق ورودی', sortNumber: 3 },
      { id: 20, slug: 'temporary', nameEn: 'temporary', nameFa: 'موقت', sortNumber: 4 },
    ],
  },
];

export const STATIC_JOURNAL_TAGS: StaticJournalTag[] = STATIC_JOURNAL_CATEGORIES.flatMap(
  (cat) => cat.tags,
);

/**
 * Backward-compatible definition structure.
 */
export const JOURNAL_CATEGORIES = STATIC_JOURNAL_CATEGORIES.map((cat) => ({
  name: cat.nameEn as 'Logs' | 'Thoughts' | 'Feelings' | 'Notes',
  slug: cat.slug,
  nameEn: cat.nameEn,
  nameFa: cat.nameFa,
  tags: cat.tags.map((t) => t.nameEn),
}));
