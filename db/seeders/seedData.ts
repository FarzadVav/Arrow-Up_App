import { JournalCategory, TodoType } from '../entities';

export const SEED_USER = {
  id: 1,
  username: 'admin',
  password: 'password123',
  email: 'admin@lifeos.local',
  locale: 'fa',
  colorScheme: 'system',
};

export const SEED_TODOS = [
  // --- Daily Focus ---
  {
    title: 'Review pull requests and deploy SaaS hotfix',
    type: TodoType.DAILY,
    deadline: '10:30',
    isDone: true,
  },
  {
    title: 'Cold shower and 20-minute mobility routine',
    type: TodoType.DAILY,
    deadline: '07:00',
    isDone: true,
  },
  {
    title: 'Deep work: Write 500 lines of core logic',
    type: TodoType.DAILY,
    deadline: '13:00',
    isDone: false,
  },
  {
    title: 'Read 20 pages of Systems Architecture',
    type: TodoType.DAILY,
    deadline: '18:00',
    isDone: false,
  },
  {
    title: 'Track macros and drink 3L water',
    type: TodoType.DAILY,
    deadline: '21:30',
    isDone: false,
  },

  // --- Upcoming Targets ---
  {
    title: 'Prepare presentation for Q4 product roadmap',
    type: TodoType.UPCOMING,
    deadline: '2026-10-22T00:00:00.000Z',
    isDone: false,
  },
  {
    title: 'Finalize Stripe & ZarinPal payment gateway integration',
    type: TodoType.UPCOMING,
    deadline: '2026-10-25T00:00:00.000Z',
    isDone: false,
  },
  {
    title: 'Schedule quarterly team sync and performance reviews',
    type: TodoType.UPCOMING,
    deadline: '2026-10-28T00:00:00.000Z',
    isDone: false,
  },
  {
    title: 'Renew developer server & cloud certificates',
    type: TodoType.UPCOMING,
    deadline: '2026-11-02T00:00:00.000Z',
    isDone: true,
  },
  {
    title: 'Deploy public marketing landing page v2',
    type: TodoType.UPCOMING,
    deadline: '2026-11-10T00:00:00.000Z',
    isDone: false,
  },

  // --- Missions ---
  {
    title: 'Launch LifeOS v1 MVP to initial beta users',
    type: TodoType.MISSION,
    deadline: '2026-10-30T00:00:00.000Z',
    difficulty: 4,
    isDone: false,
    actions: [
      {
        title: 'Finalize offline sync and cache invalidation',
        deadline: '2026-10-18T00:00:00.000Z',
        isDone: true,
      },
      {
        title: 'Draft documentation and interactive help guides',
        deadline: '2026-10-22T00:00:00.000Z',
        isDone: true,
      },
      {
        title: 'Deploy to staging and run smoke tests',
        deadline: '2026-10-25T00:00:00.000Z',
        isDone: false,
      },
      {
        title: 'Send beta invites to 50 curated high-performers',
        deadline: '2026-10-30T00:00:00.000Z',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Work on core product architecture daily',
        history: [
          { date: '2026-10-15T10:00:00Z', isDone: true },
          { date: '2026-10-16T10:00:00Z', isDone: true },
          { date: '2026-10-17T10:00:00Z', isDone: true },
        ],
      },
      {
        title: 'Collect feedback from potential early adopters',
        history: [
          { date: '2026-10-15T14:00:00Z', isDone: true },
          { date: '2026-10-17T14:00:00Z', isDone: true },
        ],
      },
    ],
  },
  {
    title: 'Build automated wealth compounding engine',
    type: TodoType.MISSION,
    deadline: '2026-12-15T00:00:00.000Z',
    difficulty: 5,
    isDone: false,
    actions: [
      {
        title: 'Audit recurring monthly expenses & unnecessary subscriptions',
        deadline: '2026-10-20T00:00:00.000Z',
        isDone: true,
      },
      {
        title: 'Automate monthly DCA into global index funds and gold reserve',
        deadline: '2026-11-01T00:00:00.000Z',
        isDone: false,
      },
      {
        title: 'Establish 6-month liquid emergency buffer in high-yield account',
        deadline: '2026-12-15T00:00:00.000Z',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Track discretionary expenses before sleep',
        history: [
          { date: '2026-10-16T21:00:00Z', isDone: true },
          { date: '2026-10-17T21:00:00Z', isDone: true },
        ],
      },
    ],
  },
  {
    title: 'Run a sub-4 hour marathon',
    type: TodoType.MISSION,
    deadline: '2026-11-20T00:00:00.000Z',
    difficulty: 3,
    isDone: false,
    actions: [
      {
        title: 'Complete 28km Sunday long run with negative splits',
        deadline: '2026-10-24T00:00:00.000Z',
        isDone: true,
      },
      {
        title: 'Optimize race day carb loading & hydration protocol',
        deadline: '2026-11-10T00:00:00.000Z',
        isDone: false,
      },
      {
        title: 'Taper volume by 40% two weeks prior to race day',
        deadline: '2026-11-15T00:00:00.000Z',
        isDone: false,
      },
    ],
    disciplines: [
      {
        title: 'Morning mobility, calf stretches, and foam rolling',
        history: [
          { date: '2026-10-16T07:00:00Z', isDone: true },
          { date: '2026-10-17T07:00:00Z', isDone: true },
        ],
      },
      {
        title: 'Zone 2 heart rate aerobic endurance run (60 mins)',
        history: [
          { date: '2026-10-15T06:30:00Z', isDone: true },
          { date: '2026-10-17T06:30:00Z', isDone: true },
        ],
      },
    ],
  },
];

