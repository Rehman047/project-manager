export default function WorkItemDetailDrawer({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-md bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button className="text-2xl text-gray-400" onClick={onClose} aria-label="Close">×</button>
        </div>
        <dl className="space-y-4 text-sm">
          <div><dt className="text-gray-500">Type</dt><dd className="capitalize">{item.type}</dd></div>
          <div><dt className="text-gray-500">Priority</dt><dd className="capitalize">{item.priority}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd className="capitalize">{item.status.replace('_', ' ')}</dd></div>
          <div><dt className="text-gray-500">Story points</dt><dd>{item.story_points ?? 0}</dd></div>
          {item.description && <div><dt className="text-gray-500">Description</dt><dd>{item.description}</dd></div>}
        </dl>
      </aside>
    </div>
  );
}
