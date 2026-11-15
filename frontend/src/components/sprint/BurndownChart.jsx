import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function BurndownChart({ projectId, sprintId }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    client.get(`/api/projects/${projectId}/sprints/${sprintId}/burndown`)
      .then(({ data: result }) => setData(result))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load burndown'));
  }, [projectId, sprintId]);
  return <div className="rounded-xl border bg-white p-4"><h2 className="mb-4 font-semibold">Burndown</h2><ResponsiveContainer width="100%" height={260}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="remaining_points" stroke="#2563eb" /></LineChart></ResponsiveContainer></div>;
}
