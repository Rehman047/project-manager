import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import KanbanCard from './KanbanCard';

export default function KanbanColumn({ id, title, items, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section ref={setNodeRef} className={`min-h-[28rem] rounded-xl bg-gray-100 p-4 ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">{items.length}</span>
      </div>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item) => <KanbanCard key={item.id} item={item} onClick={() => onCardClick(item)} />)}
        </div>
      </SortableContext>
    </section>
  );
}
