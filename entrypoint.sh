#!/bin/sh
set -e

DOMAIN="${DOMAIN:-13.206.10.230.nip.io}"
EMAIL="${CERTBOT_EMAIL:-admin@expressionsindia.org}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

mkdir -p /var/www/certbot

if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    echo "[entrypoint] No certificate found — obtaining one for $DOMAIN..."

    # Start nginx with HTTP-only config to serve the ACME challenge
    cp /etc/nginx/nginx.http.conf /etc/nginx/nginx.conf
    nginx

    certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    nginx -s quit
    sleep 1
    echo "[entrypoint] Certificate obtained."
else
    echo "[entrypoint] Certificate already exists, skipping certbot."
fi

# Substitute the domain into the HTTPS nginx config and activate it
sed "s/\${DOMAIN}/$DOMAIN/g" /etc/nginx/nginx.https.conf > /etc/nginx/nginx.conf

# Renew cert daily (certbot skips if not due)
echo "0 0 * * * certbot renew --quiet && nginx -s reload" | crontab -

echo "[entrypoint] Starting supervisor..."
exec supervisord -c /etc/supervisord.conf
