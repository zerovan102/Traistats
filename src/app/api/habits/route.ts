import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Ambil habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .order('id', { ascending: true });

    if (habitsError) throw habitsError;

    // Ambil logs untuk hari tertentu
    let logsData: any[] = [];
    if (date) {
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', date);
      
      if (logsError) throw logsError;
      logsData = logs || [];
    }

    // Gabungkan data dan sesuaikan nama kolom lowercase dari postgres
    const habitsWithLogs = habits?.map((habit: any) => ({
      ...habit,
      timeOfDay: habit.timeofday,
      colorTheme: habit.colortheme,
      logs: logsData.filter(log => log.habit_id === habit.id)
    }));

    return NextResponse.json(habitsWithLogs);
  } catch (error: any) {
    console.error('GET /api/habits error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { data: habit, error } = await supabase
      .from('habits')
      .insert([
        {
          title: data.title,
          icon: data.icon || 'Workout',
          subtitle: data.subtitle || `${data.frequency || 'Daily'} • ${data.timeOfDay || 'Morning'}`,
          frequency: data.frequency || 'Daily',
          timeofday: data.timeOfDay || 'Morning',
          colortheme: data.colorTheme || '#0A84FF',
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(habit);
  } catch (error: any) {
    console.error('POST /api/habits error:', error);
    return NextResponse.json(
      { error: 'Failed to create habit', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
