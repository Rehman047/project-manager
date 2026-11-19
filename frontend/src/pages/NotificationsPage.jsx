// Notifications page.
import { useEffect, useState } from "react";
import NotificationItem from "../components/notifications/NotificationItem";
import api from "../api/client";
export default function NotificationsPage() { const [items, setItems] = useState([]); useEffect(() => { api.get("/notifications").then((r) => setItems(r.data)); }, []); return <main className="space-y-3 p-6"><h1 className="text-2xl font-semibold">Notifications</h1>{items.map((item) => <NotificationItem key={item.id} notification={item} />)}</main>; }
