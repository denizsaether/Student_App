// formattterer timer og minutter
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

export function minutesToHoursText(minutes: number, decimals = 2): string {
  return (minutes / 60).toFixed(decimals);
}