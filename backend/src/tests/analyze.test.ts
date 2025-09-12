import request from 'supertest';
import express from 'express';
import analyzeRouter from '../routes/analyze';

jest.unstable_mockModule('../services/youtube.js', () => ({
  analyzeChannel: async (name: string) => ({
    channel: { id: 'UC123', title: name, description: '', publishedAt: '2020-01-01T00:00:00Z', thumbnailUrl: null, country: 'US' },
    statistics: { subscriberCount: 100, viewCount: 1000, videoCount: 10, hiddenSubscriberCount: false },
    recentSummary: { last30daysViews: null, last30daysSubscribers: null },
    topVideos: [],
    topVideosByEngagement: [],
    errors: [],
    meta: { fetchedAt: new Date().toISOString(), quotaUsedEstimate: 5 },
  }),
}));

describe('GET /api/analyze', () => {
  const app = express();
  app.use('/api', analyzeRouter);

  it('returns 400 for missing channelName', async () => {
    const res = await request(app).get('/api/analyze');
    expect(res.status).toBe(400);
    expect(res.body.errors?.length).toBeGreaterThan(0);
  });

  it('returns analysis for valid channelName', async () => {
    const res = await request(app).get('/api/analyze').query({ channelName: 'TestChannel' });
    expect(res.status).toBe(200);
    expect(res.body.channel?.id).toBe('UC123');
    expect(res.body.statistics?.viewCount).toBe(1000);
  });
});


