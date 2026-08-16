# PostgreSQL Docker setup for RetailForge2

## What this project now uses

- `docker-compose.yml` - runs PostgreSQL 18.3 in Docker with persistent storage on host port `5434`
- `.env.example` - example values for the database and datasource settings
- `backend/src/main/resources/application.properties` - backend datasource, JPA, Flyway, and session settings
- `backend/src/main/resources/db/migration/V1__create_spring_session_tables.sql` - initial Flyway migration for Spring Session tables

## Database details

- Database name: `rf2_p2`
- Default username: `rf2_user`
- Default password: `rf2_dev_password`
- Host when backend runs on your computer: `localhost`
- Port: `5434`

## How Docker ports work

The Compose file uses:

```yaml
ports:
  - "5434:5432"
```

That means:

- `5434` = the port on your Windows machine
- `5432` = the normal PostgreSQL port inside the Docker container

So your backend connects to `localhost:5434`, and Docker forwards that traffic into the container's PostgreSQL process on `5432`.

This is why the container port usually stays `5432`, even if the host port is different.

## Why `5434` is the right host port on your machine

Your machine already has:

- local PostgreSQL 17 on `5432`
- local PostgreSQL 18 on `5433`

If Docker tried to use `5432` or `5433`, it would conflict with those installed PostgreSQL servers.

Using Docker on `5434` avoids that conflict.

## Startup order

1. Start Docker Desktop.
2. From the project root, start the PostgreSQL container with Docker Compose.
3. Wait until the `postgres` service becomes healthy.
4. Start the Spring Boot backend from the `backend` folder.
5. Start the Vite frontend from the `frontend` folder.

## Why `localhost` is correct here

The backend is currently expected to run directly on your Windows machine, not inside Docker. Because the database container publishes port `5434`, the backend reaches it through `localhost:5434`.

If you later containerize the backend too, the JDBC URL should change from `localhost` to the Compose service name `postgres`.

## What Docker is doing for you

When you start the `postgres` service, Docker will:

1. download the PostgreSQL 18.3 image if it is not already on your computer
2. create a container from that image
3. create a persistent Docker volume named `postgres_data`
4. initialize the database `rf2_p2`
5. create the database user `rf2_user`
6. assign the password `rf2_dev_password`
7. expose the database to your Windows machine on port `5434`

## What the backend is doing

When the backend starts, Spring Boot will:

1. read `backend/src/main/resources/application.properties`
2. connect to `jdbc:postgresql://localhost:5434/rf2_p2`
3. log in with `rf2_user` and `rf2_dev_password`
4. run Flyway migrations from `backend/src/main/resources/db/migration`
5. use the database for persistence and Spring Session

## Important note about the Docker volume

The `postgres_data` volume stores the actual PostgreSQL data outside the container.

That means:

- restarting the container does not delete your data
- recreating the container does not delete your data if the volume is kept
- changing `POSTGRES_DB`, `POSTGRES_USER`, or `POSTGRES_PASSWORD` later may not reset an already-initialized database

If you ever want a completely fresh database, you would need to remove the old container and its volume deliberately. Do that only if you are okay with losing the stored data.

## Flyway ownership

This project already includes Flyway and Spring Session JDBC dependencies. To avoid both systems trying to create session tables, `spring.session.jdbc.initialize-schema=never` is set and Flyway owns schema creation through the migration file.

## pgAdmin connection values

In pgAdmin, create a server connection with:

- Host name/address: `localhost`
- Port: `5434`
- Maintenance database: `postgres` first, then browse the database `rf2_p2`
- Username: `rf2_user`
- Password: `rf2_dev_password`

If you are looking at the Docker database in pgAdmin, make sure you are connecting to the Docker port `5434`, not your installed PostgreSQL 18 server on `5433`.

## Can you use the same pgAdmin server entry?

Yes. In pgAdmin, the saved "server" is just a connection profile to a PostgreSQL server instance. One PostgreSQL server can contain multiple databases.

That means you can keep using the same pgAdmin server connection if it already points to the Docker PostgreSQL instance on `localhost:5434`.

What changes is the database that your Spring Boot app connects to:

- old prototype: `rf2_prototype`
- this prototype: `rf2_p2`

## If the Docker volume already exists

Because `postgres_data` is persistent, changing `POSTGRES_DB` in `docker-compose.yml` does not automatically create `rf2_p2` inside an already-initialized PostgreSQL data directory.

So if you already used this Docker-backed PostgreSQL server before, choose one of these options:

1. create a new database named `rf2_p2` manually in pgAdmin or SQL, while keeping the same server and volume
2. remove the old container and volume if you want a completely fresh PostgreSQL instance that auto-initializes `rf2_p2`

To create the database manually in pgAdmin, connect to the same server and run:

```sql
CREATE DATABASE rf2_p2;
```

Then the backend can connect to it using the updated datasource URL.

## If you want different credentials

Update the values in:

1. `docker-compose.yml` or a copied `.env`
2. `backend/src/main/resources/application.properties` or your backend environment variables
3. The pgAdmin connection you save locally

These values must always match.



