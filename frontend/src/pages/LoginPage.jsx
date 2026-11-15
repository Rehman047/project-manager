import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await client.post('/api/auth/login', form);
      login(data.user, data.access_token);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to log in');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow">
        <div><h1 className="text-2xl font-bold text-gray-900">Welcome back</h1><p className="text-gray-500">Sign in to your account</p></div>
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="email" type="email" placeholder="Email" value={form.email} onChange={updateField} required />
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="password" type="password" placeholder="Password" value={form.password} onChange={updateField} required />
        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700" type="submit">Log in</button>
        <p className="text-center text-sm text-gray-600">No account? <Link className="text-blue-600 hover:underline" to="/register">Register</Link></p>
      </form>
    </main>
  );
}
