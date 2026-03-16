'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function createUser(formData: FormData) {
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const alias = formData.get('alias') as string;
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const nickname = formData.get('nickname') as string;
  const title = formData.get('title') as string;
  const company = formData.get('company') as string;
  const department = formData.get('department') as string;
  const roleId = formData.get('role_id') as string;
  const profileId = formData.get('profile_id') as string;
  const isActive = formData.get('is_active') === 'on';

  // Basic Server-Side Validation
  if (!lastName || !alias || !email || !username) {
    return { error: 'Missing required fields: Last Name, Alias, Email, or Username' };
  }

  // @ts-expect-error: Supabase client fails to infer generic tables without CLI regenerator
  const { error } = await supabaseAdmin.from('sf_users').insert({
    first_name: firstName,
    last_name: lastName,
    alias,
    email,
    username,
    nickname: nickname || null,
    title: title || null,
    company: company || null,
    department: department || null,
    role_id: roleId || null,
    profile_id: profileId || null,
    is_active: isActive
  });

  if (error) {
    console.warn('AO_DIAGNOSTIC (createUser):', {
      code: error.code,
      message: error.message,
      hint: error.hint
    });
    return { error: error.message };
  }

  // Revalidate the users list so the new user appears immediately
  revalidatePath('/setup/users');
  return { success: true };
}
