# RF2_Prototype

RF2_Prototype is a full-stack prototype with:

- a React + TypeScript frontend built with Vite
- a Spring Boot backend
- a PostgreSQL database defined in `docker-compose.yml`

## Project structure

- `frontend/` - React application
- `backend/` - Spring Boot application
- `docs/` - project documentation
- `docker-compose.yml` - local PostgreSQL service definition
- `.env.example` - example environment values for local setup

## Frontend

The frontend uses:

- React
- TypeScript
- Vite
- React Router

Frontend source files live in `frontend/src/`.

## Backend

The backend uses:

- Spring Boot
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Flyway
- Spring Session JDBC
- PostgreSQL

Backend source files live in `backend/src/`.

## Database and environment setup

Database setup details are documented in `docs/postgres-setup.md`.

Use `.env.example` as the template for local environment values. The real `.env` file is intentionally ignored and should stay local.

## Notes

- Generated files such as `frontend/node_modules/` and `backend/target/` are ignored.
- IDE-specific files such as `.idea/` are ignored.
- This repository is set up to keep project source at the root while preserving separate frontend and backend folders.

