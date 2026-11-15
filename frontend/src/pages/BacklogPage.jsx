import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import toast from 'react-hot-toast';

import client from '../api/client';
import CreateWorkItemModal from '../components/workitem/CreateWorkItemModal';
import WorkItemRow from '../components/workitem/WorkItemRow';
import SprintPanel from '../components/sprint/SprintPanel';
import { useProjectStore } from '../store/projectStore';

export default function BacklogPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [items, setItems] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!activeProject) return;
    const fetchItems = async () => {
      try {
        const { data } = await client.get(`/api/projects/${activeProject.id}/items`);
        setItems(data);
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Unable to load backlog');
      }
    };
    fetchItems();
    client.get(`/api/projects/${activeProject.id}/sprints`)
      .then(({ data }) => setSprints(data.filter((sprint) => ['planned', 'active'].includes(sprint.status))))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load sprints'));
  }, [activeProject]);

  if (!activeProject) return <Navigate replace to="/" />;
  const backlogItems = items.filter((item) => item.sprint_id === null);

  const handleDrop = async ({ active, over }) => {
    if (!over || !sprints.some((sprint) => sprint.id === over.id)) return;
    const item = items.find((workItem) => workItem.id === active.id);
    if (!item) return;
    const previousItems = items;
    setItems((current) => current.map((workItem) => workItem.id === item.id ? { ...workItem, sprint_id: over.id } : workItem));
    try {
      await client.put(`/api/projects/${activeProject.id}/items/${item.id}`, { sprint_id: over.id });
    } catch (error) {
      setItems(previousItems);
      toast.error(error.response?.data?.detail || 'Unable to assign work item');
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Backlog</h1><p className="text-gray-500">{backlogItems.length} unscheduled work items</p></div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700" onClick={() => setShowModal(true)}>Create Task</button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDrop}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
          <div className="space-y-3">{backlogItems.length === 0 ? <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No backlog items yet.</div> : backlogItems.map((item) => <WorkItemRow key={item.id} item={item} draggable />)}</div>
          <div className="space-y-3">{sprints.map((sprint) => <SprintPanel key={sprint.id} sprint={sprint} />)}</div>
        </div>
      </DndContext>
      {showModal && <CreateWorkItemModal projectId={activeProject.id} onClose={() => setShowModal(false)} onCreated={(item) => setItems((current) => [...current, item])} />}
    </section>
  );
}
