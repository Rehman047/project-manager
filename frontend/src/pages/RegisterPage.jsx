import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await client.post('/api/auth/register', form);
      toast.success('Account created. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to register');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow">
        <div><h1 className="text-2xl font-bold text-gray-900">Create account</h1><p className="text-gray-500">Start managing your projects</p></div>
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="name" placeholder="Name" value={form.name} onChange={updateField} required />
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="email" type="email" placeholder="Email" value={form.email} onChange={updateField} required />
        <input className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500" name="password" type="password" minLength="8" placeholder="Password (8+ characters)" value={form.password} onChange={updateField} required />
        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700" type="submit">Register</button>
        <p className="text-center text-sm text-gray-600">Already registered? <Link className="text-blue-600 hover:underline" to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
