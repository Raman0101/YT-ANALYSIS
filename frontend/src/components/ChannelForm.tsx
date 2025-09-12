import { useState } from 'react';

export default function ChannelForm({ onAnalyze, loading }: { onAnalyze: (name: string) => void; loading: boolean }) {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAnalyze(name.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-3 items-center">
      <label htmlFor="channel" className="sr-only">Channel name</label>
      <input
        id="channel"
        type="text"
        placeholder="Enter channel name or custom username"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 bg-[#1a1a1a] text-[var(--text-high)] placeholder-[rgba(255,255,255,0.38)]"
        style={{ borderColor: 'var(--divider)', borderWidth: 1, boxShadow: 'inset 0 0 0 9999px rgba(255,255,255,0.02)' }}
        maxLength={100}
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-5 py-3 text-lg disabled:opacity-50 shadow"
        style={{ color: '#121212', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
      >
        {loading ? 'Analyzing…' : 'Analyze'}
      </button>
    </form>
  );
}


