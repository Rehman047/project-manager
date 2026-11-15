import { useState } from 'react';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', ai_enabled: true });
  const [saving, setSaving] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await client.post('/api/projects', form);
      onCreated(data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <form className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold">Create Project</h2>
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="name" placeholder="Project name" value={form.name} onChange={updateField} required />
        <textarea className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="description" placeholder="Description" value={form.description} onChange={updateField} rows="4" />
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border px-4 py-2" type="button" onClick={onClose}>Cancel</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}
