export default function TopVideosList({
  videos,
}: {
  videos: Array<{ videoId: string; title: string; publishedAt: string; viewCount: number; likeCount: number; commentCount: number; thumbnail: string | null }>;
}) {
  if (videos.length === 0) return <div className="text-sm text-gray-600">No videos found.</div>;
  return (
    <ul className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {videos.map((v) => (
        <li key={v.videoId} className="card card-hover p-0 glass-card">
          {v.thumbnail ? (
            <img src={v.thumbnail} alt="thumbnail" className="w-full h-44 object-cover rounded-t-xl" />
          ) : (
            <div className="w-full h-44 rounded-t-xl bg-gray-600" aria-hidden />
          )}
          <div className="p-4">
            <a
              href={`https://www.youtube.com/watch?v=${v.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
            >
              {v.title}
            </a>
            <div className="text-sm" style={{ color: 'var(--text-med)' }}>{new Date(v.publishedAt).toLocaleDateString()}</div>
            <div className="text-xs mt-2 flex flex-wrap gap-2 items-center">
              <span className="chip">👁️ {format(v.viewCount)}</span>
              <span className="chip">👍 {format(v.likeCount)}</span>
              <span className="chip">💬 {format(v.commentCount)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function format(value: number) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(value);
}


