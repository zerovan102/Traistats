import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to access id
    const { id } = await params;
    const { date, done } = await request.json();
    const habitId = parseInt(id, 10);

    if (done) {
      // Create log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert([{ habit_id: habitId, date }]);

      if (error && error.code !== '23505') { // Ignore unique violation if already exists
        throw error;
      }
      return NextResponse.json({ success: true, action: 'created' });
    } else {
      // Delete log
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, date });

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'deleted' });
    }
  } catch (error: any) {
    console.error('POST /api/habits/[id]/toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle habit', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