export const SEED_JOURNALS = [
  {
    title: 'Reflecting on deep work & morning momentum',
    content:
      '<p>Woke up at 6:30 AM without alarm. Completed a 2-hour uninterrupted coding session on the core architecture. When external notifications are muted, mental clarity reaches a completely different plane. Need to protect this time slot religiously.</p>',
    type: JournalCategory.LOGS,
    createdAt: new Date('2026-10-17T07:45:00Z'),
  },
  {
    title: 'SaaS micro-features and customer onboarding flow',
    content:
      '<p>Idea for onboarding: Instead of a generic 5-step tour that users immediately skip, trigger an interactive challenge that lets them configure their first real mission in under 60 seconds. Frictionless "aha" moment.</p>',
    type: JournalCategory.IDEAS,
    createdAt: new Date('2026-10-16T18:20:00Z'),
  },
  {
    title: 'Calm evening after heavy workout',
    content:
      '<p>Pushed hard in today\'s pull-up and upper body training session. Feeling peaceful and physically grounded. Experiencing gratitude for health, endurance, and quiet evenings where I can just read and breathe.</p>',
    type: JournalCategory.FEELINGS,
    createdAt: new Date('2026-10-15T21:15:00Z'),
  },
  {
    title: 'Daily execution log: Feature-based modular refactoring',
    content:
      '<p>Implemented the feature architecture across the app. Cleaned up dependencies, harmonized UI tokens, and verified Drawer interactions. Clean code reduces cognitive anxiety significantly.</p>',
    type: JournalCategory.LOGS,
    createdAt: new Date('2026-10-14T14:30:00Z'),
  },
  {
    title: 'Vision 2028: Autonomous freedom & craftsmanship',
    content:
      '<p>Envisioning myself running independent software products with hundreds of happy users, living in a quiet place close to nature, with full control over time and creative energy. Daily discipline today constructs that reality.</p>',
    type: JournalCategory.THOUGHTS,
    createdAt: new Date('2026-10-13T10:00:00Z'),
  },
  {
    title: 'A wish for sustained curiosity & humility',
    content:
      '<p>I wish to never lose the hunger to learn foundational things from scratch — whether it\'s low-level systems, new languages, or human psychology. True confidence is quiet and always curious.</p>',
    type: JournalCategory.NOTES,
    createdAt: new Date('2026-10-12T22:40:00Z'),
  },
  {
    title: 'Core engineering principles checklist',
    content:
      '<p>Key principles: 1. Keep state local until needed globally. 2. Build for resilience and offline-first. 3. Prefer declarative primitives over complex imperatives. 4. Never sacrifice user experience for micro-optimizations.</p>',
    type: JournalCategory.NOTES,
    createdAt: new Date('2026-10-10T16:00:00Z'),
  },
  {
    title: 'Mental stillness during high pressure deadlines',
    content:
      '<p>Urgency is often an emotional illusion created by disorganized thoughts. When feeling overwhelmed, write down all moving pieces on physical paper, categorize by priority, and tackle solely the first item with zero regard for the rest.</p>',
    type: JournalCategory.THOUGHTS,
    createdAt: new Date('2026-10-08T11:20:00Z'),
  },
];
