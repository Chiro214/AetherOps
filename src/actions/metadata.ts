'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Bypass offline generics bug in TS when using service-role in Next.js Server Actions
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getObjects(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('sf_objects')
    .select('*')
    .order('label', { ascending: true });
    
  if (error) {
    console.error('Error fetching objects:', error);
    return [];
  }
  return data || [];
}

export async function getObjectByApiName(apiName: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('sf_objects')
    .select('*')
    .ilike('api_name', apiName)
    .single();
    
  if (error) {
    console.error('Error fetching object:', error);
    return null;
  }
  return data;
}

export async function getFieldsForObject(objectId: string): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('sf_fields')
    .select('*')
    .eq('object_id', objectId)
    .order('field_label', { ascending: true });
    
  if (error) {
    console.error('Error fetching fields:', error);
    return [];
  }
  return data || [];
}

export async function createField(
  objectId: string,
  apiName: string,
  payload: {
    field_label: string;
    field_api_name: string;
    data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup';
    is_required: boolean;
    target_object_id?: string;
  }
) {
  try {
    const { error } = await (supabaseAdmin.from('sf_fields') as any).insert({
        object_id: objectId,
        field_label: payload.field_label,
        field_api_name: payload.field_api_name,
        data_type: payload.data_type,
        is_required: payload.is_required,
        is_custom: true, // all UI-created fields are custom
        target_object_id: payload.target_object_id || null,
      });

    if (error) {
      console.error('Error creating field:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception creating field:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
