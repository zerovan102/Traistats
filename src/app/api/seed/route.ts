import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const habitsToSeed = [
      { title: 'Read Book', icon: 'Book', colortheme: '#0A84FF', timeofday: 'Evening', frequency: 'Daily', subtitle: 'Daily • Evening' },
      { title: 'Workout', icon: 'Workout', colortheme: '#FF9F0A', timeofday: 'Morning', frequency: 'Daily', subtitle: 'Daily • Morning' },
      { title: 'Speaking Practice', icon: 'Study', colortheme: '#BF5AF2', timeofday: 'Afternoon', frequency: 'Daily', subtitle: 'Daily • Afternoon' },
      { title: 'Study', icon: 'Study', colortheme: '#30D158', timeofday: 'Morning', frequency: 'Daily', subtitle: 'Daily • Morning' },
      { title: 'Repeat Study', icon: 'Study', colortheme: '#30D158', timeofday: 'Evening', frequency: 'Daily', subtitle: 'Daily • Evening' },
      { title: 'New Skill', icon: 'Study', colortheme: '#FF453A', timeofday: 'Afternoon', frequency: 'Daily', subtitle: 'Daily • Afternoon' },
      { title: 'Tahajud', icon: 'Home', colortheme: '#BF5AF2', timeofday: 'Morning', frequency: 'Daily', subtitle: 'Daily • Morning' },
      { title: 'Dhuha', icon: 'Home', colortheme: '#FF9F0A', timeofday: 'Morning', frequency: 'Daily', subtitle: 'Daily • Morning' }
    ];

    const { data, error } = await supabase
      .from('habits')
      .insert(habitsToSeed)
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Berhasil mengimpor data dari Spreadsheet!', 
      data 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan seed data', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
