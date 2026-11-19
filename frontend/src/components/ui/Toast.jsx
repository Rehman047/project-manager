// Shared toast component.
export default function Toast({ message, onClose }) { if (!message) return null; return <div className="fixed bottom-4 right-4 rounded bg-slate-900 px-4 py-3 text-white">{message}<button className="ml-3" onClick={onClose}>×</button></div>; }
