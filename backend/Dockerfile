FROM node:20-alpine
WORKDIR /app

# Copy deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Start app
EXPOSE 3000
CMD ["node", "dist/index.js"]
