# Use an official Eclipse Temurin image for Java 21
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/pos-manager-*.jar /app/pos-manager.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/pos-manager.jar"]
