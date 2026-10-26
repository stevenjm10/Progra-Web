# Docker deployment on AWS Academy

Run commands from the repository root. Docker Compose runs PostgreSQL 16, Spring Boot and Nginx. Only HTTP port 80 is published. Page 1 is at / and Page 2 at /pagina2/. No local Java or PostgreSQL installation is required for the containers.

## Install Docker on Amazon Linux 2023

```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo mkdir -p /usr/local/lib/docker/cli-plugins
```

Install the official Compose plugin for x86_64:

```bash
sudo curl -fL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
sudo docker compose version
```

## Configure

```bash
cd ~/Progra-Web
git fetch origin
git switch test
git pull --ff-only origin test
cp .env.example .env
nano .env
chmod 600 .env
```

Replace DB_PASSWORD with your chosen password. Do not commit .env. After the release PR is merged, use main instead of test for deployment.

## Preserve the existing host database

Before switching from the previous systemd deployment, export its existing data:

```bash
sudo -u postgres pg_dump --data-only --no-owner --no-privileges reservas > ~/restaurant-data.sql
chmod 600 ~/restaurant-data.sql
```

This backup stays outside the repository. Keep the host PostgreSQL service and its data until the container deployment is verified.

## Build and switch

Build while the existing website remains available:

```bash
sudo docker compose build
sudo docker compose up -d database
```

A new Docker volume automatically receives the schema and ten sample dishes. To migrate existing host records instead, wait for the database to be healthy with `sudo docker compose ps`, then replace only the fresh container sample records using the backup:

```bash
{ printf 'BEGIN;\nTRUNCATE TABLE dish RESTART IDENTITY;\n'; cat ~/restaurant-data.sql; printf '\nCOMMIT;\n'; } | sudo docker compose exec -T database psql -v ON_ERROR_STOP=1 -U restaurant_app -d reservas
```

The transaction preserves the host records and IDs; it replaces the initial sample rows in the container database. Do this only during the initial migration, before users modify container data.

Stop the old web services to release port 80, then start the containers:

```bash
sudo systemctl stop nginx restaurant
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=80 app
```

Spring Boot may need a minute to start. Verify:

```bash
curl -f http://127.0.0.1/api/dishes
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/pagina2/
curl -I http://127.0.0.1/pagina2/characters.js
```

Open http://PUBLIC_IP/ and http://PUBLIC_IP/pagina2/ in a browser. Check creating, editing and deleting a temporary dish, and the character search and details. Keep inbound HTTP 80 enabled on the instance security group.

After successful verification, prevent the old services from taking port 80 or running another application on reboot:

```bash
sudo systemctl disable nginx restaurant
```

If deployment fails, inspect `sudo docker compose logs --tail=100`. To restore the previous website:

```bash
sudo docker compose down
sudo systemctl enable --now restaurant nginx
```

## Updates and persistence

```bash
git pull --ff-only
sudo docker compose up -d --build
```

The named volume retains database records across container restarts and rebuilds. Initialization scripts run only on the first empty volume. Never use `docker compose down -v` when preserving data. Changing DB_PASSWORD after initialization also requires changing the database role password.

Docker and containers restart with the EC2 instance. AWS Academy must remain running; the public IP can change after stopping the instance. The EC2 build needs internet access and sufficient memory/disk for Maven.
