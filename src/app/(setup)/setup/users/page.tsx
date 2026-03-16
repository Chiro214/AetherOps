import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { UserPlus, Search } from 'lucide-react';

export const revalidate = 0; // Disable static rendering for realtime data

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function UsersListPage() {
  const { data: users, error } = await supabaseAdmin
    .from('sf_users')
    .select(`
      id,
      first_name,
      last_name,
      alias,
      username,
      profile_id,
      sf_profiles ( name ),
      role_id,
      sf_roles ( name ),
      is_active
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('AO_DIAGNOSTIC (UsersListPage):', {
      code: error.code,
      message: error.message,
      hint: error.hint
    });
  }

  // Resilient fallback for dev/setup
  const userList = (users && users.length > 0) ? users : (error ? [
    { 
      id: 'system-admin', 
      first_name: 'System', 
      last_name: 'Administrator', 
      alias: 'admin', 
      username: 'admin@aetherops.local', 
      sf_roles: { name: 'CEO' }, 
      sf_profiles: { name: 'System Administrator' }, 
      is_active: true 
    }
  ] : []);

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Setup &gt; Administration &gt; Users</div>
          <h1 className="text-xl font-bold flex items-center gap-2 mt-1">
            All Users
          </h1>
        </div>
        <div className="flex gap-2">
           <Link 
             href="/setup/users/new"
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors"
           >
             <UserPlus size={16} /> New User
           </Link>
        </div>
      </div>

      {/* List Toolbar */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-4 bg-white">
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search Users..." className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] w-64" />
         </div>
         <div className="text-sm text-[#0176D3] hover:underline cursor-pointer">Create New View</div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
               <tr>
                  <th className="p-2 pl-4 text-xs font-bold text-gray-700 uppercase tracking-wide">Action</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Full Name</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Alias</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Username</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Role</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Profile</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide">Active</th>
               </tr>
            </thead>
            <tbody>
               {(!userList || userList.length === 0) ? (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 text-sm">
                       No users found. Click &quot;New User&quot; to create one.
                    </td>
                 </tr>
               ) : (
                 userList.map((user: { id: string, first_name: string, last_name: string, alias: string, username: string, sf_roles: { name: string } | null, sf_profiles: { name: string } | null, is_active: boolean | null }) => (
                   <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="p-2 pl-4 text-sm text-[#0176D3]">
                         <span className="hover:underline cursor-pointer">Edit</span> | <span className="hover:underline cursor-pointer">Login</span>
                      </td>
                      <td className="p-2 text-sm text-[#0176D3] font-medium hover:underline cursor-pointer">
                         {user.last_name}, {user.first_name}
                      </td>
                      <td className="p-2 text-sm text-gray-900">{user.alias}</td>
                      <td className="p-2 text-sm text-gray-900">{user.username}</td>
                      <td className="p-2 text-sm text-gray-900">{user.sf_roles?.name || ''}</td>
                      <td className="p-2 text-sm text-gray-900">{user.sf_profiles?.name || ''}</td>
                      <td className="p-2 text-sm text-gray-900">
                         {user.is_active ? (
                            <div className="w-4 h-4 bg-green-500 rounded-sm inline-block"></div>
                         ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-sm inline-block"></div>
                         )}
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      
      {/* Footer */}
      <div className="p-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between bg-gray-50">
         <span>{userList?.length || 0} items</span>
         <span>Sorted by Updated At</span>
      </div>
    </div>
  );
}
