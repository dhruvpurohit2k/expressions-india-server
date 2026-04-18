# ── Frontend build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Backend build ─────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS backend

WORKDIR /backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/api

# ── Final image ───────────────────────────────────────────────────────────────
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata nginx supervisor

WORKDIR /app
COPY --from=backend  /backend/server       /app/server
COPY --from=frontend /frontend/dist        /usr/share/nginx/html
COPY nginx/nginx.conf                      /etc/nginx/nginx.conf
COPY supervisord.conf                      /etc/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
