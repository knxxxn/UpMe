# Build stage
FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Build the application
RUN gradle bootJar -x test

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Run the jar with production profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
