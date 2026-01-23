import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { ajoId } = await req.json();
  const { data: ajo } = await supabase.from('ajos').select('*').eq('id', ajoId).single();
  if (!ajo) return NextResponse.json({ error: 'Ajo not found' }, { status: 404 });

  const { error } = await supabase.from('ajos')
    .update({ current_cycle: ajo.current_cycle + 1 })
    .eq('id', ajoId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
