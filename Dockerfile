# --- Builder Stage ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 3000
CMD ["node", "dist/src/main.js"]