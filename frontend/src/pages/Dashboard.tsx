import type { Subject, LogEntry } from "../types";
import { isDateInThisWeek } from "../utils/date";
import { minutesToHours } from "../utils/format";

interface DashboardProps {
  subjects: Subject[];
  logs: LogEntry[];
}

// Hjelpefunksjon: sjekk om en ISO-dato er i denne uken (mandag–søndag)
function isThisWeek(dateISO: string): boolean {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();

  // Finn mandag denne uken
  const startOfWeek = new Date(now);
  const day = now.getDay(); // 0 = søndag, 1 = mandag, ...
  const diffToMonday = (day + 6) % 7; // gjør mandag til start
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - diffToMonday);

  const startOfNextWeek = new Date(startOfWeek);
  startOfNextWeek.setDate(startOfWeek.getDate() + 7);

  return d >= startOfWeek && d < startOfNextWeek;
}

function Dashboard({ subjects, logs }: DashboardProps) {
  // Bare økter denne uken
  const logsThisWeek = logs.filter((log) => isDateInThisWeek(log.createdAtISO));

  // Totale MINUTTER denne uken
  const totalMinutes = logsThisWeek.reduce(
    (sum, log) => sum + log.durationMinutes,
    0
  );

  // Totale TIMER denne uken (kun for visning/prosent)
  const totalHours = minutesToHours(totalMinutes);

  // Samlet ukesmål (i TIMER)
  const totalWeeklyGoal = subjects.reduce(
    (sum, subject) => sum + subject.weeklyGoal,
    0
  );

  const overallProgressPercent =
    totalWeeklyGoal > 0 ? Math.min(100, (totalHours / totalWeeklyGoal) * 100) : 0;

  // Stats per fag (denne uken)
  const subjectStats = subjects.map((subject) => {
    const minutesForSubject = logsThisWeek
      .filter((log) => log.subjectId === subject.id)
      .reduce((sum, log) => sum + log.durationMinutes, 0);

    const hoursForSubject = minutesToHours(minutesForSubject);

    const progressPercent =
      subject.weeklyGoal > 0
        ? Math.min(100, (hoursForSubject / subject.weeklyGoal) * 100)
        : 0;

    return {
      ...subject,
      hoursForSubject,
      progressPercent,
    };
  });

  const topSubject =
    subjectStats.length > 0
      ? subjectStats.reduce((best, current) =>
          current.hoursForSubject > best.hoursForSubject ? current : best
        )
      : null;

  const activeSubjects = subjects.length;
  const avgHoursPerSubject =
    activeSubjects > 0 ? totalHours / activeSubjects : 0;

  const hasData = totalMinutes > 0;

  let statusText = "La oss bygge litt momentum.";
  if (overallProgressPercent >= 100) {
    statusText = "Du har nådd ukesmålet ditt 💪";
  } else if (overallProgressPercent >= 60) {
    statusText = "Sterk innsats så langt!";
  } else if (overallProgressPercent > 0) {
    statusText = "Du er i gang – hold flyten!";
  }

  return (
    <div className="min-h-screen px-6 pb-24 pt-6 text-gray-100 bg-gradient-to-b from-[#050509] to-[#15171a]">
      {/* Hero-kort */}
      <section className="mb-6 rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 shadow-xl shadow-blue-500/10">
        <div className="rounded-2xl bg-[#050509] px-4 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
            Clocked In
          </p>
          <h1 className="text-2xl font-semibold mb-1">
            {hasData ? "Fin progresjon ⚡️" : "Klar for en produktiv uke?"}
          </h1>
          <p className="text-sm text-gray-300 mb-4">{statusText}</p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Totalt logget (denne uken)
              </p>
              <p className="text-2xl font-bold text-blue-400">
                {totalHours.toFixed(1)}{" "}
                <span className="text-sm font-normal text-gray-300">timer</span>
              </p>
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Fremgang mot mål</span>
                <span>
                  {totalWeeklyGoal > 0
                    ? `${overallProgressPercent.toFixed(0)}%`
                    : "Ingen mål satt"}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[#14141c] overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 transition-all"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Små stat-kort */}
      <section className="mb-6 grid grid-cols-3 gap-3 text-xs">
        <div className="bg-[#15171f] border border-[#232635] rounded-xl p-3 flex flex-col justify-between">
          <span className="text-gray-400 mb-1">Fag</span>
          <span className="text-lg font-semibold">{activeSubjects}</span>
        </div>
        <div className="bg-[#15171f] border border-[#232635] rounded-xl p-3 flex flex-col justify-between">
          <span className="text-gray-400 mb-1">Snitt / fag (uke)</span>
          <span className="text-lg font-semibold">
            {avgHoursPerSubject.toFixed(1)}
          </span>
        </div>
        <div className="bg-[#15171f] border border-[#232635] rounded-xl p-3 flex flex-col justify-between">
          <span className="text-gray-400 mb-1">Økter (uke)</span>
          <span className="text-lg font-semibold">{logsThisWeek.length}</span>
        </div>
      </section>

      {/* Mest jobbet fag */}
      {topSubject && (
        <section className="mb-6 bg-[#11121a] border border-[#26293a] rounded-xl p-4 shadow-md shadow-black/30">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 mb-1">
            Mest jobbet fag (denne uken)
          </p>
          <p className="text-lg font-semibold mb-1">{topSubject.name}</p>
          <p className="text-sm text-gray-400 mb-2">
            {topSubject.hoursForSubject.toFixed(1)} t logget.
          </p>
          <div className="w-full h-2 rounded-full bg-[#14141c] overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${Math.min(topSubject.progressPercent, 100)}%` }}
            />
          </div>
        </section>
      )}

      {/* Fremgang per fag */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Fremgang per fag (uke)</h2>

        {subjects.length === 0 ? (
          <p className="text-sm text-gray-400">
            Du har ikke lagt til noen fag ennå. Gå til{" "}
            <span className="font-semibold">Fag</span>-siden for å komme i gang.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {subjectStats.map((subject) => {
              const pct = subject.progressPercent;

              let barColor = "from-blue-500 to-purple-500";
              if (pct >= 100) {
                barColor = "from-emerald-400 to-emerald-600";
              } else if (pct < 40 && pct > 0) {
                barColor = "from-amber-400 to-red-500";
              }

              return (
                <div
                  key={subject.id}
                  className="bg-[#15171f] border border-[#232635] rounded-xl p-4 shadow-md shadow-black/25"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold">{subject.name}</h3>
                    <span className="text-[11px] text-gray-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">
                    {subject.hoursForSubject.toFixed(1)} t logget denne uken
                    {subject.weeklyGoal > 0 && ` • mål ${subject.weeklyGoal} t`}
                  </p>

                  <div className="w-full h-2 rounded-full bg-[#101018] overflow-hidden mb-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${barColor} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-400">
                      {pct >= 100
                        ? "Mål nådd 🎯"
                        : pct >= 60
                        ? "God flyt"
                        : pct > 0
                        ? "På vei"
                        : "Ikke startet"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;