# Dockerfile para Railway - WhatsApp Agent
FROM node:20-alpine

WORKDIR /app

# Copiar package.json primero para cache de dependencias
COPY frontend/package*.json ./frontend/

# Instalar dependencias
WORKDIR /app/frontend
RUN npm install

# Copiar el resto del código
WORKDIR /app
COPY . .

# Build de Next.js
WORKDIR /app/frontend
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicio
CMD ["npm", "start"]
