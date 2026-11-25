# Production image for Cloud Run / Docker
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cloud Run --set-build-env-vars maps to Docker build-args when present.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_APP_NAME=Bada
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN echo "Building Next.js with NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
  && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json* ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY scripts/docker-entrypoint.sh /entrypoint.sh

# Placeholder overwritten by entrypoint from Cloud Run env on every start
RUN chmod +x /entrypoint.sh \
  && printf 'window.__BADA_API_URL=undefined;\n' > /app/public/bada-runtime.js \
  && chown -R nextjs:nodejs /app/public /entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start"]
