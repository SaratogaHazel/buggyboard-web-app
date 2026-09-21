# User Story

As a BuggyBoard user,
I want every bug to record who created it,
So that I can tell who reported an issue even after ownership changes.


# Bug Creator

- Each bug has a **Creator** field.
- The creator is the **username of the user who was logged in when the bug was created**.
- The creator is set automatically by the app when the bug is created. The user does not type it.
- The creator **cannot be edited** after creation, by anyone, through any UI or API path.
- The creator is stored in the database alongside the other bug fields.
- Creator is distinct from Owner. Owner defaults to the current user but may be changed; Creator never changes.


# Design

## Board table

- The board table gains a **Creator** column.
- Column order from left to right is: ID, Severity, Title, Owner, **Creator**.
- The Creator column is sortable like the other columns (alphabetical ascending and descending), following `specs/features/10-sort-board-columns.md`.
- Search continues to match on Title only.

## New Bug modal

- The New Bug modal does **not** show a Creator field, like ID and State. The app fills it in on save.

## Edit Bug modal

- The Edit Bug modal shows the bug's Creator as a **read-only** field, styled the same as the read-only ID field.
- The Creator field is placed directly after the Owner field, mirroring the table order.
- Because Creator cannot change, it does not participate in the modal's "has changes" check.

## API and service

- `POST /api/bugs` accepts a `creator` string in the request body. The frontend sends the logged-in username from its auth context.
- A blank or missing `creator` is a validation error (`400`, `blank_creator`), like the other required fields.
- `PUT /api/bugs/:id` **ignores** any `creator` value in the body. The stored creator is preserved.
- `GET /api/bugs` and `GET /api/bugs/:id` include `creator` in each bug.

## Database

- The `bugs` table gains a `creator TEXT NOT NULL` column.
- Per `specs/engineering/tech-stack.md` there are no migrations. The `CREATE TABLE IF NOT EXISTS` statement is updated, and an existing `backend/data/buggyboard.db` must be deleted so a fresh table is created.


# Decision: how the backend learns the current user

BuggyBoard has no server-side sessions or tokens; login state lives only in the browser (see `frontend/src/auth.tsx`). The backend therefore cannot derive the current user on its own. For this feature the **frontend sends the logged-in username as `creator`** in the create request, and the backend treats it as required input and stores it verbatim. This is acceptable for a teaching app and keeps the stack simple. If real authentication is ever added, the backend should take the creator from the authenticated session instead and stop trusting the body.


# Out of Scope

- Displaying the creator in the New Bug modal.
- Filtering the board by creator.
- Historical backfill of creator for bugs created before this feature.


# Acceptance Criteria

Scenario: New bug records the current user as creator
  Given the user is authenticated into the app as "buggy"
  And the user is on the board page
  When the user creates a new bug via the New Bug modal
  Then the bug is saved with creator "buggy"

Scenario: New Bug modal does not show a Creator field
  Given the user is authenticated into the app
  And the user is on the board page
  When the user opens the New Bug modal
  Then the modal shows fields for Title, Severity, Owner, and Description
  And the modal does not show a Creator field

Scenario: Board table shows the Creator column to the right of Owner
  Given the user is authenticated into the app
  And there are bugs in the database
  When the user is on the board page
  Then the table has a column for Creator
  And the columns are ordered from left to right: ID, Severity, Title, Owner, Creator

Scenario: Board rows display each bug's creator
  Given the user is authenticated into the app
  And there is a bug in the database created by "vanny"
  When the user is on the board page
  Then that bug's row shows "vanny" in the Creator column

Scenario: Creator column is sortable
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database with different creators
  When the user clicks the Creator column header
  Then the Creator column header shows the ascending sort indicator
  And the bugs are displayed in ascending alphabetical order by creator

Scenario: Edit Bug modal shows creator as read-only
  Given the user is authenticated into the app
  And the user is on the board page
  And there is a bug in the database created by "vanny"
  When the user opens the edit modal for that bug
  Then the modal displays "vanny" in a read-only Creator field
  And the Creator field cannot be typed into

Scenario: Creator is unchanged after editing other fields
  Given the user is authenticated into the app as "buggy"
  And there is a bug in the database created by "vanny"
  When the user edits that bug's title and saves
  Then the bug's creator is still "vanny"

Scenario: API ignores creator on update
  Given a bug exists in the database created by "vanny"
  When a PUT request to /api/bugs/:id includes creator "buggy"
  Then the response bug has creator "vanny"
  And the stored bug still has creator "vanny"

Scenario: API rejects a new bug with a blank creator
  Given the API is running
  When a POST request to /api/bugs has a blank creator
  Then the response status is 400
  And the response error is "blank_creator"
