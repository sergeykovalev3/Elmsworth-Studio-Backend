FROM node:22-bookworm-slim AS cabinet
WORKDIR /build
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ .
ARG VITE_SITE_URL=https://elmsworth-studio.vercel.app
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOAD_DIR=/data/uploads
COPY api/package.json api/package-lock.json ./api/
RUN npm ci --prefix api
COPY api/src ./api/src
COPY --from=cabinet /build/dist ./admin/dist
EXPOSE 3001
CMD ["npm", "run", "start", "--prefix", "api"]
