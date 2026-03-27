'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Columns, GripVertical, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface ColumnManagerProps {
  allColumns: { id: string; label: string }[];
  visibleColumns: string[];
  columnOrder: string[];
  onToggle: (colId: string) => void;
  onOrderChange: (newOrder: string[]) => void;
  onReset: () => void;
}

export function ColumnManager({
  allColumns,
  visibleColumns,
  columnOrder,
  onToggle,
  onOrderChange,
  onReset,
}: ColumnManagerProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Build ordered list: columns in columnOrder first, then any remaining
  const orderedList = [
    ...columnOrder.filter((id) => allColumns.some((c) => c.id === id)),
    ...allColumns.map((c) => c.id).filter((id) => !columnOrder.includes(id)),
  ];

  const getLabel = (id: string) => allColumns.find((c) => c.id === id)?.label || id;

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== draggedIdx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      const newOrder = [...orderedList];
      const [moved] = newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, moved);
      onOrderChange(newOrder);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const showAll = () => {
    allColumns.forEach((c) => {
      if (!visibleColumns.includes(c.id)) onToggle(c.id);
    });
  };

  const hideAll = () => {
    visibleColumns.forEach((id) => {
      // Keep at least domainName visible
      if (id !== 'domainName') onToggle(id);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Columns className="h-4 w-4" />
          Columns
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
            {visibleColumns.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Columns & Order
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={showAll}>
              <Eye className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={hideAll}>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5" onClick={onReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto py-1" style={{ maxHeight: '400px' }}>
          {orderedList.map((colId, idx) => {
            const isVisible = visibleColumns.includes(colId);
            const isDragOver = dragOverIdx === idx;
            const isDragging = draggedIdx === idx;

            return (
              <div
                key={colId}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-2 py-1.5 mx-1 rounded cursor-grab select-none transition-all ${
                  isDragging ? 'opacity-40 bg-muted' : ''
                } ${isDragOver ? 'border-t-2 border-primary' : 'border-t-2 border-transparent'} ${
                  isVisible ? 'hover:bg-muted/60' : 'hover:bg-muted/30 opacity-50'
                }`}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                <Checkbox
                  checked={isVisible}
                  onCheckedChange={() => onToggle(colId)}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span className={`text-xs truncate flex-1 ${isVisible ? 'font-medium' : 'text-muted-foreground'}`}>
                  {getLabel(colId)}
                </span>
                <span className="text-[9px] text-muted-foreground/40 tabular-nums shrink-0">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
