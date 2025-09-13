import { Router } from 'express';
import { validateChannelName } from '../utils/validators.js';
import { createErrorResponse } from '../utils/error.js';
import { analyzeChannel } from '../services/youtube.js';

const router = Router();

router.get('/analyze', async (req, res) => {
  const channelName = String(req.query.channelName || '').trim();
  const validation = validateChannelName(channelName);
  if (!validation.valid) {
    return res.status(400).json(
      createErrorResponse(400, [validation.message ?? "Unknown validation error"])
    );

  }

  try {
    const result = await analyzeChannel(channelName);
    return res.json(result);
  } catch (err: any) {
    if (err?.code === 'CHANNEL_NOT_FOUND') {
      return res.status(404).json(createErrorResponse(404, [err.message]));
    }
    if (err?.code === 'YOUTUBE_API_ERROR') {
      return res.status(502).json(createErrorResponse(502, [err.message]));
    }
    return res.status(500).json(createErrorResponse(500, ['Unexpected server error']));
  }
});

export default router;


