import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { getRecordsForObject, saveRecord, executeFlows } from '@/actions/records';
import { getObjectByApiName } from '@/actions/metadata';
import { getCurrentUserProfileId, getFLSPermissions, applyFLSReadFilter, validateFLSEditGuard } from '@/utils/fls';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * PHASE 2: Universal REST API Handler
 * Handles GET (Read) and POST (Create) for any AetherOps Object.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 1. Validate API Key
    const { data: apiKey, error: authError } = await supabaseAdmin
      .from('sf_api_keys')
      .select('owner_id, is_active')
      .eq('key_hash', token) // Note: In production we should use cryptographic hashing
      .single();

    if (authError || !apiKey || !(apiKey as any).is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve Metadata
    const obj = await getObjectByApiName(resource);
    if (!obj) {
      return NextResponse.json({ error: `Resource '${resource}' not found` }, { status: 404 });
    }

    // 3. Fetch Records (Enforcing RLS manually since we are using admin client)
    // Directive: "Pass the results through the exact same fls.ts utility from Phase 1"
    const { data: records, error: fetchError } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('object_id', obj.id)
      .eq('owner_id', (apiKey as any).owner_id); // Manual RLS enforcement for API user

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 4. Resolve FLS for the API User
    const { data: userProfile } = await supabaseAdmin
      .from('sf_users')
      .select('profile_id')
      .eq('id', (apiKey as any).owner_id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 });
    }

    const perms = await getFLSPermissions((userProfile as any).profile_id, obj.id);

    // 5. Apply FLS Filter before returning response
    const filteredRecords = (records as any[] || []).map(rec => ({
      id: rec.id,
      record_data: applyFLSReadFilter(rec.record_data, perms),
      created_at: rec.created_at,
      updated_at: rec.updated_at
    }));

    return NextResponse.json({ data: filteredRecords });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 1. Validate API Key
    const { data: apiKey, error: authError } = await supabaseAdmin
      .from('sf_api_keys')
      .select('owner_id, is_active')
      .eq('key_hash', token)
      .single();

    if (authError || !apiKey || !(apiKey as any).is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve Metadata
    const obj = await getObjectByApiName(resource);
    if (!obj) {
      return NextResponse.json({ error: `Resource '${resource}' not found` }, { status: 404 });
    }

    const payload = await request.json();

    // 3. FLS Mutation Guard
    const { data: userProfile } = await supabaseAdmin
      .from('sf_users')
      .select('profile_id')
      .eq('id', (apiKey as any).owner_id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 });
    }

    const perms = await getFLSPermissions((userProfile as any).profile_id, obj.id);
    const guard = validateFLSEditGuard(payload, perms);
    if (!guard.valid) {
      return NextResponse.json({ error: `Unauthorized to edit field: ${guard.field}` }, { status: 403 });
    }

    // 4. Save Record (Injecting API User as owner)
    // Note: saveRecord already assigns owner_id from auth.getUser() in Server Actions,
    // but here in a Route Handler, we pass the context manually.
    // However, saveRecord is implemented to use createSSRClient().auth.getUser().
    // We should probably implement a specific save function or modify it.
    // For now, let's use supabaseAdmin directly to ensure the API owner_id is pinned.
    
    const { data: saveResult, error: saveError } = await (supabaseAdmin.from('sf_records') as any).insert({
      object_id: obj.id,
      record_data: payload,
      owner_id: (apiKey as any).owner_id // Crucial: Pin to API key owner
    }).select('id').single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    // 5. Trigger Flows
    executeFlows(obj.id, (saveResult as any).id, payload, 'onCreate', resource).catch(e => console.error('API Flow trigger failed:', e));
    
    return NextResponse.json({ success: true, id: (saveResult as any).id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
