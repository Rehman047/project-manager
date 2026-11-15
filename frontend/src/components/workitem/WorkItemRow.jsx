const typeIcons = { epic: '◆', story: '●', task: '■', bug: '⚠' };

export default function WorkItemRow({ item }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-5 text-center text-gray-500">{typeIcons[item.type] || '•'}</span>
        <span className="truncate font-medium text-gray-900">{item.title}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="capitalize text-gray-500">{item.priority}</span>
        <span className="rounded-full bg-gray-100 px-3 py-1 capitalize text-gray-600">{item.status.replace('_', ' ')}</span>
      </div>
    </div>
  );
}
