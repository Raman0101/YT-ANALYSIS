# Stage 1: Dependencies (production only)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm install --omit=dev

# Stage 2: Build (needs devDependencies)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install   # install all deps including dev
COPY tsconfig.json ./ 
COPY src ./src
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./ 
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
