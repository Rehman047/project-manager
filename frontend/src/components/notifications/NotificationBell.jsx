// Notification bell control.
import { Link } from "react-router-dom";
export default function NotificationBell({ count = 0 }) { return <Link to="/notifications" className="relative">🔔{count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-xs text-white">{count}</span>}</Link>; }
