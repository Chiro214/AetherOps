import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import { getObjects } from './metadata';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function saveRecord(objectId: string, recordData: Record<string, any>, resourceName: string) {
  try {
    // In a fully authenticated app, we would derive the owner_id from the session. 
    // Here we'll leave it null or map to a system user if needed.
    
    const { error } = await (supabaseAdmin.from('sf_records') as any).insert({
      object_id: objectId,
      record_data: recordData,
      // owner_id: currentUserId,
    });

    if (error) {
      console.error('Error inserting sf_record:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/${resourceName}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception inside saveRecord:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}

export async function getRecordsForObject(apiName: string): Promise<any[]> {
  try {
    const { getObjectByApiName } = await import('@/actions/metadata');
    const obj = await getObjectByApiName(apiName);
    
    if (!obj) {
      return [];
    }
    
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('object_id', obj.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }
    
    
    return data || [];
  } catch (err) {
    console.error('Exception fetching records for object:', err);
    return [];
  }
}

export async function getRecordById(recordId: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      console.error('Error fetching record by id:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching record by id:', err);
    return null;
  }
}

export async function updateRecord(recordId: string, recordData: Record<string, any>, resourceName: string) {
  try {
    const { error } = await (supabaseAdmin.from('sf_records') as any)
      .update({
        record_data: recordData,
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error updating sf_record:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/${resourceName}`);
    revalidatePath(`/${resourceName}/${recordId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception inside updateRecord:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}

export async function searchRecords(objectId: string, searchTerm: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('id, record_data')
      .eq('object_id', objectId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error in searchRecords:', error);
      return [];
    }

    if (!data) return [];

    const term = searchTerm.toLowerCase();
    const matches = data.filter((record: any) => {
      const values = Object.values(record.record_data || {});
      return values.some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(term)
      );
    });

    return matches.slice(0, 5);
  } catch (err) {
    console.error('Exception in searchRecords:', err);
    return [];
  }
}

export async function getRelatedRecords(parentObjectId: string, parentRecordId: string): Promise<any[]> {
  try {
    const { data: fields, error: fieldsErr } = await (supabaseAdmin.from('sf_fields') as any)
      .select('*')
      .eq('target_object_id', parentObjectId)
      .eq('data_type', 'Lookup');

    if (fieldsErr || !fields || fields.length === 0) return [];

    const allObjects = await getObjects();
    const groupedResults = [];

    for (const field of fields) {
      const childObj = allObjects.find((o) => o.id === field.object_id);
      if (!childObj) continue;

      const { data: records, error: recErr } = await (supabaseAdmin.from('sf_records') as any)
        .select('id, record_data')
        .eq('object_id', field.object_id)
        .contains('record_data', { [field.field_api_name]: parentRecordId });

      if (records && records.length > 0) {
        groupedResults.push({
          objectLabel: childObj.plural_label,
          objectApiName: childObj.api_name,
          fieldApiName: field.field_api_name,
          records: records
        });
      }
    }
    return groupedResults;
  } catch (err) {
    console.error('Exception fetching related records:', err);
    return [];
  }
}
