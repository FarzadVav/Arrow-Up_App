import { TodoType } from '../entities';

export const SEED_USER = {
  id: 1,
  username: 'admin',
  password: 'password123',
  email: 'admin@lifeos.local',
  locale: 'en',
  colorScheme: 'system',
};

export interface SeedLifeArea {
  key: string;
  titleEn: string;
  titleFa: string;
  difficulty: number;
  vision: string;
}

export const SEED_LIFE_AREAS: readonly SeedLifeArea[] = [
  {
    key: 'lifestyle',
    titleEn: 'Lifestyle',
    titleFa: 'سبک زندگی',
    difficulty: 2,
    vision: '<p>Cultivate balance, intentional daily habits, and everyday mindfulness. Maintain a peaceful, uncluttered physical and mental environment.</p>',
  },
  {
    key: 'health',
    titleEn: 'Health',
    titleFa: 'سلامت',
    difficulty: 3,
    vision: '<p>Build a durable, high-energy body with consistent nutrition, restorative sleep, and rigorous daily physical movement.</p>',
  },
  {
    key: 'career',
    titleEn: 'Career',
    titleFa: 'شغل و حرفه',
    difficulty: 3,
    vision: '<p>Master software craftsmanship, design resilient distributed architectures, and build autonomous, high-impact products.</p>',
  },
  {
    key: 'social-connections',
    titleEn: 'Social Connections',
    titleFa: 'روابط اجتماعی',
    difficulty: 2,
    vision: '<p>Deepen meaningful relationships with family, friends, mentors, and the wider developer and open-source community.</p>',
  },
] as const;

// -------------------------------------------------------------
// Frameworks (Habits) & Tags
// -------------------------------------------------------------

export interface SeedFrameworkTag {
  key: string;
  title: string;
  lifeAreaKey: string;
}

export const SEED_FRAMEWORK_TAGS: readonly SeedFrameworkTag[] = [
  // Health
  { key: 'health-cardio', title: 'Cardio & Stamina', lifeAreaKey: 'health' },
  { key: 'health-strength', title: 'Strength & Mobility', lifeAreaKey: 'health' },
  { key: 'health-recovery', title: 'Sleep & Recovery', lifeAreaKey: 'health' },
  { key: 'health-nutrition', title: 'Nutrition & Fuel', lifeAreaKey: 'health' },
  // Career
  { key: 'career-focus', title: 'Deep Focus', lifeAreaKey: 'career' },
  { key: 'career-arch', title: 'System Architecture', lifeAreaKey: 'career' },
  { key: 'career-cadence', title: 'Execution Cadence', lifeAreaKey: 'career' },
  // Lifestyle
  { key: 'lifestyle-morning', title: 'Morning Routine', lifeAreaKey: 'lifestyle' },
  { key: 'lifestyle-evening', title: 'Evening Rituals', lifeAreaKey: 'lifestyle' },
  { key: 'lifestyle-mindfulness', title: 'Mindfulness', lifeAreaKey: 'lifestyle' },
  // Social Connections
  { key: 'social-family', title: 'Family & Friends', lifeAreaKey: 'social-connections' },
  { key: 'social-community', title: 'Community & Mentoring', lifeAreaKey: 'social-connections' },
] as const;

export interface SeedFramework {
  title: string;
  description: string;
  lifeAreaKey: string | null;
  tagKey: string | null;
  history: Array<{ date: string; isDone: boolean }>;
}

