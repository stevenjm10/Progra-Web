# AWS private API Gateway deployment

Public endpoint: https://qw2e208u9g.execute-api.us-east-1.amazonaws.com
Region: us-east-1. API ID: `qw2e208u9g`.

## Request path

Browser HTTPS -> API Gateway -> VPC Link -> internal Application Load Balancer -> EC2 Nginx -> two Java replicas -> PostgreSQL.

Nginx serves Page 2 at /pagina2/; Page 1 is at / and CRUD at /api/dishes. API Gateway uses its default auto-deploy stage. The ALB targets the existing EC2 instance on port 80 by instance ID. Nginx balances two Java replicas sharing the same database. This is one EC2 host, not host-level high availability.

The integration uses the ALB listener ARN rather than the public EC2 IP, so stopping/starting the same instance does not require a gateway update. Replacing the instance requires registering the replacement in the target group.

## Network

The public HTTPS endpoint terminates TLS at API Gateway. Internal hops use HTTP inside the VPC. The internal ALB accepts port 80 only from the VPC Link security group; EC2 accepts web traffic only from the ALB group. Java 8080 and PostgreSQL 5432 remain unpublished. SSH remains available under the existing SSH rule. CRUD remains public through the gateway; no application authentication has been added.

Non-secret resource IDs are recorded in docker/aws-resources.json. Temporary Academy credentials and SSH keys must stay outside Git.

## Operations

EC2 uses `COMPOSE_FILE=compose.yaml:compose.scale.yaml` in its existing .env to preserve two replicas during updates. A 1 GiB swap file supports the small lab instance. Database data uses the existing named volume.

Update from the repository on EC2:

```bash
git switch main
git pull --ff-only origin main
sudo docker compose up -d --build --wait
```

The laboratory and instance must remain running for the website to answer. ALB and VPC Link resources consume laboratory resources; remove them after the course when no longer needed. A VPC Link inactive for a long period can take time to become available again.

## Verification and cleanup

Check both pages, the API and CRUD through the public HTTPS endpoint. Confirm the ALB target is healthy and both Java replicas are healthy with Docker Compose. Preserve the database volume and backups.

To retire this deployment, remove the API integration/API, VPC Link, ALB listener/load balancer, target group and dedicated security groups in dependency order. Restore any needed direct web access before removing the gateway path. Do not delete EC2 or the database volume as part of gateway cleanup.
