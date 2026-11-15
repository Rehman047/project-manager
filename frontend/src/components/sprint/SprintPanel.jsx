import { useDroppable } from '@dnd-kit/core';

export default function SprintPanel({ sprint }) {
  const { setNodeRef, isOver } = useDroppable({ id: sprint.id });
  return <div ref={setNodeRef} className={`rounded-xl border bg-white p-4 ${isOver ? 'ring-2 ring-blue-400' : ''}`}><div className="flex items-center justify-between"><h3 className="font-semibold">{sprint.name}</h3><span className="text-xs capitalize text-gray-500">{sprint.status}</span></div><p className="mt-2 text-sm text-gray-500">{sprint.goal || 'Drop backlog items here'}</p></div>;
}
