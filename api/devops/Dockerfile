# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -q

COPY src/ src/
RUN mvn package -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:21-jre

ARG APP_VERSION
LABEL org.opencontainers.image.version=$APP_VERSION

WORKDIR /app

COPY --from=build /app/target/pos-manager-*.jar /app/pos-manager.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/pos-manager.jar"]
