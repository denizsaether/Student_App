// sjekker om datoen er i denne uken (mandag - søndag)
export function isDateInThisWeek(dateISO: string): boolean {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();

  // Finn mandag denne uken (mandag–søndag)
  const startOfWeek = new Date(now);
  const day = now.getDay(); // 0 = søndag, 1 = mandag, ...
  const diffToMonday = (day + 6) % 7;

  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - diffToMonday);

  const startOfNextWeek = new Date(startOfWeek);
  startOfNextWeek.setDate(startOfWeek.getDate() + 7);

  return d >= startOfWeek && d < startOfNextWeek;
}
