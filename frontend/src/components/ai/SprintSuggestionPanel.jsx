// AI sprint suggestion panel.
export default function SprintSuggestionPanel({ items = [] }) {
  return <ul className="space-y-2">{items.map((item, i) => <li key={item.work_item_id || i} className="rounded border p-3">{item.title} ({item.story_points} points)</li>)}</ul>;
}
