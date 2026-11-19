import { useState } from 'react';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function InviteMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await client.post(`/api/projects/${projectId}/members`, { email, role });
      onAdded(data);
      onClose();
      toast.success('Member added');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to add member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Add project member</h2>
        <input type="email" required className="w-full rounded-lg border p-3" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@example.com" />
        <select className="w-full rounded-lg border p-3" value={role} onChange={(event) => setRole(event.target.value)}><option value="viewer">Viewer</option><option value="member">Member</option><option value="pm">Project manager</option><option value="admin">Admin</option></select>
        <div className="flex justify-end gap-3"><button type="button" className="rounded-lg border px-4 py-2" onClick={onClose}>Cancel</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">{saving ? 'Adding…' : 'Add member'}</button></div>
      </form>
    </div>
  );
}
