'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function createFlow(payload: {
  name: string;
  object_id: string;
  trigger_type: 'onCreate' | 'onUpdate' | 'onSave';
  conditions: any;
  actions: any;
}) {
  try {
    const { error } = await (supabaseAdmin.from('sf_flows') as any)
      .insert({
        name: payload.name,
        object_id: payload.object_id,
        trigger_type: payload.trigger_type,
        conditions: payload.conditions,
        actions: payload.actions,
        is_active: true
      });

    if (error) {
       console.warn('AO_DIAGNOSTIC (createFlow):', {
         code: error.code,
         message: error.message,
         hint: error.hint
       });
       return { success: false, error: error.message };
    }

    revalidatePath('/setup/flows');
    return { success: true };
  } catch (err: any) {
    console.warn('AO_DIAGNOSTIC (createFlow Exception):', err.message || err);
    return { success: false, error: err.message };
  }
}
