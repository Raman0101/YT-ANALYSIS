export default function ChannelHeader({
  channel,
  statistics,
}: {
  channel: { id: string; title: string; description: string; publishedAt: string; thumbnailUrl: string | null; country?: string };
  statistics: { subscriberCount: number | null; viewCount: number; videoCount: number; hiddenSubscriberCount: boolean };
}) {
  return (
    <header className="card glass-card p-6">
      <div className="flex flex-col items-center text-center">
        {channel.thumbnailUrl ? (
          <img src={channel.thumbnailUrl} alt={channel.title} className="w-28 h-28 rounded-full ring-1" style={{ borderColor: 'var(--divider)' }} />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-600" aria-hidden />
        )}
        <h2 className="mt-4 text-xl font-bold text-white">{channel.title}</h2>
        <div className="text-sm" style={{ color: 'var(--text-med)' }}>{channel.country ?? '—'} • {new Date(channel.publishedAt).toLocaleDateString()}</div>

        <hr className="w-full my-4" style={{ borderColor: 'var(--divider)' }} />

        <div className="grid grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center">
            <div className="text-sm" style={{ color: 'var(--text-med)' }}>Subscribers</div>
            <div className="text-white font-semibold text-lg">{statistics.hiddenSubscriberCount ? 'Hidden' : (statistics.subscriberCount != null ? formatCompact(statistics.subscriberCount) : '—')}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm" style={{ color: 'var(--text-med)' }}>Videos</div>
            <div className="text-white font-semibold text-lg">{formatCompact(statistics.videoCount)}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm" style={{ color: 'var(--text-med)' }}>Views</div>
            <div className="text-white font-semibold text-lg">{formatCompact(statistics.viewCount)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(value);
}


