import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function WorkItemDetailDrawer({ item, onClose, projectId, onUpdated }) {
  if (!item) return null;
  const [storyPoints, setStoryPoints] = useState(item.story_points ?? 1);
  const [assigneeId, setAssigneeId] = useState(item.assignee_id || '');
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStoryPoints(item.story_points ?? 1);
    setAssigneeId(item.assignee_id || '');
    if (projectId) {
      client.get(`/api/projects/${projectId}/members`)
        .then(({ data }) => setMembers(data))
        .catch(() => setMembers([]));
    }
  }, [item]);

  const saveStoryPoints = async () => {
    setSaving(true);
    try {
      const { data } = await client.put(`/api/projects/${projectId}/items/${item.id}`, {
        story_points: Number(storyPoints) || 1,
        assignee_id: assigneeId || null,
      });
      onUpdated?.(data);
      toast.success('Story points updated');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to update story points');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-md bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button className="text-2xl text-gray-400" onClick={onClose} aria-label="Close">×</button>
        </div>
        <dl className="space-y-4 text-sm">
          <div><dt className="text-gray-500">Type</dt><dd className="capitalize">{item.type}</dd></div>
          <div><dt className="text-gray-500">Priority</dt><dd className="capitalize">{item.priority}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd className="capitalize">{item.status.replace('_', ' ')}</dd></div>
          <div>
            <dt className="mb-2 text-gray-500">Assignee</dt>
            <dd>
              <select className="w-full rounded-lg border p-2" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
                <option value="">Unassigned</option>
                {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.user_name} · {member.role}</option>)}
              </select>
            </dd>
          </div>
          <div>
            <dt className="mb-2 text-gray-500">Story points</dt>
            <dd className="flex gap-2">
              <input className="w-24 rounded-lg border p-2" type="number" min="1" max="100" value={storyPoints} onChange={(event) => setStoryPoints(event.target.value)} />
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={saveStoryPoints}>{saving ? 'Saving…' : 'Save'}</button>
            </dd>
          </div>
          {item.description && <div><dt className="text-gray-500">Description</dt><dd>{item.description}</dd></div>}
        </dl>
      </aside>
    </div>
  );
}
