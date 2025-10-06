# Backend

## Overview
The backend is based on Docker containers. It includes two main services: ThingsBoard CE (Community Edition) and Medplum server, along with their supporting services (databases and cache)

### Main services:
- `thingsboard-ce`: ThingsBoard CE (Community Edition) – open‑source IoT platform for device data collection and visualization
- `medplum-server`: Medplum – open‑source healthcare platform for managing FHIR resources

### Supporting services:
- `tb-postgres`: PostgreSQL – database for ThingsBoard
- `medplum-postgres`: PostgreSQL – database for Medplum
- `medplum-redis`: Redis – cache and message broker for Medplum
- `medplum-app`: Medplum App – web UI for easier access to Medplum server (for easier development, to be removed in the future)

## thingsboard-ce
Uses the official ThingsBoard CE image `thingsboard/tb-node:4.2.0`. It starts only after the `tb-postgres` service becomes healthy (via `depends_on` with a healthcheck)

### Ports:
- `8088:8080` – HTTP port for the ThingsBoard Web UI and REST API, mapped to host `8088`
- `1883:1883` – MQTT port for device communication, mapped to host `1883`
- (optional) `5683-5688:5683-5688/udp` – CoAP ports for device communication, mapped to host `5683-5688/udp`
- (optional) `8883:8883` – secure MQTT port for device communication, mapped to host `8883`
- `expose: "7070"` – port used for internal ThingsBoard services and TB Edge

### Environment variables:
- `SPRING_DATASOURCE_URL=jdbc:postgresql://tb-postgres:5432/thingsboard` – JDBC URL for connecting to the PostgreSQL database. It uses `tb-postgres` service name and `thingsboard` database
- `SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}` – password for the PostgreSQL database user. `postgres` is the default user, if not specified

## medplum-server
Uses the official Medplum server image `medplum/medplum-server:latest`. Starts after both `medplum-postgres` and `medplum-redis` are healthy

### Ports:
- `8103:8103` – Medplum HTTP API/UI port, mapped to host `8103`

> [!IMPORTANT]
> Uses default Medplum configuration. Details below are just vague description and you should refer to the official Medplum documentation for more information: https://docs.medplum.com/

### Configuration and startup:
- The container conditionally loads configuration based on the presence of `MEDPLUM_CONFIG_PATH`:
    - If `MEDPLUM_CONFIG_PATH` is set, it runs with `file:$MEDPLUM_CONFIG_PATH`
    - Otherwise, it runs with environment-based configuration (`env` mode)
- A volume mounts the config file path: `${MEDPLUM_CONFIG_PATH:-./medplum.config.json}:/usr/src/medplum/packages/server/medplum.config.json`

### Key environment variables:
- Core server settings:
    - `MEDPLUM_PORT` - port for the Medplum server
    - `MEDPLUM_BASE_URL` – base URL for the Medplum server
    - `MEDPLUM_STORAGE_BASE_URL` – base URL for binary storage access
    - (optional) `MEDPLUM_APP_BASE_URL` – points to an exposed `medplum-app` service (e.g. `http://localhost:3001/`)
- Database:
    - `MEDPLUM_DATABASE_HOST` - hostname of the PostgreSQL service (`medplum-postgres`)
    - `MEDPLUM_DATABASE_PORT` - port of the PostgreSQL exposed on service
    - `MEDPLUM_DATABASE_DBNAME` - name of the Medplum database (set as `medplum`)
    - `MEDPLUM_DATABASE_USERNAME` - database user for Medplum
    - `MEDPLUM_DATABASE_PASSWORD` - password for the Medplum database user
- Redis:
    - `MEDPLUM_REDIS_HOST=medplum-redis` - hostname of the Redis service (`medplum-redis`)
    - `MEDPLUM_REDIS_PORT` - port used by Redis service
    - `MEDPLUM_REDIS_PASSWORD` - password for the Redis service
- Storage and security:
    - `MEDPLUM_BINARY_STORAGE=file:./binary/` – local file system storage for binaries
    - `MEDPLUM_SIGNING_KEY_ID` / `MEDPLUM_SIGNING_KEY` / `MEDPLUM_SIGNING_KEY_PASSPHRASE` – used for JWT signing
- Misc:
    - `MEDPLUM_SUPPORT_EMAIL` – official support email address to medplum team
    - `MEDPLUM_GOOGLE_CLIENT_ID` / `MEDPLUM_GOOGLE_CLIENT_SECRET` – for Google OAuth login
    - `MEDPLUM_RECAPTCHA_SITE_KEY` / `MEDPLUM_RECAPTCHA_SECRET_KEY` – for reCAPTCHA protection
    - `MEDPLUM_ADMIN_CLIENT_ID` - client ID for the admin app
    - `MEDPLUM_MAX_JSON_SIZE` / `MEDPLUM_MAX_BATCH_SIZE` - limits for requests
- Bot-related (if you plan to use Medplum bots):
    - `MEDPLUM_BOT_LAMBDA_ROLE_ARN` / `MEDPLUM_BOT_LAMBDA_LAYER_NAME` - AWS Lambda role and layer for bot execution
    - `MEDPLUM_VM_CONTEXT_BOTS_ENABLED` / `MEDPLUM_DEFAULT_BOT_RUNTIME_VERSION` - enable bots and set default runtime version
- Other:
    - `MEDPLUM_ALLOWED_ORIGINS=*` (set to a restricted list for production) – CORS allowed origins
    - `MEDPLUM_INTROSPECTION_ENABLED=true` – enables OAuth token introspection endpoint
    - `MEDPLUM_SHUTDOWN_TIMEOUT_MILLISECONDS=30000` – graceful shutdown timeout

## tb-postgres
Uses the official PostgreSQL image `postgres:16`. It creates a database named `thingsboard` with the password provided via environment variables. The default user is `postgres` (since `POSTGRES_USER` is not set)

### Ports:
- `expose: - "5432"` – exposes port `5432` to other services in the Docker network

### Environment variables:
- `POSTGRES_DB: thingsboard` – name of the database to create
- `POSTGRES_PASSWORD: ${TB_DB_PASSWORD}` – password for the default `postgres` user

## medplum-postgres
Uses the official PostgreSQL image `postgres:16`. Provides the database for the Medplum server.

### Ports:
- `expose: - "5432"` – exposes port `5432` to other services in the Docker network

### Environment variables:
- `POSTGRES_USER` – database user for Medplum
- `POSTGRES_PASSWORD` – password for the Medplum user
- `POSTGRES_DB: medplum` – name of the database to create. Set as `medplum`

### Command (official command created by Medplum team):
- `listen_addresses=*` – accepts connections on all interfaces (Docker network)
- `statement_timeout=60000` – statement timeout set to 60s
- `default_transaction_isolation=REPEATABLE READ` – transaction isolation level

## medplum-redis
Uses the official Redis image `redis:7`. Provides caching and message brokering for Medplum.
> [!IMPORTANT]
> Not configured and not used as for now, but included for future use.

### Command (official command created by Medplum team):
- `redis-server --requirepass medplum` – enables password authentication with password `medplum`

## medplum-app
Uses the official Medplum App image `medplum/medplum-app:latest
> [!IMPORTANT]
> Used for easier development and testing of Medplum server, to be removed in the future.
> Available at `http://localhost:3001/` 
