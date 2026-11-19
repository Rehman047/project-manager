// Shared drawer component.
export default function Drawer({ open, children, onClose }) { if (!open) return null; return <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white p-6 shadow-xl"><button onClick={onClose}>×</button>{children}</aside>; }
