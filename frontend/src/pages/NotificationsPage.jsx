import { useEffect, useState } from "react";
import NotificationItem from "../components/notifications/NotificationItem";
import api from "../api/client";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/notifications")
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="space-y-3 p-6">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {items.length === 0
        ? <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">No notifications yet.</div>
        : items.map((item) => <NotificationItem key={item.id} notification={item} />)}
    </main>
  );
}
