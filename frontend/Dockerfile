# syntax=docker/dockerfile:1

# ---- Build stage: install deps and produce the static production build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables into the JS bundle at build time (they are
# not readable at container runtime), so they have to arrive as build args
# here rather than as normal `environment:` entries in docker-compose.yml.
ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_STRIPE_PUBLISHABLE_KEY=pk_test_
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# ---- Runtime stage: serve the static build with nginx ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
