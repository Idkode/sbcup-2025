FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /app

# Copy the pom.xml and download dependencies (helps caching dependencies)
COPY pom.xml .

# Download dependencies (this step will be cached if unchanged)
RUN mvn dependency:go-offline

# Copy the rest of the application code
COPY src/ /app/src/

# Build the application (this will package the JAR file)
RUN mvn clean package -DskipTests


FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

CMD ["java", "-jar", "app.jar"]

LABEL image.name="monitoring-backend"

EXPOSE 8080