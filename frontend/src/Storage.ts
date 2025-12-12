import type { Subject, LogEntry } from "./types";

const SUBJECTS_KEY = "clockedin_subjects_v1";
const LOGS_KEY = "clockedin_logs_v1";

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Subject[];
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