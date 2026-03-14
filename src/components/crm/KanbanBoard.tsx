'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateRecordField } from '@/actions/kanban';

type KanbanCard = {
  id: string;
  name: string;
  status: string; // the grouping field
  raw_data: Record<string, any>;
};

export default function KanbanBoard({ 
  initialData, 
  columns,
  resourceName,
  groupByField
}: { 
  initialData: KanbanCard[],
  columns: string[],
  resourceName: string,
  groupByField: string
}) {
  const [cards, setCards] = useState<KanbanCard[]>(initialData);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Group cards into columns dynamically based on state
  const groupedCards = columns.reduce((acc, col) => {
    acc[col] = cards.filter(c => c.status === col);
    return acc;
  }, {} as Record<string, KanbanCard[]>);

  // -- Native HTML5 Drag Events --

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move'; // visually indicate a move
    // Firefox requires setting empty data
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!draggedCardId) return;

    const cardToMove = cards.find(c => c.id === draggedCardId);
    if (!cardToMove || cardToMove.status === targetColumn) {
      setDraggedCardId(null);
      return; 
    }

    // 1. Optimistic UI Update (Instant feedback)
    const updatedCards = cards.map(c => 
      c.id === draggedCardId ? { ...c, status: targetColumn } : c
    );
    setCards(updatedCards);
    setDraggedCardId(null);

    // 2. Background Database Commit via Server Action
    const result = await updateRecordField(draggedCardId, resourceName, groupByField, targetColumn);
    
    // 3. Rollback if failed
    if (!result.success) {
      console.error('Failed to update kanban state:', result.error);
      setCards(cards); // revert to original state snapshot before the move
      // Ideally, show a toast notification here
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-140px)] select-none">
      {columns.map(column => (
        <div 
          key={column} 
          className="bg-gray-50 rounded-md border border-gray-200 min-w-[280px] w-[280px] flex flex-col flex-shrink-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column)}
        >
          {/* Column Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-100 rounded-t-md flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 tracking-tight">{column}</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {groupedCards[column]?.length || 0}
            </span>
          </div>
          
          {/* Card Engine Canvas */}
          <div className="p-2 flex-1 overflow-y-auto space-y-2">
            {groupedCards[column]?.map(card => (
              <div 
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                className={`bg-white border border-gray-200 rounded p-3 shadow-sm cursor-grab hover:border-gray-300 transition-colors 
                  ${draggedCardId === card.id ? 'opacity-50 border-dashed border-[#0176D3]' : ''}
                `}
              >
                <div className="text-xs text-gray-500 mb-1 font-medium">{resourceName.slice(0, -1).toUpperCase()}</div>
                <Link 
                  href={`/${resourceName}/${card.id}`} 
                  className="text-sm font-semibold text-[#0176D3] hover:underline"
                >
                  {card.name}
                </Link>
                {card.raw_data.Company && (
                   <div className="text-xs text-gray-600 mt-1">{card.raw_data.Company}</div>
                )}
              </div>
            ))}
            
            {/* Visual Drop Target Ghost (Empty State) */}
            {(!groupedCards[column] || groupedCards[column].length === 0) && (
              <div className="h-20 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                 Drop items here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
