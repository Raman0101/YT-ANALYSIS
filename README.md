# YouTube Channel Analyzer (Full Stack)

Analyze any YouTube channel by name or custom URL username. Frontend built with React (Vite) + TailwindCSS. Backend built with Node.js, Express, and TypeScript. Uses YouTube Data API v3 (API key required on backend).

## Features
- Single-page UI to enter a channel name and analyze
- Robust backend API: resolves channel by username or search, fetches channel details, statistics, and top videos via uploads playlist with batching and pagination
- Caching with in-memory LRU (TTL 10 minutes) and rate-limit guard
- Typed end-to-end (TypeScript, strict)
- Tests: Jest + Supertest (backend), Cypress skeleton (frontend)
- Dockerfiles and docker-compose for local dev
- CI via GitHub Actions (lint + tests)

## Quick Start

### 1) Prerequisites
- Node.js 18+
- npm 9+

### 2) Obtain a YouTube Data API v3 key
1. Create a Google Cloud Project.
2. Enable "YouTube Data API v3" for the project.
3. Create an API key (API & Services → Credentials → Create Credentials → API Key).
4. Copy the key and set it as `YT_API_KEY` in `backend/.env` (see `.env.example`).

References: YouTube Data API v3 docs: `https://developers.google.com/youtube/v3`

### 3) Local development
```bash
# From repo root
cp .env.example backend/.env
# Edit backend/.env and set YT_API_KEY=your_key_here

cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start both with Docker (recommended):
docker-compose up --build

# Or run separately without Docker:
cd backend && npm run dev
# In another terminal
cd frontend && npm run dev
```

Open the app: `http://localhost:5173`

The frontend proxies API requests to the backend at `http://localhost:3000` (configured for dev).

### 4) Environment variables
Copy `.env.example` to `backend/.env` and fill values:
```
PORT=3000
YT_API_KEY=REPLACE_ME
CORS_ORIGIN=http://localhost:5173
CACHE_TTL_MS=600000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

Never expose `YT_API_KEY` to the frontend.

### 5) API
Endpoint: `GET /api/analyze?channelName=<name>`

Response:
```json
{
  "channel": { "id": "UC...", "title": "...", "description": "...", "publishedAt": "...", "thumbnailUrl": "...", "country": "US" },
  "statistics": { "subscriberCount": 123, "viewCount": 456, "videoCount": 78, "hiddenSubscriberCount": false },
  "recentSummary": { "last30daysViews": null, "last30daysSubscribers": null },
  "topVideos": [ { "videoId": "...", "title": "...", "publishedAt": "...", "viewCount": 123, "likeCount": 45, "commentCount": 6, "thumbnail": "..." } ],
  "topVideosByEngagement": [],
  "errors": [],
  "meta": { "fetchedAt": "2025-09-12T...Z", "quotaUsedEstimate": 15 }
}
```

Notes:
- If subscriber counts are hidden, `subscriberCount` is `null` and `hiddenSubscriberCount` is `true`.
- Errors are returned with HTTP status codes 400/404/502 depending on issue.

### 6) Testing
```bash
cd backend && npm test
```

Frontend E2E skeleton with Cypress:
```bash
cd frontend && npm run cy:open
```

### 7) Linting and formatting
```bash
cd backend && npm run lint && npm run format
cd frontend && npm run lint && npm run format
```

### 8) Docker
```bash
docker-compose up --build
```
Frontend on `http://localhost:5173`, backend on `http://localhost:3000`.

## Folder Structure
```
/
├─ README.md
├─ .env.example
├─ docker-compose.yml
├─ backend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ routes/analyze.ts
│  │  ├─ services/youtube.ts
│  │  ├─ services/cache.ts
│  │  ├─ utils/error.ts
│  │  ├─ utils/validators.ts
│  │  └─ tests/analyze.test.ts
│  └─ Dockerfile
├─ frontend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  │  ├─ ChannelForm.tsx
│  │  │  ├─ ChannelHeader.tsx
│  │  │  ├─ TopVideosList.tsx
│  │  │  └─ Charts/TopVideosChart.tsx
│  │  └─ styles/index.css
│  └─ Dockerfile
└─ infra/
   └─ nginx.conf
```

## Notes
- Some analytics (quota estimates, engagement score) are best-effort and intended for demonstration.
- You can swap the LRU cache for Redis in `backend/src/services/cache.ts` where noted.


