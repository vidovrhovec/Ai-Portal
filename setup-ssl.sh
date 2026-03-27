#!/bin/bash

set -e

echo "=================================="
echo "AI Portal - SSL Setup Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it first."
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$SSL_EMAIL" ]; then
    echo "Error: SSL_EMAIL not set in .env file"
    exit 1
fi

DOMAIN="ai-portal.skillaro.eu"
echo "Domain: $DOMAIN"
echo "Email: $SSL_EMAIL"
echo ""

# Create temporary nginx config for initial cert request
echo "Step 1: Creating temporary nginx configuration..."
cat > ./nginx/conf.d/ai-portal.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ai-portal.skillaro.eu;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Let\'s Encrypt verification';
        add_header Content-Type text/plain;
    }
}
EOF

echo "Step 2: Starting nginx for certificate request..."
docker-compose up -d nginx

echo "Step 3: Waiting for nginx to start..."
sleep 5

echo "Step 4: Requesting SSL certificate from Let's Encrypt..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    
    # Restore full nginx config with SSL
    echo "Step 5: Updating nginx configuration with SSL..."
    cat > ./nginx/conf.d/ai-portal.conf << 'EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ai-portal.skillaro.eu;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ai-portal.skillaro.eu;

    ssl_certificate /etc/letsencrypt/live/ai-portal.skillaro.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai-portal.skillaro.eu/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /ws {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    echo "Step 6: Restarting services with SSL enabled..."
    docker-compose down
    docker-compose up -d
    
    echo ""
    echo "=================================="
    echo "✅ SSL Setup Complete!"
    echo "=================================="
    echo ""
    echo "Your site is now available at: https://ai-portal.skillaro.eu"
    echo "SSL certificates will auto-renew every 12 hours (if needed)"
    echo ""
else
    echo ""
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check:"
    echo "1. DNS is correctly pointing to this server"
    echo "2. Ports 80 and 443 are open"
    echo "3. Domain name is correct: $DOMAIN"
    echo ""
    exit 1
fi
