// Shared badge component.
export default function Badge({ children, className = "" }) { return <span className={`rounded-full px-2 py-1 text-xs ${className}`}>{children}</span>; }
