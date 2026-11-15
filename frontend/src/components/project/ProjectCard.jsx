export default function ProjectCard({ project, onClick }) {
  return (
    <button className="rounded-xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={onClick}>
      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-gray-500">{project.description || 'No description provided.'}</p>
      <span className="mt-5 inline-block text-sm font-medium text-blue-600">Open project</span>
    </button>
  );
}
