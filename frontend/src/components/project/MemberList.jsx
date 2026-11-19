export default function MemberList({ members = [] }) {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {members.map((member) => (
        <div key={member.user_id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{member.user_name?.[0]?.toUpperCase()}</div>
            <div><p className="font-semibold text-slate-900">{member.user_name}</p><p className="text-xs text-slate-500">{member.role}</p></div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">{member.role}</span>
        </div>
      ))}
    </div>
  );
}
