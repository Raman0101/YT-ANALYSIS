import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(value);
}

export default function TopVideosChart({
  videos,
}: {
  videos: Array<{ title: string; viewCount: number }>;
}) {
  const data = videos.map((v) => ({ name: v.title.slice(0, 24) + (v.title.length > 24 ? '…' : ''), views: v.viewCount }));
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#ffffff14" vertical={false} />
            <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} height={10} />
            <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={{ fill: '#DFD0B8' }} />
            <Tooltip contentStyle={{ background: 'rgba(34,40,49,0.9)', border: '1px solid rgba(223,208,184,0.2)', color: '#DFD0B8' }} formatter={(value) => [formatCompact(Number(value)), 'Views']} />
            <Bar dataKey="views" fill="#948979" radius={[6, 6, 0, 0]} />
          </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


