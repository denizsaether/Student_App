import type { Subject, LogEntry } from "./types";

const SUBJECTS_KEY = "subjects";
const LOGS_KEY = "logs";

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Subject[];

    return parsed.map((s) => ({
      ...s,
      weeklyGoal: Number(s.weeklyGoal ?? 0),
      isArchived: Boolean(s.isArchived ?? false),
    }));
  } catch {
    return [];
  }
}

export function saveSubjects(subjects: Subject[]): void {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
}

export function loadLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

export function saveLogs(logs: LogEntry[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}
