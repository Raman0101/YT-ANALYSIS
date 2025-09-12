import { useState } from 'react';
import ChannelForm from './components/ChannelForm';
import ChannelHeader from './components/ChannelHeader';
import TopVideosList from './components/TopVideosList';
import TopVideosChart from './components/Charts/TopVideosChart';

type AnalyzeResponse = {
  channel: { id: string; title: string; description: string; publishedAt: string; thumbnailUrl: string | null; country?: string };
  statistics: { subscriberCount: number | null; viewCount: number; videoCount: number; hiddenSubscriberCount: boolean };
  recentSummary: { last30daysViews: number | null; last30daysSubscribers: number | null };
  topVideos: Array<{ videoId: string; title: string; publishedAt: string; viewCount: number; likeCount: number; commentCount: number; thumbnail: string | null }>;
  topVideosByEngagement?: Array<any>;
  errors: string[];
  meta: { fetchedAt: string; quotaUsedEstimate: number };
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  async function handleAnalyze(channelName: string) {
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/analyze?channelName=${encodeURIComponent(channelName)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.[0] || `Request failed with ${res.status}`);
      }
      const body = (await res.json()) as AnalyzeResponse;
      setData(body);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze channel');
    } finally {
      setLoading(false);
    }
  }

  const themeToggle = null;

  if (!data) {
    return (
      <div className="min-h-screen text-[var(--text-high)] flex items-center justify-center px-0 gradient-hero">
        <div className="w-full">
          <section className="w-full py-16 md:py-24">
            <div className="px-6 md:px-12">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-6xl">
                Analyze any YouTube channel.
              </h1>
              <p className="text-lg md:text-2xl" style={{ color: 'var(--text-med)' }}>
                See channel stats and top videos in seconds. Just enter the channel name.
              </p>
            </div>
            <div className="mt-10">
              <div className="px-6 md:px-12">
                <div className="card card-hover gradient-border glass-card p-6 md:p-8 w-full">
                  <ChannelForm onAnalyze={handleAnalyze} loading={loading} />
                  {loading && <div className="mt-4 chip" style={{ color: 'var(--accent-primary)' }}>Analyzing…</div>}
                  {error && (
                    <div className="mt-4 p-3 rounded border" role="alert" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--text-high)', borderColor: 'rgba(239,68,68,0.25)' }}>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100" style={{ background: 'linear-gradient(180deg, #0b1020 0%, #0f172a 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">YouTube Channel Analyzer</h1>
        </div>

        <div className="mt-0 space-y-8">
          <ChannelHeader channel={data.channel} statistics={data.statistics} />

          <section>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card card-hover p-6 glass-card">
                <div className="text-sm" style={{ color: 'var(--text-med)' }}>👁️ Views</div>
                <div className="text-3xl font-semibold text-white">{formatCompact(data.statistics.viewCount)}</div>
              </div>
              <div className="card card-hover p-6 glass-card">
                <div className="text-sm" style={{ color: 'var(--text-med)' }}>👥 Subscribers</div>
                <div className="text-3xl font-semibold text-white">{data.statistics.hiddenSubscriberCount ? 'Hidden' : (data.statistics.subscriberCount != null ? formatCompact(data.statistics.subscriberCount) : '—')}</div>
              </div>
              <div className="card card-hover p-6 glass-card">
                <div className="text-sm" style={{ color: 'var(--text-med)' }}>🎥 Videos</div>
                <div className="text-3xl font-semibold text-white">{formatCompact(data.statistics.videoCount)}</div>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <h2 className="text-2xl font-semibold">Top 10 Videos by Views</h2>
              <div className="card p-4 glass-card">
                <div className="h-80 md:h-96">
                  <TopVideosChart videos={data.topVideos} />
                </div>
              </div>
              <TopVideosList videos={data.topVideos} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(value);
}


