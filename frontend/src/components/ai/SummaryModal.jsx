// AI summary modal.
export default function SummaryModal({ summary, onClose }) {
  if (!summary) return null;
  return <div className="fixed inset-0 grid place-items-center bg-black/40 p-4"><div className="max-w-lg rounded bg-white p-6"><h2 className="text-xl font-semibold">{summary.headline}</h2><pre className="mt-4 whitespace-pre-wrap">{summary.standup_markdown}</pre><button className="mt-4 rounded border px-3 py-1" onClick={onClose}>Close</button></div></div>;
}
