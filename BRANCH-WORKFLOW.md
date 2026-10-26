# Branch workflow and project review

Reviewed on 2026-10-25. This document belongs to the local dev branch; main remains the approved baseline.

## Branches

- main: approved version, published on GitHub.
- test: validation branch, published on GitHub.
- dev: local development branch, intentionally not published.

All three start at the same application commit. A branch is a Git history reference, not a folder, deployment or test runner. Creating test does not run tests automatically. The Validate projects GitHub Actions workflow runs on test/main pushes and pull requests. Repository protections must require its checks to enforce them. AWS deployment is not configured.

## Daily development

Run these commands from the repository root:

```powershell
git switch dev
# Edit files, run tests and review changes.
git add .
git commit -m "Describe the change"
```

Promote a completed local change to the remote validation branch:

```powershell
git fetch origin
git switch test
git merge --ff-only origin/test
git merge --no-ff dev -m "Promote local development to testing"
git push origin test
git switch dev
```

If a merge reports conflicts, resolve them and rerun tests before publishing. Do not reset or force-push shared branches.

After validation, open a pull request on GitHub with base main and compare test:
https://github.com/stevenjm10/Progra-Web/compare/main...test

Review the diff, attach test evidence, and merge manually only after approval. If GitHub says there is nothing to compare, both branches contain the same commits; this is expected immediately after setup.

After that PR is merged:

```powershell
git fetch origin
git switch main
git merge --ff-only origin/main
git switch dev
git merge main
```

A direct GitHub PR cannot use an unpublished local dev branch. The local dev-to-test promotion uses Git; the shared test-to-main promotion uses a GitHub PR. To use PRs at both stages, dev or a feature branch must also be pushed, which differs from the requested local-only dev setup.

## Review results

The project is suitable as a basic classroom CRUD/API exercise:

- Page 1 separates controller, service, repository and model; exposes five REST operations and validates required fields and prices.
- Page 1 uses PostgreSQL with English table/column names, Spanish displayed content, separate form/list pages and immediate card filtering.
- Page 2 consumes character/location/episode resources, uses a four-second debounce, cancellation, spinner, pagination and a details dialog.
- Source code and documentation are English while visible UI text is Spanish.

Checks executed during this review:

- Page 1 Java endpoint tests: 8 passed.
- Page 1 browser E2E tests with real PostgreSQL: 3 passed, including create/update/reload/delete and cleanup of the unique temporary record.
- Page 2 deterministic browser E2E tests: 3 passed with mocked API responses. The additional live API test was skipped; MCP and live API checks were not rerun during this review.

## Remaining requirements and deployment limits

- Both frontends currently use fetch; jQuery and Axios are not integrated. If required by the assignment, implement them in dev and repeat validation before promotion.
- CI is defined in .github/workflows/validate.yml; enforce the checks using repository branch protections where supported. See JIRA-WORKFLOW.md for task links and review policy.
- Local database credentials are committed by the author's earlier explicit request for grading. Use separate environment configuration and credentials before exposing a cloud deployment.
- Write endpoints have no authentication or authorization. This is acceptable for a local demonstration, but access control or a restricted demo environment is needed before public use.
- PostgreSQL is configured on localhost; that refers to the cloud server itself after deployment, not the student's computer. AWS needs a reachable database or a local database on the instance.
- The Page 2 development server binds to 127.0.0.1. Public access requires a reverse proxy or a suitable hosting service.
- External API availability and CORS can affect live Page 2 checks; simulated tests do not prove external service availability.
- A migration SQL script is provided for the previous Spanish schema. Back up the database before applying it on another machine.

The AWS Academy screenshot identifies the intended lab environment but does not establish a running server, SSH access or deployment. No cloud resources were created or changed during this branch setup.