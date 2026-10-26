# Jira and GitHub delivery workflow

Jira site: https://uce-team-ixwj9gch.atlassian.net
Project: Progra web (KAN)
Repository: https://github.com/stevenjm10/Progra-Web

## Delivery tasks

| Key | Deliverable |
| --- | --- |
| KAN-1 | Deploy Progra Web to AWS Academy; parent delivery task |
| KAN-2 | Connect GitHub development activity to Jira |
| KAN-3 | Configure and validate the dev-test-main workflow |
| KAN-4 | Prepare the AWS Academy runtime |
| KAN-5 | Configure PostgreSQL and cloud application settings |
| KAN-6 | Deploy both pages and collect grading evidence |

Each issue is at https://uce-team-ixwj9gch.atlassian.net/browse/KEY with KEY replaced by its real issue key.

## Two independent connections

The Atlassian connector allows the assistant to create and update tasks. It does not automatically install GitHub for Atlassian or synchronize repository activity.

For automatic development information, a site administrator must open Jira Apps / Explore more apps, find **GitHub for Atlassian** (previously GitHub for Jira), connect the GitHub account and authorize only **stevenjm10/Progra-Web**. Verify an actual keyed PR appears in a Jira issue's Development panel before marking KAN-2 complete.

Include a real Jira key in commit messages and PR titles, for example `KAN-3 Configure automated validation`. Jira assigns the keys; never invent them. Keep the fixed test and main branch names, and add the issue key to the commit/PR rather than renaming those branches. Linking a PR URL in a Jira comment is a useful manual reference but is not proof of automatic synchronization.

## Board workflow

- To Do: agreed task, acceptance criteria and evidence still pending.
- In Progress: implementation is underway.
- In Review: a PR is open and waiting for checks/review.
- Done: acceptance criteria and evidence are verified. A merged PR alone does not mean AWS is deployed.

## Git workflow and CI

Work in local dev, commit changes, merge to test and push test. The Validate projects workflow runs Java endpoint tests and both browser E2E suites on test/main pushes and PRs targeting those branches. CI uses its own disposable PostgreSQL database, never the student's local database. Character tests mock API responses to avoid relying on external service availability. Live API and MCP checks remain explicit separate checks.

Open a test-to-main PR with its Jira key and review the checks. The Release path job rejects PRs targeting main from any branch other than this repository's test. Main branch protection is configured to require a pull request, an up-to-date branch and all three checks: Release path, Java and dish UI, Character UI. Force pushes and branch deletion are disabled. No separate approving reviewer is required because this is an individual project; merging remains a manual action.

No automatic merge or AWS deployment is configured. Actual cloud provisioning, lab access, environment settings, database access and external URLs must be confirmed separately. Keep AWS credentials out of source code and Jira comments.

References:
- https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/
- https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers
- https://playwright.dev/docs/ci-intro
