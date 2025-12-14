//streak beregning
import type { LogEntry } from "../types";

function getLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calculateDailyStreak(logs: LogEntry[]): number {
  if (logs.length === 0) return 0;

  const daysWithLogs = new Set(
    logs.map((l) => getLocalDateKey(new Date(l.createdAtISO)))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = getLocalDateKey(cursor);
    if (!daysWithLogs.has(key)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}