# Keycloak Docker Setup with SSL

This directory contains the Docker Compose configuration for running Keycloak in the VM with SSL/HTTPS support via Nginx reverse proxy.

## Prerequisites

- Docker and Docker Compose
- A domain name pointed to your server (e.g., `naic-kc.ashen.no`)
- Nginx installed and configured as reverse proxy
- SSL certificates (Let's Encrypt via Certbot)

## Architecture

```
Internet (HTTPS) → Nginx (SSL) → Keycloak Docker (HTTP localhost:8080)
```

## Getting Started

### 1. Set Up SSL (First Time Only)

If you haven't set up SSL yet, follow the complete guide in [SSL_SETUP.md](SSL_SETUP.md).

This includes:
- Installing and configuring Nginx
- Obtaining SSL certificates with Certbot
- Setting up automatic certificate renewal

### 2. Start Keycloak

Run the following command from the `docker-keycloak` directory:

```sh
docker compose up -d
```

This will start Keycloak on `http://localhost:8080` (accessible only from localhost).

### 3. Wait for Keycloak to Start

Give Keycloak a minute to fully start up. You can check the logs with:

```sh
docker compose logs -f keycloak
```

### 4. Configuration Notes

The `docker-compose.yml` is configured to work with the Nginx reverse proxy:

- **KC_HOSTNAME**: Set to `naic-kc.ashen.no` (your domain)
- **KC_HTTP_ENABLED**: `true` (Nginx handles HTTPS)
- **KC_PROXY_HEADERS**: `xforwarded` (trusts X-Forwarded-* headers from Nginx)
- **KC_HOSTNAME_STRICT**: `false` (allows reverse proxy setup)

These settings ensure Keycloak correctly handles HTTPS requests forwarded by Nginx.

## Access Keycloak

### Production (via HTTPS)
- **URL**: https://naic-kc.ashen.no
- **Admin Console**: https://naic-kc.ashen.no/admin
- **Admin Username**: admin
- **Admin Password**: <naic-admin-password>

### Local Development (Docker host only)
- **URL**: http://localhost:8080
- **Note**: This is only accessible from the server itself, not externally

## Stopping Keycloak

To stop the Keycloak container:

```sh
docker compose down
```

To stop and remove all data (including volumes):

```sh
docker compose down -v
```

⚠️ **Warning**: Using `-v` will delete all Keycloak data including realms, clients, and users!

## Data Persistence

Keycloak data is persisted in the `keycloak-data` Docker volume defined in [docker-compose.yml](docker-compose.yml).

To backup data:
```sh
docker run --rm -v keycloak-data:/data -v $(pwd):/backup alpine tar czf /backup/keycloak-backup.tar.gz /data
```

To restore data:
```sh
docker run --rm -v keycloak-data:/data -v $(pwd):/backup alpine tar xzf /backup/keycloak-backup.tar.gz -C /
```

## Troubleshooting

### Cannot access Keycloak via HTTPS
1. Verify Nginx is running: `sudo systemctl status nginx`
2. Check Nginx configuration: `sudo nginx -t`
3. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Ensure Keycloak is running: `docker compose ps`

### SSL Certificate Issues
1. Verify certificate is valid: `sudo certbot certificates`
2. Test renewal: `sudo certbot renew --dry-run`
3. Check certificate files exist in `/etc/letsencrypt/live/naic-kc.ashen.no/`

### Redirect or Login Issues
1. Verify `KC_HOSTNAME` matches your domain exactly
2. Check Keycloak logs: `docker compose logs -f keycloak`
3. Ensure client redirect URIs in Keycloak admin use HTTPS URLs

## Related Documentation

- [SSL_SETUP.md](SSL_SETUP.md) - Complete SSL setup guide
- [docker-compose.yml](docker-compose.yml) - Docker configuration