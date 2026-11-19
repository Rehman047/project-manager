// Notification list item.
export default function NotificationItem({ notification, onRead }) { return <article className={`rounded border p-3 ${notification.read ? "" : "bg-blue-50"}`}><p>{notification.message}</p>{!notification.read && <button className="text-sm text-blue-600" onClick={() => onRead?.(notification.id)}>Mark read</button>}</article>; }
