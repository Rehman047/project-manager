import { useState } from 'react';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function SprintCard({ sprint, projectId, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const changeStatus = async (action) => {
    setLoading(true);
    try {
      const { data } = await client.post(`/api/projects/${projectId}/sprints/${sprint.id}/${action}`);
      onUpdated(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || `Unable to ${action} sprint`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div><h2 className="text-xl font-semibold">{sprint.name}</h2><p className="mt-1 text-gray-500">{sprint.goal || 'No sprint goal.'}</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">{sprint.status}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4 text-sm"><div><p className="text-gray-500">Committed</p><p className="font-semibold">{sprint.committed_points}</p></div><div><p className="text-gray-500">Completed</p><p className="font-semibold">{sprint.completed_points}</p></div><div><p className="text-gray-500">Velocity</p><p className="font-semibold">{sprint.velocity ?? 0}</p></div></div>
      <div className="mt-5">{sprint.status === 'planned' && <button className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50" disabled={loading} onClick={() => changeStatus('start')}>Start sprint</button>}{sprint.status === 'active' && <button className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading} onClick={() => changeStatus('close')}>Close sprint</button>}</div>
    </div>
  );
}
