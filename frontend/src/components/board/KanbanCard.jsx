import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityIcons = { low: '↓', medium: '→', high: '↑', urgent: '!' };

export default function KanbanCard({ item, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-full rounded-lg border bg-white p-4 text-left shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium text-gray-900">{item.title}</span>
        <span className="font-bold text-gray-500">{priorityIcons[item.priority] || '•'}</span>
      </div>
      <div className="mt-3 text-xs text-gray-500">{item.story_points ?? 0} story points</div>
    </button>
  );
}
