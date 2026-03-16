'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Bypass offline generics bug in TS when using service-role in Next.js Server Actions
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getObjects(): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_objects')
      .select('*')
      .order('label', { ascending: true });
      
    if (error) {
      console.warn('AO_DIAGNOSTIC (getObjects):', {
        code: error.code,
        message: error.message,
        hint: error.hint
      });
      // Fallback for dev/setup
      return [
        { id: 'obj1', label: 'Account', plural_label: 'Accounts', api_name: 'Account', is_custom: false },
        { id: 'obj2', label: 'Contact', plural_label: 'Contacts', api_name: 'Contact', is_custom: false },
        { id: 'obj3', label: 'Opportunity', plural_label: 'Opportunities', api_name: 'Opportunity', is_custom: false },
        { id: 'obj4', label: 'Lead', plural_label: 'Leads', api_name: 'Lead', is_custom: false }
      ];
    }
    return data && data.length > 0 ? data : [
      { id: 'obj1', label: 'Account', plural_label: 'Accounts', api_name: 'Account', is_custom: false },
      { id: 'obj2', label: 'Contact', plural_label: 'Contacts', api_name: 'Contact', is_custom: false },
      { id: 'obj3', label: 'Opportunity', plural_label: 'Opportunities', api_name: 'Opportunity', is_custom: false },
      { id: 'obj4', label: 'Lead', plural_label: 'Leads', api_name: 'Lead', is_custom: false }
    ];
  } catch (err: any) {
    console.warn('Exception fetching objects:', err.message || err);
    return [];
  }
}

export async function getObjectByApiName(apiName: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_objects')
      .select('*')
      .eq('api_name', apiName)
      .single();
      
    if (error) {
      console.warn('AO_DIAGNOSTIC (getObjectByApiName):', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        apiName
      });
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Exception fetching object by api name:', err.message || err);
    return null;
  }
}

export async function getFieldsForObject(objectId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_fields')
      .select('*')
      .eq('object_id', objectId)
      .order('field_label', { ascending: true });
      
    if (error) {
      console.warn('AO_DIAGNOSTIC (getFieldsForObject):', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        objectId
      });
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.warn('Exception fetching fields:', err.message || err);
    return [];
  }
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
