export interface Subject {
  id: number; // unik identifikator
  name: string; // emnekoden
  weeklyGoal: number; // timer per uke
  isArchived?: boolean; // om faget er arkivert
}

export interface LogEntry {
  id: number; // unik identifikator
  subjectId: number; // referanse til Subject.id
  durationMinutes: number; // varighet i minutter
  createdAtISO: string; // tidspunkt for logginnslag (ISO-format)
  createdAt: string; // valgfritt (pen tekst), kan fjernes senere
}