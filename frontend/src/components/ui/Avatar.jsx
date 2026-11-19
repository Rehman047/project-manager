// Shared avatar component.
export default function Avatar({ name = "?" }) { return <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-sm">{name[0]?.toUpperCase()}</span>; }
