import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze.js';

const app = express();

const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 60);
app.use(
  rateLimit({
    windowMs,
    max: maxReq,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', analyzeRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Basic error boundary
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


