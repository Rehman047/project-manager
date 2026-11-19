import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client';
import { useProjectStore } from '../store/projectStore';

const tools = [
  { id: 'create-task', title: 'Create with AI', description: 'Turn a plain-English idea into a structured work item.', icon: '✦' },
  { id: 'breakdown-epic', title: 'Break down work', description: 'Split an epic into actionable implementation tasks.', icon: '▦' },
  { id: 'plan-sprint', title: 'Plan sprint', description: 'Recommend the highest-value work within capacity.', icon: '◫' },
  { id: 'detect-risks', title: 'Detect risks', description: 'Find blockers, overload, and delivery risks.', icon: '△' },
  { id: 'summary', title: 'Stand-up summary', description: 'Generate a concise progress and blocker report.', icon: '≡' },
];

function AIResult({ tool, result }) {
  if (!result) {
    return (
      <div className="grid min-h-72 place-items-center text-center text-slate-500">
        <div><div className="mx-auto mb-3 text-3xl text-slate-700">✦</div><p className="text-sm">Choose a tool and run an analysis.</p></div>
      </div>
    );
  }

  if (tool === 'create-task') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-lg font-semibold text-white">{result.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{result.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300 capitalize">{result.type}</span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 capitalize">{result.priority} priority</span>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">{result.story_points} points</span>
          </div>
        </div>
        {result.labels?.length > 0 && <p className="text-sm text-slate-400">Labels: {result.labels.join(', ')}</p>}
      </div>
    );
  }

  if (tool === 'breakdown-epic') {
    return (
      <div className="space-y-3">
        {result.items?.map((item, index) => (
          <article key={`${item.title}-${index}`} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3"><p className="font-semibold text-white">{item.title}</p><span className="shrink-0 rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">{item.story_points} pts</span></div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
          </article>
        ))}
      </div>
    );
  }

  if (tool === 'plan-sprint') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-900 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Recommended</p><p className="mt-1 text-2xl font-bold">{result.recommended_items?.length || 0}</p></div>
          <div className="rounded-xl bg-slate-900 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Total points</p><p className="mt-1 text-2xl font-bold">{result.total_points}</p></div>
        </div>
        <p className="text-sm text-slate-300">{result.rationale}</p>
        <div className="space-y-2">{result.recommended_items?.map((item) => <div key={item.work_item_id} className="rounded-lg border border-slate-700 p-3"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.story_points} points · {item.priority}</p></div>)}</div>
      </div>
    );
  }

  if (tool === 'detect-risks') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-900 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Health score</p><p className="mt-1 text-3xl font-bold text-emerald-300">{result.health_score}%</p></div>
        {result.risks?.length ? result.risks.map((risk, index) => <article key={`${risk.title}-${index}`} className="rounded-xl border border-slate-700 p-4"><p className="text-xs font-semibold uppercase text-amber-300">{risk.severity} · {risk.category}</p><p className="mt-2 font-semibold">{risk.title}</p><p className="mt-1 text-sm leading-6 text-slate-300">{risk.description}</p><p className="mt-3 text-xs text-slate-400">Mitigation: {risk.mitigation}</p></article>) : <p className="text-sm text-emerald-300">No significant risks detected.</p>}
      </div>
    );
  }

  if (tool === 'summary') {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-lg font-semibold">{result.headline}</p>
        {result.completed_highlights?.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">Completed</p><ul className="list-disc space-y-1 pl-5 text-slate-300">{result.completed_highlights.map((value, index) => <li key={index}>{value}</li>)}</ul></div>}
        {result.in_progress_highlights?.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">In progress</p><ul className="list-disc space-y-1 pl-5 text-slate-300">{result.in_progress_highlights.map((value, index) => <li key={index}>{value}</li>)}</ul></div>}
        {result.blockers?.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300">Blockers</p><ul className="list-disc space-y-1 pl-5 text-slate-300">{result.blockers.map((value, index) => <li key={index}>{value}</li>)}</ul></div>}
      </div>
    );
  }

  return null;
}

export default function AIPage() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const [activeTool, setActiveTool] = useState('create-task');
  const [prompt, setPrompt] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [itemId, setItemId] = useState('');
  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    client.get(`/api/projects/${activeProject.id}/items`)
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('Unable to load project work items'));
  }, [activeProject]);

  if (!activeProject) return <Navigate replace to="/" />;

  const runAI = async () => {
    setLoading(true);
    setResult(null);
    try {
      let payload = {};
      let endpoint = activeTool;
      if (activeTool === 'create-task') payload = { prompt };
      if (activeTool === 'breakdown-epic') payload = { work_item_id: itemId };
      if (activeTool === 'plan-sprint') payload = { capacity_points: Number(capacity) };
      if (activeTool === 'detect-risks') payload = {};
      if (activeTool === 'summary') payload = { days: 7 };
      if (activeTool === 'breakdown-epic' && !itemId) {
        toast.error('Select a work item to break down');
        setLoading(false);
        return;
      }
      const { data } = await client.post(`/api/projects/${activeProject.id}/ai/${endpoint}`, payload);
      setResult(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-7">
        <p className="mb-1 text-sm font-semibold text-blue-600">AI workspace</p>
        <h1 className="text-3xl font-bold text-slate-950">Turn project data into action</h1>
        <p className="mt-2 text-slate-500">Generate work, plan capacity, identify risks, and prepare stand-ups.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)_minmax(320px,0.75fr)]">
        <aside className="space-y-2">
          {tools.map((tool) => (
            <button key={tool.id} onClick={() => { setActiveTool(tool.id); setResult(null); }}
              className={`w-full rounded-xl border p-4 text-left transition ${activeTool === tool.id ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <span className="text-lg text-blue-600">{tool.icon}</span>
              <span className="mt-2 block text-sm font-semibold text-slate-900">{tool.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{tool.description}</span>
            </button>
          ))}
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">{tools.find((tool) => tool.id === activeTool)?.title}</h2>
          <div className="mt-5 space-y-4">
            {activeTool === 'create-task' && <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">What needs to be done?</label>
              <textarea className="min-h-36 w-full resize-none rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: Users should be able to reset their password by email..." />
            </div>}
            {activeTool === 'breakdown-epic' && <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Choose an epic or story</label>
              <select className="w-full rounded-xl border border-slate-200 p-3" value={itemId} onChange={(event) => setItemId(event.target.value)}>
                <option value="">Select work item</option>
                {items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>}
            {activeTool === 'plan-sprint' && <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Available capacity (story points)</label>
              <input type="number" min="1" className="w-full rounded-xl border border-slate-200 p-3" value={capacity} onChange={(event) => setCapacity(event.target.value)} />
            </div>}
            {['detect-risks', 'summary'].includes(activeTool) && <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              This analysis uses the current project and sprint data.
            </div>}
            <button disabled={loading || (activeTool === 'create-task' && !prompt.trim())}
              onClick={runAI} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Analyzing…' : 'Generate with AI'}
            </button>
          </div>
        </div>

        <div className="min-h-96 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">AI result</h2>
            {result?.source && <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">{result.source}</span>}
          </div>
          <AIResult tool={activeTool} result={result} />
        </div>
      </div>
    </section>
  );
}
