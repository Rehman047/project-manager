import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import toast from 'react-hot-toast';

import client from '../api/client';
import KanbanColumn from '../components/board/KanbanColumn';
import WorkItemDetailDrawer from '../components/workitem/WorkItemDetailDrawer';
import { useProjectStore } from '../store/projectStore';

const columns = [
  { id: 'todo', title: 'To do' },
  { id: 'in_progress', title: 'In progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export default function BoardPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [board, setBoard] = useState({ todo: [], in_progress: [], review: [], done: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!activeProject) return;
    client.get(`/api/projects/${activeProject.id}/board`)
      .then(({ data }) => setBoard(data))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load board'));
  }, [activeProject]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || !activeProject) return;
    const itemId = active.id;
    const currentStatus = Object.keys(board).find((status) => board[status].some((item) => item.id === itemId));
    const targetStatus = Object.keys(board).includes(over.id)
      ? over.id
      : Object.keys(board).find((status) => board[status].some((item) => item.id === over.id));
    if (!currentStatus || !targetStatus) return;
    const sourceItem = board[currentStatus].find((item) => item.id === itemId);
    const previousBoard = board;
    const targetItems = board[targetStatus].filter((item) => item.id !== itemId);
    const sourceItems = board[currentStatus].filter((item) => item.id !== itemId);
    const targetIndex = Object.keys(board).includes(over.id)
      ? targetItems.length
      : targetItems.findIndex((item) => item.id === over.id);
    const insertAt = targetIndex < 0 ? targetItems.length : targetIndex;
    const movedItem = { ...sourceItem, status: targetStatus, board_order: insertAt };
    const nextTarget = [...targetItems.slice(0, insertAt), movedItem, ...targetItems.slice(insertAt)]
      .map((item, index) => ({ ...item, board_order: index }));
    const nextBoard = { ...board, [currentStatus]: sourceItems.map((item, index) => ({ ...item, board_order: index }),), [targetStatus]: nextTarget };
    setBoard(nextBoard);
    try {
      await client.patch(`/api/projects/${activeProject.id}/items/${itemId}/status`, { status: targetStatus, board_order: insertAt });
    } catch (error) {
      setBoard(previousBoard);
      toast.error(error.response?.data?.detail || 'Unable to move work item');
    }
  };

  if (!activeProject) return null;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Board</h1>
      <DndContext collisionDetection={closestCorners} sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-5 xl:grid-cols-4">
          {columns.map((column) => <KanbanColumn key={column.id} {...column} items={board[column.id]} onCardClick={setSelectedItem} />)}
        </div>
      </DndContext>
      <WorkItemDetailDrawer
        item={selectedItem}
        projectId={activeProject.id}
        onClose={() => setSelectedItem(null)}
        onUpdated={(updated) => {
          setSelectedItem(updated);
          setBoard((current) => {
            const next = {};
            for (const status of Object.keys(current)) {
              next[status] = current[status].map((item) => item.id === updated.id ? updated : item);
            }
            return next;
          });
        }}
      />
    </section>
  );
}
