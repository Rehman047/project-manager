// AI task input.
import { useState } from "react";
export default function AITaskInput({ onSubmit }) {
  const [prompt, setPrompt] = useState("");
  return <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) onSubmit?.(prompt.trim()); }} className="flex gap-2">
    <input className="flex-1 rounded border p-2" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe a task" />
    <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Generate</button>
  </form>;
}
