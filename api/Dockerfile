# Use an official Eclipse Temurin image for Java 22
FROM eclipse-temurin:22-jre


# Set the working directory in the container
WORKDIR /app

# Copy the jar file into the container
COPY target/MyStoreManagerAPI-1.0.0-SNAPSHOT.jar /app/MyStoreManagerAPI-1.0.0-SNAPSHOT.jar

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app/MyStoreManagerAPI-1.0.0-SNAPSHOT.jar"]
