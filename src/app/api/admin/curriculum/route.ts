import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await getAdminClient();

    const { data: years, error } = await supabase
      .from('years')
      .select(`
        *,
        semesters (
          *,
          subjects (
            *,
            units (
              *,
              topics (*)
            )
          )
        )
      `)
      .order('number');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ years });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAdminClient();
    const body = await request.json();
    const { type, data } = body;

    if (type === 'year') {
      const { data: year, error } = await supabase
        .from('years')
        .insert(data)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ year });
    }

    if (type === 'semester') {
      const { data: semester, error } = await supabase
        .from('semesters')
        .insert(data)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ semester });
    }

    if (type === 'subject') {
      const { data: subject, error } = await supabase
        .from('subjects')
        .insert(data)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ subject });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
