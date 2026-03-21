import React from 'react';
import NewObjectClient from '@/components/setup/NewObjectClient';
import Link from 'next/link';

export default function NewObjectPage() {
  return (
    <div className="h-full bg-gray-50 flex flex-col pt-8">
      <div className="max-w-3xl mx-auto w-full px-4 mb-4">
        <Link href="/setup/object-manager" className="text-[#0176D3] hover:underline text-sm font-medium">
          &lt; Back to Object Manager
        </Link>
      </div>
      <NewObjectClient />
    </div>
  );
}
