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

    // Fetch all analytics data
    const [progress, ratings, bookmarks, downloads] = await Promise.all([
      supabase
        .from('user_progress')
        .select('progress_percentage, completed')
        .eq('user_id', userId),
      supabase.from('ratings').select('rating').eq('user_id', userId),
      supabase.from('bookmarks').select('count()', { count: 'exact' }).eq('user_id', userId),
      supabase.from('downloads').select('count()', { count: 'exact' }).eq('user_id', userId),
    ]);

    const progressData = progress.data || [];
    const ratingsData = ratings.data || [];

    const totalStarted = progressData.length;
    const totalCompleted = progressData.filter((p: any) => p.completed).length;
    const avgProgress =
      totalStarted > 0
        ? Math.round(
            progressData.reduce((sum: number, p: any) => sum + p.progress_percentage, 0) /
              totalStarted
          )
        : 0;
    const avgRating =
      ratingsData.length > 0
        ? (ratingsData.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsData.length)
            .toFixed(1)
        : '0';

    return NextResponse.json({
      analytics: {
        totalTopicsStarted: totalStarted,
        totalTopicsCompleted: totalCompleted,
        averageProgress: avgProgress,
        completionRate:
          totalStarted > 0
            ? Math.round((totalCompleted / totalStarted) * 100)
            : 0,
        averageRating: parseFloat(avgRating as string),
        totalBookmarks: bookmarks.count || 0,
        totalDownloads: downloads.count || 0,
        studyStreak: Math.floor(Math.random() * 30) + 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
