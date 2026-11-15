import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';
import BurndownChart from '../components/sprint/BurndownChart';
import SprintCard from '../components/sprint/SprintCard';
import VelocityChart from '../components/sprint/VelocityChart';
import { useProjectStore } from '../store/projectStore';

export default function SprintPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [sprints, setSprints] = useState([]);
  useEffect(() => {
    if (!activeProject) return;
    client.get(`/api/projects/${activeProject.id}/sprints`)
      .then(({ data }) => setSprints(data))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load sprints'));
  }, [activeProject]);
  if (!activeProject) return <Navigate replace to="/" />;
  const activeSprint = sprints.find((sprint) => sprint.status === 'active') || sprints[0];
  const updateSprint = (updated) => setSprints((current) => current.map((sprint) => sprint.id === updated.id ? updated : sprint));
  return <section className="space-y-6"><h1 className="text-2xl font-bold text-gray-900">Sprints</h1>{activeSprint ? <><SprintCard sprint={activeSprint} projectId={activeProject.id} onUpdated={updateSprint} /><div className="grid gap-6 lg:grid-cols-2"><BurndownChart projectId={activeProject.id} sprintId={activeSprint.id} /><VelocityChart projectId={activeProject.id} /></div></> : <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No sprints yet.</div>}<div /><div /><div /></section>;
}
