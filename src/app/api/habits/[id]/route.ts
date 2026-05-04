import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;
    const habitId = parseInt(id, 10);

    // Hapus logs terlebih dahulu agar tidak terjadi foreign key constraint error
    await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId);

    // Baru hapus habit utamanya
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/habits/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
