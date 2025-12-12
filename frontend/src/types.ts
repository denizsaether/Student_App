export interface Subject {
  id: number;
  name: string;
  weeklyGoal: number; // timer per uke
}

export interface LogEntry {
  id: number;
  subjectId: number;
  durationMinutes: number;
  createdAtISO: string;
  createdAt: string; // valgfritt (pen tekst), kan fjernes senere
}