export const SEED_FRAMEWORKS: readonly SeedFramework[] = [
  // Health Frameworks
  {
    title: 'Zone-2 Aerobic Running (45m)',
    description: '<p>Maintain heart rate between 130-140 BPM to optimize fat oxidation, mitochondrial density, and cardiovascular endurance.</p>',
    lifeAreaKey: 'health',
    tagKey: 'health-cardio',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: false },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },
  {
    title: 'Morning Cold Shower & Box Breathing',
    description: '<p>3-minute cold exposure preceded by 4 rounds of box breathing (4s in, 4s hold, 4s out, 4s hold) to tone the vagal nerve.</p>',
    lifeAreaKey: 'health',
    tagKey: 'health-recovery',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },
  {
    title: 'Full-Body Mobility & Foam Rolling',
    description: '<p>15 minutes targeting hip flexors, thoracic spine rotations, ankles, and hamstring release.</p>',
    lifeAreaKey: 'health',
    tagKey: 'health-strength',
    history: [
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: false },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },
  {
    title: 'Hydration & Electrolytes (3.5L)',
    description: '<p>Drink 3.5 liters of filtered water with Himalayan pink salt and magnesium minerals throughout the working day.</p>',
    lifeAreaKey: 'health',
    tagKey: 'health-nutrition',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: false },
    ],
  },

  // Career Frameworks
  {
    title: 'Morning Deep Work Block (90m)',
    description: '<p>Phone locked in drawer, notifications muted, working solely on core architectural algorithms before reading any emails or chats.</p>',
    lifeAreaKey: 'career',
    tagKey: 'career-focus',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },
  {
    title: 'Distributed Systems RFC & Paper Review',
    description: '<p>Read and digest one whitepaper or technical architecture RFC (e.g., Raft consensus, LSM-tree storage, Vector Clocks).</p>',
    lifeAreaKey: 'career',
    tagKey: 'career-arch',
    history: [
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: false },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: false },
    ],
  },
  {
    title: 'Zero-Inbox PR & GitHub Triage',
    description: '<p>Batch process open pull requests, issue reviews, and customer feedback at 4:30 PM before ending work hours.</p>',
    lifeAreaKey: 'career',
    tagKey: 'career-cadence',
    history: [
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },

  // Lifestyle Frameworks
  {
    title: 'Morning Sunlight Viewing (10m)',
    description: '<p>View natural outdoor sunlight without sunglasses within 30 minutes of waking to anchor the circadian clock and trigger cortisol peak.</p>',
    lifeAreaKey: 'lifestyle',
    tagKey: 'lifestyle-morning',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },
  {
    title: 'Digital Shutdown at 22:00',
    description: '<p>All screens off, blue blockers on, transitioning into low-light reading or journaling for restorative sleep latency.</p>',
    lifeAreaKey: 'lifestyle',
    tagKey: 'lifestyle-evening',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: false },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: false },
    ],
  },
  {
    title: 'Daily Win & Gratitude Journaling',
    description: '<p>Record 3 specific gratitude items and identify the single non-negotiable win for today.</p>',
    lifeAreaKey: 'lifestyle',
    tagKey: 'lifestyle-mindfulness',
    history: [
      { date: '2026-10-28', isDone: true },
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: true },
    ],
  },

  // Social Connections Frameworks
  {
    title: 'Distraction-Free Loved One Call',
    description: '<p>A dedicated 15-minute phone or video conversation with family or close friends with zero multitasking.</p>',
    lifeAreaKey: 'social-connections',
    tagKey: 'social-family',
    history: [
      { date: '2026-10-29', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
      { date: '2026-11-03', isDone: false },
    ],
  },
  {
    title: 'Open Source Mentoring & Code Reviews',
    description: '<p>Review community issues, offer guidance on developer forums, and help open source contributors.</p>',
    lifeAreaKey: 'social-connections',
    tagKey: 'social-community',
    history: [
      { date: '2026-10-30', isDone: true },
      { date: '2026-10-31', isDone: true },
      { date: '2026-11-01', isDone: true },
      { date: '2026-11-02', isDone: true },
    ],
  },

  // Abandoned Framework (No life area, no tag)
  {
    title: 'Legacy Pomodoro Sprint (25/5)',
    description: '<p>Archived timeboxing sprint technique from university studies. Unassigned to any active life area, kept for reference.</p>',
    lifeAreaKey: null,
    tagKey: null,
    history: [
      { date: '2026-10-25', isDone: true },
      { date: '2026-10-26', isDone: true },
      { date: '2026-10-27', isDone: false },
    ],
  },
] as const;

// -------------------------------------------------------------
// Todos & Missions
// -------------------------------------------------------------

export interface SeedTodoAction {
  title: string;
  deadline: string | null;
  isDone: boolean;
}

export interface SeedTodoDiscipline {
  title: string;
  history: Array<{ date: string; isDone: boolean }>;
}

