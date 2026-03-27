# Dual App Setup - Complete! ✅

## 🎉 Oba appa sta zagnana in delujeta

### 📍 Dostopne točke

1. **AI Chat Agents**: https://chat.skillaro.eu
   - Kontejnerji: `ai-chat-server`, `ai-chat-web`
   
2. **AI Portal**: https://ai-portal.skillaro.eu
   - Kontejnerji: `ai-portal-app`, `ai-portal-db`

### 🔧 Arhitektura

```
Internet (Port 80/443)
         ↓
   ai-chat-nginx (Nginx Reverse Proxy)
         ↓
    ┌────┴─────┐
    ↓          ↓
chat.skillaro.eu   ai-portal.skillaro.eu
    ↓                    ↓
ai-chat-web          ai-portal-app
    ↓                    ↓
ai-chat-server       ai-portal-db
```

### 🐳 Docker Setup

**Skupni nginx proxy**: `ai-chat-nginx`
- Posluša na portih 80 in 443
- Usmeri promet glede na domen
- Upravlja SSL certifikate za oba appa

**AI Chat Network**: `ai-chat-agents_default`
- ai-chat-nginx
- ai-chat-server  
- ai-chat-web
- ai-chat-certbot
- **ai-portal-app** (dodan v ta network)

**AI Portal Network**: `ai-portal_ai-portal-network`
- ai-portal-app
- ai-portal-db

### 🔐 SSL Certifikati

Oba appa imajo Let's Encrypt SSL certifikate:
- ✅ chat.skillaro.eu
- ✅ ai-portal.skillaro.eu

Certbot (`ai-chat-certbot`) avtomatično obnavlja vse certifikate.

### 📂 Konfiguracija

**Nginx konfiguracija**:
- Main config: `/ai-chat-agents/nginx/nginx.conf`
- Chat app: `/ai-chat-agents/nginx/conf.d/app.conf`
- Portal app: `/ai-chat-agents/nginx/conf.d/ai-portal.conf`

**Docker Compose**:
- Chat: `/ai-chat-agents/docker-compose.yml`
- Portal: `/ai-portal/docker-compose.yml`

### 🚀 Upravljanje

#### Preveri status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### Restart appov
```bash
# AI Chat
cd /ai-chat-agents && docker-compose restart

# AI Portal
cd /ai-portal && docker-compose restart
```

#### Reload Nginx (po spremembi konfiguracije)
```bash
docker exec ai-chat-nginx nginx -t
docker exec ai-chat-nginx nginx -s reload
```

#### Poglej loge
```bash
# Nginx
docker logs -f ai-chat-nginx

# AI Portal
docker logs -f ai-portal-app
docker logs -f ai-portal-db

# AI Chat
docker logs -f ai-chat-server
docker logs -f ai-chat-web
```

### 🔄 Dodajanje novega appa

Za dodajanje tretjega appa:

1. Dodaj kontejner v `ai-chat-agents_default` network
2. Ustvari nginx konfiguracijo v `/ai-chat-agents/nginx/conf.d/`
3. Pridobi SSL certifikat:
   ```bash
   docker exec -it ai-chat-certbot certbot certonly \
     --webroot --webroot-path=/var/www/html \
     --email admin@skillaro.eu --agree-tos \
     -d your-domain.skillaro.eu
   ```
4. Reload nginx: `docker exec ai-chat-nginx nginx -s reload`

### 💾 Backup

**PostgreSQL (AI Portal)**:
```bash
docker exec ai-portal-db pg_dump -U aiportal aiportal > backup.sql
```

**SSL Certifikati**:
```bash
tar -czf ssl-backup.tar.gz /ai-chat-agents/nginx/ssl/
```

### 🆘 Troubleshooting

**Nginx ne vidi kontejnerja**:
- Preveri da je kontejner v `ai-chat-agents_default` networku
- Uporabi Docker DNS resolver (`resolver 127.0.0.11`)
- Uporabi spremenljivko za upstream: `set $upstream_app container-name`

**SSL certifikat ne deluje**:
```bash
# Preveri certifikat
docker exec -it ai-chat-certbot ls -la /etc/letsencrypt/live/

# Ročna obnova
docker exec -it ai-chat-certbot certbot renew
docker exec ai-chat-nginx nginx -s reload
```

**Port že zaseden**:
- Samo `ai-chat-nginx` posluša na 80/443
- Drugi kontejnerji uporabljajo `expose` namesto `ports`

### ✅ Trenutni Status

```
✅ ai-chat-nginx - UP (80, 443)
✅ ai-chat-server - UP
✅ ai-chat-web - UP
✅ ai-chat-certbot - UP
✅ ai-portal-app - UP
✅ ai-portal-db - UP

🔒 SSL certifikati - Aktivni
🔄 Avtomatska obnova - Aktivna
```

---

**Zadnja posodobitev**: 4. marec 2026
