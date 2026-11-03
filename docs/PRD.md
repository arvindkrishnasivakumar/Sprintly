# Sprintly MVP

## Problem

Student engineering teams often coordinate across chats, notes, and oversized project tools. Work loses ownership, deadlines become unclear, and short delivery cycles lack a shared view of progress.

## Target users

Small student engineering teams working on course projects, hackathons, club products, and independent builds. A team owner organizes collaborators; members plan and execute together. A person may join several teams.

## MVP

- Name/email/password signup, login, logout, and protected workspaces.
- Teams with name, description, creator ownership, and membership. Owners add existing users by email.
- Team projects with name, description, status (Active, On Hold, Completed), and creation date.
- Project sprints with name, goal, start/end dates, and Planned/Active/Completed status.
- Tasks with title, description, optional team-member assignee, Low/Medium/High priority, Backlog/In Progress/Review/Done status, optional due date, and integer story points (0–100).
- Four-column Kanban with drag-and-drop and a keyboard/touch-accessible status selector. Task editing persists all fields.
- Sprint metrics: total/completed tasks, completion percentage, total/completed points, overdue unfinished tasks, and days remaining.
- Responsive minimal sidebar UI, empty/loading/error states, and server validation.

## Main journeys

1. Sign up → create team → ask teammates to sign up → add their email addresses.
2. Open team → create project → plan sprint → add and assign tasks.
3. Open sprint → move tasks → review metrics → update sprint status.

## Acceptance criteria

Data survives refreshes. Unauthorized users cannot read or change another team's resources, even through direct server-action calls. Invalid dates, status values, point totals, and cross-team assignments are rejected. Sprint URLs must match their project. Team ownership is created atomically with the team. Dashboard metrics handle empty sprints and completed/overdue tasks correctly.

## Scope limits

No email invitations, verification, password reset, member removal, deletion flows, comments, attachments, notifications, billing, or real-time multi-user sync. Changes from other sessions appear on refresh. Statuses are user-controlled; completing a sprint does not implicitly complete its tasks.

## Future features — intentionally not implemented

GitHub integration, pull request tracking, AI sprint summaries, sprint health scoring, and risk detection. These require separate product design and consent before connecting external data.
