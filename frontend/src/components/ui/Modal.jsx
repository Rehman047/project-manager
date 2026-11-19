// Shared modal component.
export default function Modal({ open, title, children, onClose }) { if (!open) return null; return <div className="fixed inset-0 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-lg rounded bg-white p-6"><div className="flex justify-between"><h2 className="font-semibold">{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>; }
