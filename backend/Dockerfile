# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar dependências para o Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

COPY package*.json ./
# Usamos install em vez de ci para evitar erros de lockfile ausente
RUN npm install

COPY . .

# Gerar o cliente Prisma ANTES do build
RUN npx prisma generate
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/server.js"]
