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
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', start_date: '', end_date: '' });
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!activeProject) return;
    client.get(`/api/projects/${activeProject.id}/sprints`)
      .then(({ data }) => setSprints(data))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load sprints'));
  }, [activeProject]);
  if (!activeProject) return <Navigate replace to="/" />;
  const activeSprint = sprints.find((sprint) => sprint.status === 'active') || sprints[0];
  const updateSprint = (updated) => setSprints((current) => current.map((sprint) => sprint.id === updated.id ? updated : sprint));
  const createSprint = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: form.name,
        goal: form.goal || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const { data } = await client.post(`/api/projects/${activeProject.id}/sprints`, payload);
      setSprints((current) => [data, ...current]);
      setForm({ name: '', goal: '', start_date: '', end_date: '' });
      setShowCreate(false);
      toast.success('Sprint created');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to create sprint');
    } finally {
      setCreating(false);
    }
  };
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div><p className="mb-1 text-sm font-semibold text-blue-600">Delivery</p><h1 className="text-3xl font-bold text-slate-950">Sprints &amp; Analytics</h1></div>
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white" onClick={() => setShowCreate(true)}>+ Create sprint</button>
      </div>
      {showCreate && (
        <form onSubmit={createSprint} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div><label className="mb-2 block text-sm font-medium">Sprint name</label><input required className="w-full rounded-lg border p-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Sprint 1" /></div>
          <div><label className="mb-2 block text-sm font-medium">Goal</label><input className="w-full rounded-lg border p-3" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} placeholder="What will the team deliver?" /></div>
          <div><label className="mb-2 block text-sm font-medium">Start date</label><input type="date" className="w-full rounded-lg border p-3" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></div>
          <div><label className="mb-2 block text-sm font-medium">End date</label><input type="date" className="w-full rounded-lg border p-3" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} /></div>
          <div className="flex gap-3 md:col-span-2"><button disabled={creating} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white" type="submit">{creating ? 'Creating…' : 'Create sprint'}</button><button type="button" className="rounded-lg border px-4 py-2" onClick={() => setShowCreate(false)}>Cancel</button></div>
        </form>
      )}
      {activeSprint ? <><SprintCard sprint={activeSprint} projectId={activeProject.id} onUpdated={updateSprint} /><div className="grid gap-6 lg:grid-cols-2"><BurndownChart projectId={activeProject.id} sprintId={activeSprint.id} /><VelocityChart projectId={activeProject.id} /></div></> : <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No sprints yet. Create one to begin planning.</div>}
    </section>
  );
}
