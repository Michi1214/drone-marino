# ---------- STAGE 1: build (compila TypeScript) ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Copio solo i manifest prima per usare la cache
COPY package.json package-lock.json* ./
RUN npm install

# Copio il resto dei sorgenti
COPY tsconfig.json ./tsconfig.json
COPY src ./src
COPY sequelize ./sequelize

# Compilo TS -> JS (dist/)
RUN npm run build

# ---------- STAGE 2: runtime (solo ciò che serve in produzione) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copio i manifest e installo SOLO deps di produzione
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copio il build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sequelize ./sequelize

# Porta di ascolto (match con API_PORT)
EXPOSE 3000

# Avvio
CMD ["node", "dist/server.js"]
