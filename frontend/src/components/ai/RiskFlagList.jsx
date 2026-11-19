// AI risk flag list.
export default function RiskFlagList({ risks = [] }) {
  return <ul className="space-y-2">{risks.map((risk, i) => <li key={risk.title || i} className="rounded border p-3"><strong>{risk.severity}: {risk.title}</strong><p>{risk.description}</p></li>)}</ul>;
}
