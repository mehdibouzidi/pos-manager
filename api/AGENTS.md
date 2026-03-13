# Repository Guidelines

## Project Structure & Module Organization
- Source code: `src/main/java/com/catering/manager/api/**` (layers: `controller`, `service/impl` + `service/inter`, `repository`, `model`, `payload`, `criteria`, `mapper`, `util`).
- Configuration & assets: `src/main/resources/` (Liquibase under `db/changelog/**`, logging `logback.xml`, `application.properties`).
- Tests: `src/test/java/**`.
- Build & CI: `pom.xml`, `mvnw*`, `Dockerfile`, `Jenkinsfile`.

## Build, Test, and Development Commands
- `./mvnw clean verify`: Compile, run tests, and validate the build.
- `./mvnw spring-boot:run`: Run the API locally on `:8080` (overrides via env/profile).
- `./mvnw -DskipTests package`: Build JAR at `target/MyStoreManagerAPI-<version>.jar`.
- Docker: `docker build -t mystore-manager-api:2.3.0 .` then `docker run -p 8080:8080 mystore-manager-api:2.3.0`.

## Coding Style & Naming Conventions
- Java 22, Spring Boot 3.3; prefer 4-space indentation, braces on same line, avoid wildcard imports.
- Packages: lowercase; classes: `PascalCase`.
- Common suffixes: `Entity`, `Repository`, `Controller`, `Service`, `Payload`, `Criteria`, `Mapper`. Interfaces often prefixed `I` (e.g., `IUserService`).
- Use Lombok where present (`@Getter`, `@Setter`, etc.). Keep DTOs/payloads lean and validated.

## Testing Guidelines
- Framework: JUnit 5 via `spring-boot-starter-test`.
- Location & naming: `src/test/java/**`, classes end with `*Tests` (e.g., `MyStoreManagerAPIApplicationTests`).
- Run: `./mvnw test`. Favor `@SpringBootTest` for integration; unit-test services/mappers.
- Coverage: none enforced; add tests alongside new features and Liquibase-impacting changes.

## Commit & Pull Request Guidelines
- Conventional Commits in history (e.g., `feat:`, `fix:`, `chore:`, `refactor:`). Example: `feat: add file fields to customer orders`.
- PRs must include: clear description, linked issues, summary of DB/Liquibase changes (paths under `src/main/resources/db/changelog/**`), test notes, and any breaking changes.

## Security & Configuration Tips
- Do not commit real secrets. Prefer env vars (e.g., `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `APP_JWTSECRET`) or profiles.
- Keep Liquibase changesets atomic and update `db/changelog/master_changelog.xml` when adding new files.