export interface SeedTodo {
  title: string;
  type: TodoType;
  deadline: string | null;
  difficulty: number;
  isDone: boolean;
  description?: string;
  lifeAreaKey: string;
  actions?: SeedTodoAction[];
  disciplines?: SeedTodoDiscipline[];
}

export const SEED_TODOS: readonly SeedTodo[] = [
  // --- Daily Focus ---
  {
    title: 'Cold shower and 20-minute mobility routine',
    type: TodoType.DAILY,
    deadline: '07:00',
    difficulty: 1,
    isDone: true,
    lifeAreaKey: 'health',
  },
  {
    title: 'Review pull requests and deploy SaaS hotfix',
    type: TodoType.DAILY,
    deadline: '09:30',
    difficulty: 2,
    isDone: true,
    lifeAreaKey: 'career',
  },
  {
    title: 'Deep work: Implement MikroORM seeder optimization',
    type: TodoType.DAILY,
    deadline: '11:30',
    difficulty: 3,
    isDone: true,
    lifeAreaKey: 'career',
  },
  {
    title: 'Read 25 pages of Systems Architecture & Design',
    type: TodoType.DAILY,
    deadline: '14:00',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'career',
  },
  {
    title: '45-minute Zone-2 aerobic endurance run',
    type: TodoType.DAILY,
    deadline: '17:00',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'health',
  },
  {
    title: 'Call family & plan weekend gathering',
    type: TodoType.DAILY,
    deadline: '19:30',
    difficulty: 1,
    isDone: false,
    lifeAreaKey: 'social-connections',
  },
  {
    title: 'Track macros, review day journals, and drink 3.5L water',
    type: TodoType.DAILY,
    deadline: '21:30',
    difficulty: 1,
    isDone: false,
    lifeAreaKey: 'health',
  },
  {
    title: 'Evening digital shutdown and gratitude reflection',
    type: TodoType.DAILY,
    deadline: '22:30',
    difficulty: 1,
    isDone: false,
    lifeAreaKey: 'lifestyle',
  },

  // --- Upcoming Targets ---
  {
    title: 'Prepare quarterly roadmap & team architectural sync',
    type: TodoType.UPCOMING,
    deadline: '2026-11-06',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'career',
  },
  {
    title: 'Renew developer server SSL certificates & cloud CDN',
    type: TodoType.UPCOMING,
    deadline: '2026-11-09',
    difficulty: 1,
    isDone: true,
    lifeAreaKey: 'career',
  },
  {
    title: 'Dentist appointment and annual health checkup',
    type: TodoType.UPCOMING,
    deadline: '2026-11-12',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'health',
  },
  {
    title: 'Schedule quarterly mentor sync with senior engineering leads',
    type: TodoType.UPCOMING,
    deadline: '2026-11-16',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'social-connections',
  },
  {
    title: 'Audit recurring SaaS subscriptions & cloud costs',
    type: TodoType.UPCOMING,
    deadline: '2026-11-20',
    difficulty: 1,
    isDone: false,
    lifeAreaKey: 'lifestyle',
  },
  {
    title: 'Deploy public marketing landing page v2',
    type: TodoType.UPCOMING,
    deadline: '2026-11-25',
    difficulty: 3,
    isDone: false,
    lifeAreaKey: 'career',
  },
  {
    title: 'Host weekend board game night with friends',
    type: TodoType.UPCOMING,
    deadline: '2026-11-30',
    difficulty: 1,
    isDone: false,
    lifeAreaKey: 'social-connections',
  },

  // --- Missions ---
  {
    title: 'Launch LifeOS v1 MVP to beta cohort',
    type: TodoType.MISSION,
    deadline: '2026-11-30',
    difficulty: 4,
    isDone: false,
    lifeAreaKey: 'career',
    description: '<p>Release high-performance personal operating system to 100 beta testers. Ensure 99.9% uptime, seamless offline navigation, and sub-100ms interaction latency.</p>',
    actions: [
      {
        title: 'Finalize offline sync and cache invalidation protocols',
        deadline: '2026-11-05',
        isDone: true,
      },
      {
        title: 'Draft interactive onboarding guide & documentation',
        deadline: '2026-11-10',
        isDone: true,
      },
      {
        title: 'Deploy staging environment and execute end-to-end smoke tests',
        deadline: '2026-11-18',
        isDone: false,
      },
      {
        title: 'Distribute invite keys to beta users',
        deadline: '2026-11-25',
        isDone: false,
      },
      {
        title: 'Collect feedback and publish v1.0.1 stability patch',
        deadline: '2026-11-30',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Work on core product architecture daily (2 hrs)',
        history: [
          { date: '2026-10-30', isDone: true },
          { date: '2026-10-31', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
          { date: '2026-11-03', isDone: true },
        ],
      },
      {
        title: 'Review user telemetry & bug reports every morning',
        history: [
          { date: '2026-10-31', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
          { date: '2026-11-03', isDone: true },
        ],
      },
    ],
  },
  {
    title: 'Run a sub-4 hour marathon',
    type: TodoType.MISSION,
    deadline: '2026-12-20',
    difficulty: 3,
    isDone: false,
    lifeAreaKey: 'health',
    description: '<p>Build aerobic durability to sustain a 5:35 min/km pace over 42.195 km without hitting the wall.</p>',
    actions: [
      {
        title: 'Complete 30km Sunday long run at race pace',
        deadline: '2026-11-15',
        isDone: true,
      },
      {
        title: 'Optimize race day carb loading & electrolyte hydration protocol',
        deadline: '2026-12-01',
        isDone: false,
      },
      {
        title: 'Taper mileage volume by 40% two weeks prior to marathon day',
        deadline: '2026-12-10',
        isDone: false,
      },
      {
        title: 'Inspect shoes, race bib, and nutrition gels',
        deadline: '2026-12-18',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Morning mobility, calf stretches, and foam rolling',
        history: [
          { date: '2026-10-30', isDone: true },
          { date: '2026-10-31', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
          { date: '2026-11-03', isDone: true },
        ],
      },
      {
        title: 'Zone 2 aerobic endurance run (60 mins)',
        history: [
          { date: '2026-10-30', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
        ],
      },
    ],
  },
  {
    title: 'Build automated wealth compounding engine',
    type: TodoType.MISSION,
    deadline: '2026-12-31',
    difficulty: 3,
    isDone: false,
    lifeAreaKey: 'lifestyle',
    description: '<p>Design an autonomous financial system that automatically saves, allocates, and tracks cashflow with zero manual stress.</p>',
    actions: [
      {
        title: 'Audit recurring monthly expenses & cancel unused services',
        deadline: '2026-11-04',
        isDone: true,
      },
      {
        title: 'Set up automated DCA transfers into broad global index fund',
        deadline: '2026-11-10',
        isDone: true,
      },
      {
        title: 'Establish 6-month liquid emergency fund in high-yield account',
        deadline: '2026-12-15',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Log discretionary expenses before sleeping',
        history: [
          { date: '2026-10-31', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
          { date: '2026-11-03', isDone: true },
        ],
      },
    ],
  },
  {
    title: 'Deepen Community & Family Bonds',
    type: TodoType.MISSION,
    deadline: '2026-12-25',
    difficulty: 2,
    isDone: false,
    lifeAreaKey: 'social-connections',
    description: '<p>Nurture high-trust connections with family, organize monthly community meetups, and mentor junior engineers.</p>',
    actions: [
      {
        title: 'Plan and book annual family reunion trip',
        deadline: '2026-11-20',
        isDone: false,
      },
      {
        title: 'Deliver a talk at local tech meetup on distributed systems',
        deadline: '2026-12-05',
        isDone: false,
      },
      {
        title: 'Conduct 4 one-on-one engineering mentorship sessions',
        deadline: '2026-12-15',
        isDone: true,
      },
    ],
    disciplines: [
      {
        title: 'Distraction-free conversation with a friend or family member',
        history: [
          { date: '2026-10-31', isDone: true },
          { date: '2026-11-01', isDone: true },
          { date: '2026-11-02', isDone: true },
          { date: '2026-11-03', isDone: true },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
// Journals (Across all static categories and tags)
// -------------------------------------------------------------

export interface SeedJournal {
  title: string;
  content: string;
  categorySlug: 'logs' | 'thoughts' | 'feelings' | 'notes';
  tagSlug: string;
  createdAt: Date;
}

export const SEED_JOURNALS: readonly SeedJournal[] = [
  // --- Category: Logs ---
  {
    title: 'Celebrated first major product milestone with the team',
    content: '<p>Completed the alpha testing phase with over 100 successful runs. It feels rewarding to see months of foundational architectural work paying off. Team spirits are exceptionally high.</p>',
    categorySlug: 'logs',
    tagSlug: 'good-things',
    createdAt: new Date('2026-11-03T11:45:00Z'),
  },
  {
    title: 'Encountered a production network outage during DNS propagation',
    content: '<p>A DNS record misconfiguration caused an 18-minute outage on the staging cluster. Traced root cause to manual TTL overrides. Postmortem action item: automate DNS propagation checks in CI pipeline.</p>',
    categorySlug: 'logs',
    tagSlug: 'bad-events',
    createdAt: new Date('2026-11-02T16:20:00Z'),
  },
  {
    title: 'First outdoor bouldering session in the mountains',
    content: '<p>Went climbing outdoors with Alex and Sarah. Completely different tactile experience than indoor gym walls. Foot placement requires 100% mindfulness. Highly refreshing for the mind.</p>',
    categorySlug: 'logs',
    tagSlug: 'new-experiences',
    createdAt: new Date('2026-11-01T15:30:00Z'),
  },
  {
    title: 'Productive dinner with fellow engineering founders',
    content: '<p>Discussed bootstrapping economics, pricing strategies, and customer retention. Universal consensus: building a high-trust product with obsessive UX beats aggressive advertising every single time.</p>',
    categorySlug: 'logs',
    tagSlug: 'social-interactions',
    createdAt: new Date('2026-10-31T20:15:00Z'),
  },
  {
    title: 'Refactoring database relations to strict foreign keys',
    content: '<p>Migrated polymorphic relations to explicit foreign keys with ON DELETE SET NULL. Took careful query testing to avoid breaking existing joins, but schema integrity is now rock solid.</p>',
    categorySlug: 'logs',
    tagSlug: 'challenges',
    createdAt: new Date('2026-10-30T14:10:00Z'),
  },
  {
    title: 'Noticing deep flow state triggers in early morning hours',
    content: '<p>Woke up at 6:00 AM without an alarm. Completed a 2-hour uninterrupted coding session on core data algorithms. When external notifications are muted, mental clarity reaches a completely different plane.</p>',
    categorySlug: 'logs',
    tagSlug: 'observations',
    createdAt: new Date('2026-10-29T08:00:00Z'),
  },

  // --- Category: Thoughts ---
  {
    title: 'Frictionless mission creation via AI voice prompt',
    content: '<p>Idea: Instead of a multi-field form, allow user to dictate a quick voice memo like "Prepare marathon training schedule for December". AI parses it into an actionable mission with broken-down disciplines and milestones.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'ideas',
    createdAt: new Date('2026-10-28T19:00:00Z'),
  },
  {
    title: 'What makes software truly feel weightless and responsive?',
    content: '<p>Why do some applications feel joyful to use while others feel heavy? It boils down to optimistic updates, zero layout shifts, predictable navigation, and sub-50ms visual feedback on every tap.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'questions',
    createdAt: new Date('2026-10-27T17:40:00Z'),
  },
  {
    title: 'Mental stillness and handling urgency with calm logic',
    content: '<p>Urgency is often an emotional illusion created by disorganized thoughts. When feeling overwhelmed, write down all moving pieces on physical paper, categorize by priority, and tackle solely the first item with zero regard for the rest.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'reflections',
    createdAt: new Date('2026-10-26T21:10:00Z'),
  },
  {
    title: 'Vision 2028: Autonomous product freedom & craftsmanship',
    content: '<p>Envisioning myself running independent software products with hundreds of happy users, living in a quiet place close to nature, with full control over time and creative energy. Daily discipline today constructs that reality.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'future-plans',
    createdAt: new Date('2026-10-25T10:30:00Z'),
  },
  {
    title: 'Could local-first WebAssembly engines replace backend heavy processing?',
    content: '<p>Considering compiling our data analysis algorithms to WebAssembly via Rust. If users can execute complex filtering entirely client-side, server costs drop by 90% and privacy increases tenfold.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'possibilities',
    createdAt: new Date('2026-10-24T13:20:00Z'),
  },
  {
    title: 'Living in a quiet cabin by the forest while writing code',
    content: '<p>I dream of a wooden desk overlooking misty pine trees, a wood-burning stove in the winter, and crisp morning air. Technology harmonized with organic serenity.</p>',
    categorySlug: 'thoughts',
    tagSlug: 'dreams',
    createdAt: new Date('2026-10-23T22:50:00Z'),
  },

  // --- Category: Feelings ---
  {
    title: 'Profound calm and physical groundedness after endurance run',
    content: '<p>Completed an easy 12km run at sunrise. Feeling peaceful, physically relaxed, and deeply grounded. Experiencing immense gratitude for health, endurance, and quiet mornings.</p>',
    categorySlug: 'feelings',
    tagSlug: 'positives',
    createdAt: new Date('2026-10-22T08:15:00Z'),
  },
  {
    title: 'Slight cognitive fatigue after consecutive 10-hour sprint days',
    content: '<p>Feeling depleted after pushing too hard on product deadlines this week. Noticeable dip in creative enthusiasm. Need to respect biological limits: taking tomorrow completely offline to recharge.</p>',
    categorySlug: 'feelings',
    tagSlug: 'negatives',
    createdAt: new Date('2026-10-21T21:30:00Z'),
  },
  {
    title: 'Sensation of mechanical repetition when doing repetitive chores',
    content: '<p>Caught myself feeling emotionally detached and numb while dealing with administrative paperwork and routine bureaucracy. Need to introduce variety and reconnect with purposeful creative work.</p>',
    categorySlug: 'feelings',
    tagSlug: 'numbness',
    createdAt: new Date('2026-10-20T16:00:00Z'),
  },
  {
    title: 'Navigating conflicting business trade-offs on product roadmap',
    content: '<p>Torn between polishing existing core features versus shipping enterprise integrations requested by prospective clients. Stepping back to re-evaluate our long-term North Star before making hasty commitments.</p>',
    categorySlug: 'feelings',
    tagSlug: 'confusion',
    createdAt: new Date('2026-10-19T18:45:00Z'),
  },

  // --- Category: Notes ---
  {
    title: 'Incident response & hotfix deployment standard playbook',
    content: '<p><strong>Step 1:</strong> Replicate issue in staging. <strong>Step 2:</strong> Branch hotfix directly from main. <strong>Step 3:</strong> Write regression test. <strong>Step 4:</strong> Deploy behind canary toggle. <strong>Step 5:</strong> Write incident postmortem within 24h.</p>',
    categorySlug: 'notes',
    tagSlug: 'playbooks',
    createdAt: new Date('2026-10-18T14:00:00Z'),
  },
  {
    title: 'Essential resources on distributed systems & concurrency',
    content: '<p>1. Designing Data-Intensive Applications (Kleppmann). 2. Raft paper: In Search of an Understandable Consensus Algorithm. 3. PostgreSQL Internals (Rogov). 4. Reactive Systems Manifesto.</p>',
    categorySlug: 'notes',
    tagSlug: 'resources',
    createdAt: new Date('2026-10-17T11:00:00Z'),
  },
  {
    title: 'Quick inbox captures: Books to read & tools to inspect',
    content: '<p>Books: Antifragile (Taleb), The Design of Everyday Things (Norman). Tools to inspect: Base UI React components, Vitest 3 concurrency, Bun test runner performance.</p>',
    categorySlug: 'notes',
    tagSlug: 'inbox',
    createdAt: new Date('2026-10-16T09:30:00Z'),
  },
  {
    title: 'Temporary scratch notes for tonight database migration',
    content: '<p>Ensure backup is taken with `pnpm db:backup` before running `pnpm db:push`. Verify connection pool count does not exceed Supabase 15-client limit during schema alter.</p>',
    categorySlug: 'notes',
    tagSlug: 'temporary',
    createdAt: new Date('2026-10-15T22:15:00Z'),
  },
] as const;
