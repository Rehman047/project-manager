// AI breakdown results panel.
export default function BreakdownResultPanel({ items = [] }) {
  return <div className="space-y-2">{items.map((item, i) => <div key={item.title || i} className="rounded border p-3"><strong>{item.title}</strong><p>{item.description}</p></div>)}</div>;
}
