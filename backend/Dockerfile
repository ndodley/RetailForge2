# syntax=docker/dockerfile:1

# ---- Build stage: compile the Spring Boot app with Maven ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy the wrapper + POM first so the dependency-download layer is cached
# separately from source changes (only invalidated when pom.xml changes).
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Now copy the rest of the source and build the jar.
COPY src ./src
RUN ./mvnw -B clean package -DskipTests

# ---- Runtime stage: just the JRE + the built jar ----
FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app

# curl is only here so the compose healthcheck can hit /actuator/health.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system spring && useradd --system --gid spring spring

COPY --from=build /app/target/*.jar app.jar

# Seed demo product/avatar images baked into the repo. app.media.root
# (see application.properties) points here via APP_MEDIA_ROOT. When this
# path is mounted as a named volume (see docker-compose.yml), Docker copies
# this seed content into the empty volume on first run only, so uploads
# made later persist across restarts instead of being reset.
COPY media ./media

RUN chown -R spring:spring /app
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
