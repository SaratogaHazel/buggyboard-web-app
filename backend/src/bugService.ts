import { db } from "./db.js";

/** Severity is stored in the database as HIGH, MID, LOW. */
export type Severity = "HIGH" | "MID" | "LOW";

/** State is stored in the database as OPEN, CLOSED. */
export type BugState = "OPEN" | "CLOSED";

export interface BugInput {
  title: string;
  /** Severity (accepts "high"/"mid"/"low" or "HIGH"/"MID"/"LOW"; stored as uppercase). */
  severity: string;
  owner: string;
  description: string;
}

export interface CreateBugInput extends BugInput {
  /** Username of the logged-in user creating the bug. Set once; never editable. */
  creator: string;
}

export interface Bug extends BugInput {
  id: number;
  severity: Severity;
  state: BugState;
  creator: string;
}

export type CreateBugResult =
  | { success: true; bug: Bug }
  | {
      success: false;
      code:
        | "BLANK_TITLE"
        | "BLANK_SEVERITY"
        | "BLANK_OWNER"
        | "BLANK_DESCRIPTION"
        | "BLANK_CREATOR"
        | "INVALID_SEVERITY";
    };

export interface UpdateBugInput extends BugInput {
  /** State (accepts "open"/"closed" or "OPEN"/"CLOSED"; stored as uppercase). */
  state: string;
}

export type UpdateBugResult =
  | { success: true; bug: Bug }
  | { success: false; code: "NOT_FOUND" }
  | {
      success: false;
      code: "BLANK_TITLE" | "BLANK_SEVERITY" | "BLANK_OWNER" | "BLANK_DESCRIPTION" | "INVALID_SEVERITY" | "INVALID_STATE";
    };

interface BugRow {
  id: number;
  title: string;
  severity: string;
  owner: string;
  description: string;
  state: string;
  creator: string;
}

const BUG_COLUMNS = "id, title, severity, owner, description, state, creator";

const SEVERITIES: Severity[] = ["HIGH", "MID", "LOW"];
const BUG_STATES: BugState[] = ["OPEN", "CLOSED"];

function normalizeSeverity(s: string): Severity | null {
  const u = s.trim().toUpperCase();
  return SEVERITIES.includes(u as Severity) ? (u as Severity) : null;
}

function normalizeState(s: string): BugState | null {
  const u = s.trim().toUpperCase();
  return BUG_STATES.includes(u as BugState) ? (u as BugState) : null;
}

function rowToBug(row: BugRow): Bug {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity as Severity,
    owner: row.owner,
    description: row.description,
    state: row.state as BugState,
    creator: row.creator,
  };
}

/**
 * Create a bug. Validates required fields; ID is set by the database. Severity is stored as HIGH, MID, LOW.
 * The creator is recorded once and cannot be changed later.
 */
export function createBug(input: CreateBugInput): CreateBugResult {
  const title = input.title.trim();
  const owner = input.owner.trim();
  const description = input.description.trim();
  const creator = input.creator.trim();
  const severity = normalizeSeverity(input.severity);

  if (title === "") return { success: false, code: "BLANK_TITLE" };
  if (severity === null) return { success: false, code: "INVALID_SEVERITY" };
  if (owner === "") return { success: false, code: "BLANK_OWNER" };
  if (description === "") return { success: false, code: "BLANK_DESCRIPTION" };
  if (creator === "") return { success: false, code: "BLANK_CREATOR" };

  const stmt = db.prepare(
    `INSERT INTO bugs (title, severity, owner, description, state, creator) VALUES (?, ?, ?, ?, 'OPEN', ?)`
  );
  const result = stmt.run(title, severity, owner, description, creator);
  const id = result.lastInsertRowid as number;

  const bug: Bug = { id, title, severity, owner, description, state: "OPEN", creator };
  return { success: true, bug };
}

/**
 * Return a single bug by id, or null if not found.
 */
export function getBug(id: number): Bug | null {
  const row = db.prepare(`SELECT ${BUG_COLUMNS} FROM bugs WHERE id = ?`).get(id) as BugRow | undefined;
  if (!row) return null;
  return rowToBug(row);
}

/**
 * Update an existing bug. Validates required fields and state. Returns NOT_FOUND if the bug does not exist.
 * The creator is never updated; the stored value is preserved.
 */
export function updateBug(id: number, input: UpdateBugInput): UpdateBugResult {
  const existing = getBug(id);
  if (!existing) return { success: false, code: "NOT_FOUND" };

  const title = input.title.trim();
  const owner = input.owner.trim();
  const description = input.description.trim();
  const severity = normalizeSeverity(input.severity);
  const state = normalizeState(input.state);

  if (title === "") return { success: false, code: "BLANK_TITLE" };
  if (severity === null) return { success: false, code: "INVALID_SEVERITY" };
  if (owner === "") return { success: false, code: "BLANK_OWNER" };
  if (description === "") return { success: false, code: "BLANK_DESCRIPTION" };
  if (state === null) return { success: false, code: "INVALID_STATE" };

  db.prepare(
    "UPDATE bugs SET title = ?, severity = ?, owner = ?, description = ?, state = ? WHERE id = ?"
  ).run(title, severity, owner, description, state, id);

  const bug: Bug = { id, title, severity, owner, description, state, creator: existing.creator };
  return { success: true, bug };
}

/**
 * Delete a bug by id. Returns NOT_FOUND if the bug does not exist.
 */
export function deleteBug(id: number): { success: true } | { success: false; code: "NOT_FOUND" } {
  const existing = getBug(id);
  if (!existing) return { success: false, code: "NOT_FOUND" };
  db.prepare("DELETE FROM bugs WHERE id = ?").run(id);
  return { success: true };
}

/**
 * Return all bugs from the database, in table order (e.g. by id).
 */
export function listBugs(): Bug[] {
  const rows = db.prepare(`SELECT ${BUG_COLUMNS} FROM bugs ORDER BY id`).all() as BugRow[];
  return rows.map(rowToBug);
}
