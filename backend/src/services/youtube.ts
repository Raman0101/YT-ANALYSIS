import fetch from 'node-fetch';
import { AppError } from '../utils/error';
import { getCached, setCached, makeKey } from './cache';

type YouTubeChannel = {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails?: { [k: string]: { url: string } };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount: string;
  };
  contentDetails?: {
    relatedPlaylists?: { uploads?: string };
  };
};

type YouTubeVideo = {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: { [k: string]: { url: string } };
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

const API_ORIGIN = 'https://www.googleapis.com';
const API_KEY = process.env.YT_API_KEY || '';

if (!API_KEY) {
  // Allow startup; tests may inject mocks. Real runtime should set the key.
  console.warn('Warning: YT_API_KEY is not set. API calls will fail.');
}

function buildUrl(resource: string, params: Record<string, string>) {
  // Always target /youtube/v3/<resource>
  const u = new URL(`/youtube/v3/${resource}`, API_ORIGIN);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  u.searchParams.set('key', API_KEY);
  return u.toString();
}

async function ytGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = buildUrl(path, params);
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text();
    throw new AppError('YOUTUBE_API_ERROR', `YouTube API error ${r.status}: ${body}`);
  }
  return (await r.json()) as T;
}

async function resolveChannelId(channelName: string): Promise<string> {
  // Try forUsername (legacy /user/)
  try {
    const byUsername = await ytGet<{ items: Array<YouTubeChannel> }>('channels', {
      part: 'id',
      forUsername: channelName,
      maxResults: '1',
    });
    if (byUsername.items && byUsername.items.length > 0) {
      return byUsername.items[0].id;
    }
  } catch (e) {
    // Ignore and fallback to search
  }

  // Fallback: search by query (type=channel)
  const search = await ytGet<{ items: Array<{ id?: { channelId?: string } }> }>('search', {
    part: 'id',
    q: channelName,
    type: 'channel',
    maxResults: '1',
  });
  const channelId = search.items?.[0]?.id?.channelId;
  if (!channelId) {
    throw new AppError('CHANNEL_NOT_FOUND', 'Channel not found');
  }
  return channelId;
}

async function getChannelDetails(channelId: string): Promise<YouTubeChannel> {
  const data = await ytGet<{ items: YouTubeChannel[] }>('channels', {
    part: 'snippet,statistics,contentDetails',
    id: channelId,
    maxResults: '1',
  });
  const channel = data.items?.[0];
  if (!channel) throw new AppError('CHANNEL_NOT_FOUND', 'Channel not found');
  return channel;
}

async function listAllUploadVideoIds(uploadsPlaylistId: string, limit: number = 500): Promise<string[]> {
  let pageToken: string | undefined = undefined;
  const ids: string[] = [];
  do {
    const resp = await ytGet<{ items: Array<{ contentDetails?: { videoId?: string } }>; nextPageToken?: string }>(
      'playlistItems',
      {
        part: 'contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      }
    );
    for (const it of resp.items || []) {
      const vid = it.contentDetails?.videoId;
      if (vid) ids.push(vid);
      if (ids.length >= limit) break;
    }
    pageToken = resp.nextPageToken;
  } while (pageToken && ids.length < limit);
  return ids;
}

async function getVideosDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));
  const results: YouTubeVideo[] = [];
  for (const chunk of chunks) {
    const resp = await ytGet<{ items: YouTubeVideo[] }>('videos', {
      part: 'snippet,statistics',
      id: chunk.join(','),
      maxResults: '50',
    });
    results.push(...(resp.items || []));
  }
  return results;
}

function pickThumb(thumbnails?: { [k: string]: { url: string } }) {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    null
  );
}

function toInt(v?: string): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function analyzeChannel(channelName: string) {
  const cacheKey = makeKey(['analyze', channelName.toLowerCase()]);
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const channelId = await resolveChannelId(channelName);
  const channel = await getChannelDetails(channelId);

  const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
  const errors: string[] = [];
  if (!uploadsId) {
    errors.push('Uploads playlist not found');
  }

  const videoIds = uploadsId ? await listAllUploadVideoIds(uploadsId, 1000) : [];
  const videos = videoIds.length > 0 ? await getVideosDetails(videoIds) : [];

  const videosNormalized = videos.map((v) => ({
    videoId: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    viewCount: toInt(v.statistics.viewCount) || 0,
    likeCount: toInt(v.statistics.likeCount) || 0,
    commentCount: toInt(v.statistics.commentCount) || 0,
    thumbnail: pickThumb(v.snippet.thumbnails),
  }));

  const topVideos = [...videosNormalized]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);

  const now = Date.now();
  const topVideosByEngagement = [...videosNormalized]
    .map((v) => {
      const ageDays = Math.max(1, Math.floor((now - new Date(v.publishedAt).getTime()) / (1000 * 60 * 60 * 24)));
      const engagement = (v.viewCount + v.likeCount + v.commentCount) / ageDays;
      return { ...v, engagement };
    })
    .sort((a, b) => (b.engagement as number) - (a.engagement as number))
    .slice(0, 10)
    .map(({ engagement, ...rest }) => rest);

  const hidden = channel.statistics.hiddenSubscriberCount === true;
  const statistics = {
    subscriberCount: hidden ? null : toInt(channel.statistics.subscriberCount || ''),
    viewCount: toInt(channel.statistics.viewCount) || 0,
    videoCount: toInt(channel.statistics.videoCount) || 0,
    hiddenSubscriberCount: !!channel.statistics.hiddenSubscriberCount,
  };

  const result = {
    channel: {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      publishedAt: channel.snippet.publishedAt,
      thumbnailUrl: pickThumb(channel.snippet.thumbnails),
      country: channel.snippet.country,
    },
    statistics,
    recentSummary: { last30daysViews: null, last30daysSubscribers: null }, // Best-effort placeholder
    topVideos,
    topVideosByEngagement,
    errors,
    meta: {
      fetchedAt: new Date().toISOString(),
      // Rough quota estimate: channels.list(2) ~2, playlistItems pages ~1/page, videos.list chunks ~1/chunk
      quotaUsedEstimate: 2 + Math.ceil(videoIds.length / 50) + Math.ceil(videoIds.length / 50),
    },
  };

  setCached(cacheKey, result);
  return result;
}

// Export internals for testing
export const __test__ = { resolveChannelId, getChannelDetails, listAllUploadVideoIds, getVideosDetails };


