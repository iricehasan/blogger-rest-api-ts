FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build


FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/app.js"]
