# SSL Setup for Keycloak with Nginx and Let's Encrypt

This document describes how to set up SSL/HTTPS for Keycloak using Nginx as a reverse proxy and Let's Encrypt for SSL certificates.

## Architecture

```
Internet (HTTPS) → Nginx (SSL Termination) → Keycloak (HTTP localhost:8080)
```

Nginx handles the SSL/TLS encryption and forwards requests to Keycloak over HTTP on localhost.

## Prerequisites

- A domain name pointing to your server (e.g., `naic-kc.ashen.no`)
- Keycloak running via Docker Compose
- Root or sudo access to the server

## Step 1: Install Nginx

Update package lists and install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Verify Nginx is running:

```bash
sudo systemctl status nginx
```

## Step 2: Configure Nginx as Reverse Proxy

Create a new Nginx configuration file for your domain:

```bash
sudo nano /etc/nginx/sites-available/naic-kc.ashen.no
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name naic-kc.ashen.no;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This configuration:
- Listens on port 80 (HTTP)
- Forwards all requests to Keycloak on localhost:8080
- Sets proper headers so Keycloak can detect the client's real IP and protocol

## Step 3: Enable the Site

Create a symbolic link to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/naic-kc.ashen.no /etc/nginx/sites-enabled/
```

Test the Nginx configuration:

```bash
sudo nginx -t
```

If the test is successful, restart Nginx:

```bash
sudo systemctl restart nginx
```

## Step 4: Install Certbot

Install dependencies for Certbot:

```bash
sudo apt update
sudo apt install python3 python3-dev python3-venv libaugeas-dev gcc
```

Set up a Python virtual environment for Certbot:

```bash
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
```

Install Certbot and the Nginx plugin:

```bash
sudo /opt/certbot/bin/pip install certbot certbot-nginx
```

Create a symbolic link to make Certbot command available system-wide:

```bash
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

## Step 5: Obtain SSL Certificate

Run Certbot to obtain a certificate and automatically configure Nginx:

```bash
sudo certbot --nginx
```

Follow the prompts:
1. Enter your email address for renewal notifications
2. Agree to the Terms of Service
3. Choose whether to share your email with EFF
4. Select your domain (`naic-kc.ashen.no`)
5. Choose whether to redirect HTTP to HTTPS (recommended: yes)

Certbot will:
- Obtain an SSL certificate from Let's Encrypt
- Automatically modify your Nginx configuration to use HTTPS
- Set up automatic HTTP to HTTPS redirect

After completion, your Nginx configuration will look similar to:

```nginx
server {
    server_name naic-kc.ashen.no;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/naic-kc.ashen.no/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/naic-kc.ashen.no/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = naic-kc.ashen.no) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name naic-kc.ashen.no;
    return 404; # managed by Certbot
}
```

## Step 6: Set Up Automatic Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

This cron job:
- Runs twice daily at midnight and noon
- Adds a random delay (0-3600 seconds) to avoid overwhelming Let's Encrypt servers
- Attempts to renew certificates quietly

Test the renewal process:

```bash
sudo certbot renew --dry-run
```

## Step 7: Update Keycloak Configuration

The Keycloak Docker Compose configuration has been updated to work with the Nginx reverse proxy. Key settings in `docker-compose.yml`:

```yaml
environment:
  # Must match your domain
  KC_HOSTNAME: naic-kc.ashen.no
  
  # Enable HTTP (Nginx will handle HTTPS)
  KC_HTTP_ENABLED: "true"
  
  # Tell Keycloak to trust X-Forwarded-* headers from Nginx
  KC_PROXY_HEADERS: "xforwarded"
  
  # Relax hostname strictness for reverse proxy setup
  KC_HOSTNAME_STRICT: "false"
```

Restart Keycloak to apply the changes:

```bash
docker compose down
docker compose up -d
```

## Verification

1. Access Keycloak at `https://naic-kc.ashen.no`
2. Verify the SSL certificate is valid (check for the padlock icon in your browser)
3. Try accessing `http://naic-kc.ashen.no` and verify it redirects to HTTPS
4. Check that the Keycloak login page loads correctly

## Troubleshooting

### Nginx won't start
- Check configuration: `sudo nginx -t`
- View logs: `sudo tail -f /var/log/nginx/error.log`

### Certbot fails
- Ensure port 80 is accessible from the internet
- Check firewall rules: `sudo ufw status`
- Verify DNS points to your server: `nslookup naic-kc.ashen.no`

### Keycloak redirect issues
- Verify `KC_HOSTNAME` matches your domain exactly
- Check that `KC_PROXY_HEADERS` is set to `xforwarded`
- Review Keycloak logs: `docker compose logs -f keycloak`

### Certificate renewal fails
- Check renewal logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
- Manually test renewal: `sudo certbot renew --dry-run`

## Certificate Information

- **Issuer**: Let's Encrypt
- **Validity**: 90 days
- **Renewal**: Automatic (via cron job)
- **Location**: `/etc/letsencrypt/live/naic-kc.ashen.no/`

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Keycloak Reverse Proxy Guide](https://www.keycloak.org/server/reverseproxy)
- [Nginx Documentation](https://nginx.org/en/docs/)
