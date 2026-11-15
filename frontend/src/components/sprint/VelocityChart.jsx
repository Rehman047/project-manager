import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';

import client from '../../api/client';

export default function VelocityChart({ projectId }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    client.get(`/api/projects/${projectId}/velocity`)
      .then(({ data: result }) => setData(result))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load velocity'));
  }, [projectId]);
  return <div className="rounded-xl border bg-white p-4"><h2 className="mb-4 font-semibold">Velocity</h2><ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="velocity" fill="#16a34a" /></BarChart></ResponsiveContainer></div>;
}
