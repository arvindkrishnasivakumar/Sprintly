# Sprintly architecture

## Plan

1. Establish the relational schema and shared validation.
2. Add credential authentication and team-scoped authorization.
3. Implement teams and owner-managed membership, projects, and sprints.
4. Implement task creation/editing, Kanban moves, and sprint metrics.
5. Validate types, production build, and database-backed user journeys.

## Design

One Next.js App Router application owns rendering and server actions. PostgreSQL is the source of truth, accessed through Prisma. Auth.js uses credentials with scrypt password hashes and signed JWT sessions. Protected layouts redirect anonymous visitors. Every data read and write checks membership independently; nested routes verify the sprint belongs to the requested project. Owners may add already-registered users by email. All members may manage project work.

Dates are UTC calendar dates. Overdue means an unfinished task due before today. Days remaining includes the end date, and never falls below zero. Sprint dates must be ordered. Assignees must belong to the team. Status changes are validated on the server. The MVP allows multiple active sprints.

## Folder structure

```
src/
  app/
    login/
    api/auth/[...nextauth]/
    (workspace)/
      dashboard/
      teams/[teamId]/
      projects/[projectId]/
        sprints/[sprintId]/
  components/       # forms, sidebar, Kanban
  lib/              # database, auth, permissions, actions, validation, metrics
  types/            # Auth.js session augmentation
prisma/             # schema and SQL migrations
tests/              # business rules and integration coverage
docs/
```

## Operational boundaries

Use HTTPS, a strong AUTH_SECRET, pooled PostgreSQL connections, database backups, and migrations during deployment. Password recovery and email verification are outside the MVP; owners add existing accounts only. Authentication attempts are throttled with database-backed counters shared across instances. Do not log credentials. JWT sessions expire after seven days.

## Future work (not implemented)

GitHub integration, pull request tracking, AI sprint summaries, sprint health scoring, and risk detection can be added later behind explicit product and permission boundaries. No GitHub tokens or AI services are used by this application.
