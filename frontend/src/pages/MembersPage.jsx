import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import client from '../api/client';
import InviteMemberModal from '../components/project/InviteMemberModal';
import MemberList from '../components/project/MemberList';
import { useProjectStore } from '../store/projectStore';

export default function MembersPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    client.get(`/api/projects/${activeProject.id}/members`).then(({ data }) => setMembers(data));
  }, [activeProject]);

  if (!activeProject) return <Navigate replace to="/" />;

  return (
    <section>
      <div className="mb-7 flex items-end justify-between">
        <div><p className="mb-1 text-sm font-semibold text-blue-600">Team</p><h1 className="text-3xl font-bold text-slate-950">Project members</h1><p className="mt-2 text-slate-500">Manage roles and assign ownership across the team.</p></div>
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white" onClick={() => setShowInvite(true)}>+ Add member</button>
      </div>
      <MemberList members={members} />
      {showInvite && <InviteMemberModal projectId={activeProject.id} onClose={() => setShowInvite(false)} onAdded={(member) => setMembers((current) => [...current, member])} />}
    </section>
  );
}
