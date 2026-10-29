# AWS API Gateway deployment

API ID: `qw2e208u9g` (us-east-1)
Endpoint: https://qw2e208u9g.execute-api.us-east-1.amazonaws.com
Jira: KAN-11

An HTTP API with a default proxy route forwards requests to the public EC2 Nginx endpoint. Page 1 is at /, Page 2 at /pagina2/, and CRUD at /api/dishes. The default stage auto-deploys. Java and PostgreSQL ports remain unpublished.

HTTPS protects the browser-to-gateway connection. The gateway-to-EC2 connection currently uses HTTP port 80. This public integration does not make EC2 private and adds no authentication to the CRUD. A private integration with VPC Link/load balancer is a separate deployment.

## EC2 address changes

If the lab changes the EC2 public address, update the existing integration; do not create another API:

```bash
aws apigatewayv2 get-integrations --api-id qw2e208u9g --region us-east-1
aws apigatewayv2 update-integration --api-id qw2e208u9g --integration-id INTEGRATION_ID --integration-uri http://NEW_PUBLIC_IP --region us-east-1
```

Use current temporary AWS Academy credentials outside Git. The instance and lab must remain active.

## Verification

On deployment, HTTPS GET requests to /, /pagina2/, /pagina2/characters.js and /api/dishes returned 200. The API returned 10 dishes. A temporary dish was created, updated, read and deleted through the gateway, leaving existing data intact.

## Removal

To remove this gateway while retaining EC2 and the database:

```bash
aws apigatewayv2 delete-api --api-id qw2e208u9g --region us-east-1
```
