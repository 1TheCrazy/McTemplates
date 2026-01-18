# Dev Build (Intermediate)
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Prod Build
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app ./

# Run App
CMD [ "npm", "start" ]