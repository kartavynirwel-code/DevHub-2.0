# ---------- Build Stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime Stage ----------
FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app

COPY --from=build /app/target/devhub-backend-2.0.0.jar app.jar

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["java","-jar","app.jar"]