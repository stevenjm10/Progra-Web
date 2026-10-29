# Architecture and deployment

This repository is a monorepo containing two independently runnable projects. Page 1 is a Spring Boot monolith: its HTTP API and dish frontend ship in one Java application. Page 2 is static HTML/CSS/JavaScript. Maven remains the Java build tool.

Nginx serves Page 2 and forwards Page 1/API requests to Java. PostgreSQL and Java have no published host ports. Local Docker uses HTTP port 80. The AWS public endpoint uses HTTPS through API Gateway.

## Optional load balancing

The default deployment runs one application instance. To demonstrate round-robin balancing between two Java instances sharing the same PostgreSQL database:

```bash
docker compose -f compose.yaml -f compose.scale.yaml up -d --build --wait
```

Nginx resolves Docker service addresses dynamically and balances the app replicas. Both instances use the same database; there is no server-side user session. Budget at least two Java heaps plus PostgreSQL and operating-system memory. This demonstrates load balancing on one host, not host-level high availability.

Return to one instance with:

```bash
docker compose up -d --scale app=1 --wait
```

## AWS deployment

The AWS deployment now uses API Gateway, a VPC Link and an internal ALB. See [AWS-GATEWAY.md](AWS-GATEWAY.md) for the network, resource IDs and update procedure. EC2 runs two Java replicas behind Nginx; the public entry point uses HTTPS.

## Review scope

The review covered CRUD input checks, safe text rendering, create/update/delete navigation, API cancellation, debounce, Compose networking, data initialization and CI. Existing deterministic tests cover browser CRUD/navigation and character API behavior. External API availability and AWS network rules remain runtime dependencies; passing local tests does not establish public AWS reachability.
