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

RUN apk add --no-cache ca-certificates tzdata nginx supervisor certbot

WORKDIR /app
COPY --from=backend  /backend/server       /app/server
COPY --from=frontend /frontend/dist        /usr/share/nginx/html
COPY nginx/nginx.conf                      /etc/nginx/nginx.conf
COPY nginx/nginx.http.conf                 /etc/nginx/nginx.http.conf
COPY nginx/nginx.https.conf                /etc/nginx/nginx.https.conf
COPY supervisord.conf                      /etc/supervisord.conf
COPY entrypoint.sh                         /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

CMD ["/entrypoint.sh"]
