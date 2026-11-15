import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';
import CreateWorkItemModal from '../components/workitem/CreateWorkItemModal';
import WorkItemRow from '../components/workitem/WorkItemRow';
import { useProjectStore } from '../store/projectStore';

export default function BacklogPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
  }, [activeProject]);

  if (!activeProject) return <Navigate replace to="/" />;
  const backlogItems = items.filter((item) => item.sprint_id === null);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Backlog</h1><p className="text-gray-500">{backlogItems.length} unscheduled work items</p></div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700" onClick={() => setShowModal(true)}>Create Task</button>
      </div>
      <div className="space-y-3">{backlogItems.length === 0 ? <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No backlog items yet.</div> : backlogItems.map((item) => <WorkItemRow key={item.id} item={item} />)}</div>
      {showModal && <CreateWorkItemModal projectId={activeProject.id} onClose={() => setShowModal(false)} onCreated={(item) => setItems((current) => [...current, item])} />}
    </section>
  );
}
