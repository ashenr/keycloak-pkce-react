# Keycloak Docker Setup

This directory contains the Docker Compose configuration for running Keycloak in the VM.

## Prerequisites

- Docker

## Getting Started

### 1. Start Keycloak

Run the following command from the `docker` directory:

```sh
docker compose up -d
```

This will start Keycloak on `http://localhost:8080`.

### 2. Wait for Keycloak to Start

Give Keycloak a minute to fully start up. You can check the logs with:

```sh
docker compose logs -f keycloak
```

### 3. Configure SSL Requirements

By default, Keycloak requires SSL for production use. For development, you need to disable this requirement on the master realm.

#### Log in with kcadm.sh

```sh
docker exec -it keycloak \
  /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password <naic-admin-password>
```

#### Update the Realm

```sh
docker exec -it keycloak \
  /opt/keycloak/bin/kcadm.sh update realms/master \
  -s sslRequired=NONE
```

## Access Keycloak

- **URL**: http://localhost:8080
- **Admin Username**: admin
- **Admin Password**: <naic-admin-password>

## Stopping Keycloak

To stop the Keycloak container:

```sh
docker compose down
```

To stop and remove all data (including volumes):

```sh
docker compose down -v
```

## Data Persistence

Keycloak data is persisted in the `keycloak-data` Docker volume defined in [docker-compose.yml](docker-compose.yml).