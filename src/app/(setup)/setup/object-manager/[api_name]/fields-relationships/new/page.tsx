import React from 'react';
import { getObjectByApiName, getObjects } from '@/actions/metadata';
import { notFound } from 'next/navigation';
import NewFieldClient from '@/components/setup/NewFieldClient';

export default async function NewFieldPage({ params }: { params: Promise<{ api_name: string }> }) {
  const resolvedParams = await params;
  
  const obj = await getObjectByApiName(resolvedParams.api_name);
  if (!obj) notFound();

  // Fetch all objects for the Lookup Relationship selector dependency
  const allObjects = await getObjects();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#f3f3f3] h-full">
      <NewFieldClient objectId={obj.id} apiName={resolvedParams.api_name} allObjects={allObjects} />
    </div>
  );
}
