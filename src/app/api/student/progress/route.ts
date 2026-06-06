import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

async function getStudentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await getStudentClient();

    const { data: progress, error } = await supabase
      .from('user_progress')
      .select(
        `
        id,
        progress_percentage,
        completed,
        last_accessed_at,
        topics(title, units(title, subjects(title)))
      `
      )
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, topicId, progressPercentage, completed } = body;

    if (!userId || !topicId) {
      return NextResponse.json({ error: 'User ID and Topic ID required' }, { status: 400 });
    }

    const supabase = await getStudentClient();

    const { data: updated, error } = await supabase
      .from('user_progress')
      .update({
        progress_percentage: progressPercentage,
        completed,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ progress: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
