# Architecture and deployment

This repository is a monorepo containing two independently runnable projects. Page 1 is a Spring Boot monolith: its HTTP API and dish frontend ship in one Java application. Page 2 is static HTML/CSS/JavaScript. Maven remains the Java build tool.

Nginx serves Page 2 and forwards Page 1/API requests to Java. PostgreSQL and Java have no published host ports. The browser uses HTTP port 80; HTTPS has not been configured.

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

## Deferred AWS phase

AWS API Gateway and an AWS load balancer are not provisioned by this repository. In the Academy account, confirm permitted services before choosing an ALB or API Gateway integration. API Gateway can route API traffic and apply authentication/throttling; ALB can distribute HTTP traffic across targets. Neither is required to conceal internal Docker ports: those ports are already unpublished.

Configure HTTPS and its certificate as a separate AWS delivery. HTTP URLs must begin with http:// until then. EC2 public addresses can change after stopping the instance.

## Review scope

The review covered CRUD input checks, safe text rendering, create/update/delete navigation, API cancellation, debounce, Compose networking, data initialization and CI. Existing deterministic tests cover browser CRUD/navigation and character API behavior. External API availability and AWS network rules remain runtime dependencies; passing local tests does not establish public AWS reachability.
