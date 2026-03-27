# AI Portal Deployment

Aplikacija je pripravljena za deployment na **ai-portal.skillaro.eu** z Docker, Nginx reverse proxy in avtomatsko obnovo SSL certifikatov.

## 🚀 Hitra namestitev

### 1. Konfiguracija

Kopirajte in uredite okolje:
```bash
cd /ai-portal
cp .env.example .env
nano .env
```

**Pomembno:** Nastavite v `.env`:
- `DB_PASSWORD` - močno geslo za PostgreSQL
- `NEXTAUTH_SECRET` - naključen secret key (lahko generirate z `openssl rand -base64 32`)
- `SSL_EMAIL` - vaš email za Let's Encrypt obvestila

### 2. DNS Nastavitve

Preden nadaljujete, nastavite DNS A record:
```
ai-portal.skillaro.eu  ->  [IP STREŽNIKA]
```

Preverite z: `nslookup ai-portal.skillaro.eu`

### 3. Deployment

```bash
cd /ai-portal
sudo chmod +x deploy.sh setup-ssl.sh
sudo ./deploy.sh
```

To bo:
- ✅ Namestilo Docker (če še ni nameščen)
- ✅ Zgradilo Docker image
- ✅ Zagnalo PostgreSQL bazo
- ✅ Zagnalo Next.js aplikacijo
- ✅ Zagnalo Nginx reverse proxy

### 4. SSL Setup

Po uspešnem deploymentu, nastavite SSL:
```bash
sudo ./setup-ssl.sh
```

To bo:
- ✅ Pridobilo SSL certifikat od Let's Encrypt
- ✅ Konfiguriralo Nginx za HTTPS
- ✅ Nastavilo avtomatsko obnovo certifikatov (vsakih 12 ur)

## 📦 Struktura projekta

```
/ai-portal/
├── docker-compose.yml       # Docker Compose konfiguracija
├── Dockerfile              # Docker image za Next.js app
├── nginx/                  # Nginx konfiguracija
│   ├── nginx.conf
│   └── conf.d/
│       └── ai-portal.conf
├── certbot/                # Let's Encrypt certifikati
│   ├── conf/
│   └── www/
├── .env                    # Okolje (ne commitaj!)
├── .env.example           # Primer okolja
├── deploy.sh              # Deployment skripta
└── setup-ssl.sh           # SSL setup skripta
```

## 🐳 Docker Services

### Servisi
- **app**: Next.js aplikacija (port 3000)
- **db**: PostgreSQL 15 (port 5432)
- **nginx**: Reverse proxy (port 80, 443)
- **certbot**: SSL certifikat manager

### Koristne komande

```bash
# Poglej status
docker-compose ps

# Poglej loge
docker-compose logs -f

# Poglej loge za specifičen servis
docker-compose logs -f app
docker-compose logs -f nginx

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild in restart
docker-compose up -d --build

# Vstopi v container
docker-compose exec app sh
docker-compose exec db psql -U aiportal
```

## 🔄 SSL Avtomatska obnova

Certbot container teče v ozadju in preverja za obnovo vsakih 12 ur. Let's Encrypt certifikati so veljavni 90 dni in se avtomatično obnovijo ~30 dni pred iztekom.

### Ročna obnova SSL
```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

## 🔐 Varnost

Aplikacija uporablja:
- ✅ HTTPS Only (HTTP redirect)
- ✅ HSTS Headers
- ✅ Security Headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ TLS 1.2+
- ✅ Strong cipher suites
- ✅ SSL session caching

## 🗄️ Baza podatkov

### Backup
```bash
docker-compose exec db pg_dump -U aiportal aiportal > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
cat backup_20260304.sql | docker-compose exec -T db psql -U aiportal aiportal
```

## 🔧 Troubleshooting

### SSL certifikat se ne pridobi
1. Preveri DNS: `nslookup ai-portal.skillaro.eu`
2. Preveri, da so porti 80 in 443 odprti: `sudo ufw status`
3. Preveri nginx loge: `docker-compose logs nginx`

### Aplikacija ne teče
1. Preveri loge: `docker-compose logs app`
2. Preveri, da je baza dostopna: `docker-compose ps db`
3. Preveri okolje: `cat .env`

### Baza se ne poveže
1. Preveri, da DATABASE_URL v .env uporablja `db` kot hostname
2. Preveri geslo v .env
3. Restart: `docker-compose restart db app`

## 📊 Monitoring

### Poglej resource usage
```bash
docker stats
```

### Preveri disk space
```bash
df -h
docker system df
```

### Cleanup
```bash
# Odstrani neuporabljene image-e
docker system prune -a

# Odstrani stare volume-e (POZOR: briše podatke!)
docker volume prune
```

## 🌐 Dostop

Po uspešni namestitvi:
- **URL**: https://ai-portal.skillaro.eu
- **Database**: localhost:5432 (internal: db:5432)

## 📝 Opombe

- SSL certifikati so shranjeni v `./certbot/conf/`
- PostgreSQL podatki so shranjeni v Docker volume `postgres-data`
- Nginx logi so v containeru pod `/var/log/nginx/`
- Aplikacija teče kot non-root user (nextjs:nodejs)

## 🆘 Podpora

Za težave odprite issue ali kontaktirajte admin@skillaro.eu
