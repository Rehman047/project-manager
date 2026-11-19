import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';
import CreateProjectModal from '../components/project/CreateProjectModal';
import ProjectCard from '../components/project/ProjectCard';
import { useProjectStore } from '../store/projectStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const setActiveProject = useProjectStore((state) => state.setActiveProject);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await client.get('/api/projects');
        setProjects(data);
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Unable to load projects');
      }
    };
    fetchProjects();
  }, []);

  const handleProjectCreated = (project) => setProjects((current) => [project, ...current]);

  return (
    <section>
      <div className="mb-7 flex items-end justify-between">
        <div><p className="mb-1 text-sm font-semibold text-blue-600">Overview</p><h1 className="text-3xl font-bold text-slate-950">Your projects</h1><p className="mt-2 text-slate-500">Plan work, track delivery, and use AI to unblock teams.</p></div>
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={() => setShowModal(true)}>+ New project</button>
      </div>
      {projects.length === 0 ? <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No projects yet.</div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} onClick={() => { setActiveProject(project); navigate('/backlog'); }} />)}</div>}
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />}
    </section>
  );
}
