import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { handleApiError } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { id, type } = body as { id: number; type: string };

    if (!id || !type) {
      return NextResponse.json({ success: false, error: 'Missing id or type' }, { status: 400 });
    }

    let success = false;
    await withRequestContext(async ({ todo, framework, skill, journal }) => {
      if (type === 'daily' || type === 'upcoming' || type === 'missions' || type === 'todos') {
        success = await todo.hardDeleteTodo(id, userId);
      } else if (type === 'framework') {
        success = await framework.hardDeleteFramework(id, userId);
      } else if (type === 'skills') {
        success = await skill.hardDeleteSkill(id, userId);
      } else if (type === 'journals') {
        success = await journal.hardDeleteJournal(id, userId);
      }
    });

    return NextResponse.json({ success });
  } catch (error) {
    return handleApiError(error, 'Failed to permanently delete entity:');
  }
}
