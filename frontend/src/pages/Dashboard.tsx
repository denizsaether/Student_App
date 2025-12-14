import type { Subject, LogEntry } from "../types";
import { calculateDailyStreak } from "../utils/streak";
import { isDateInThisWeek } from "../utils/date";
import { minutesToHours } from "../utils/format";
import { useMemo, useState } from "react";

interface DashboardProps {
  subjects: Subject[];
  logs: LogEntry[];
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildWeekStrip(logs: LogEntry[]) {
  const daySet = new Set<string>(
    logs.map((l) => toLocalDateKey(new Date(l.createdAtISO)))
  );

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay(); // 0=søn, 1=man
  const diffToMonday = (day + 6) % 7;
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - diffToMonday);

  const labels = ["M", "T", "O", "T", "F", "L", "S"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = toLocalDateKey(d);

    return {
      key,
      label: labels[i],
      isActive: daySet.has(key),
    };
  });
}

function Dashboard({ subjects, logs }: DashboardProps) {
  // ===== Uke-data =====
  const logsThisWeek = logs.filter((log) => isDateInThisWeek(log.createdAtISO));

  const totalMinutes = logsThisWeek.reduce(
    (sum, log) => sum + log.durationMinutes,
    0
  );

  const totalHours = minutesToHours(totalMinutes);

  // Samlet ukesmål (timer)
  const totalWeeklyGoal = subjects.reduce(
    (sum, subject) => sum + subject.weeklyGoal,
    0
  );

  const overallProgressPercent =
    totalWeeklyGoal > 0
      ? Math.min(100, (totalHours / totalWeeklyGoal) * 100)
      : 0;

  // ===== Stats per fag (denne uken) =====
  const subjectStats = useMemo(() => {
    return subjects.map((subject) => {
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
  }, [subjects, logsThisWeek]);

  const topSubject =
    subjectStats.length > 0
      ? subjectStats.reduce((best, current) =>
          current.hoursForSubject > best.hoursForSubject ? current : best
        )
      : null;

  const hasData = totalMinutes > 0;

  // ===== Streak + uke-strip =====
  const streak = calculateDailyStreak(logs);
  const weekStrip = buildWeekStrip(logs);

  // ===== Karusell (dots) =====
  const [subjectIndex, setSubjectIndex] = useState(0);
  // ===== touch funksjonalitet =====
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);

  const SWIPE_THRESHOLD_PX = 60;

  const carouselSubjects = useMemo(() => {
    return subjectStats
      .slice()
      .sort((a, b) => b.hoursForSubject - a.hoursForSubject);
  }, [subjectStats]);

  const safeIndex =
    carouselSubjects.length === 0
      ? 0
      : Math.min(subjectIndex, carouselSubjects.length - 1);

  const current = carouselSubjects[safeIndex] ?? null;

  const goPrev = (): void => {
    if (carouselSubjects.length === 0) return;
    setSubjectIndex((prev) =>
      prev === 0 ? carouselSubjects.length - 1 : prev - 1
    );
  };

  const goNext = (): void => {
    if (carouselSubjects.length === 0) return;
    setSubjectIndex((prev) =>
      prev === carouselSubjects.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
  const x = e.touches[0]?.clientX ?? null;
  if (x === null) return;
  setTouchStartX(x);
  setTouchDragging(true);
  setDragOffsetX(0);
};

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
  if (!touchDragging || touchStartX === null) return;
  const x = e.touches[0]?.clientX ?? null;
  if (x === null) return;
  const delta = x - touchStartX;
  setDragOffsetX(delta);
};

const handleTouchEnd = (): void => {
  if (!touchDragging || touchStartX === null) {
    setTouchDragging(false);
    setTouchStartX(null);
    setDragOffsetX(0);
    return;
  }

  if (dragOffsetX <= -SWIPE_THRESHOLD_PX) {
    // swipe left
    goNext();
  } else if (dragOffsetX >= SWIPE_THRESHOLD_PX) {
    // swipe right
    goPrev();
  }

  setTouchDragging(false);
  setTouchStartX(null);
  setDragOffsetX(0);
};

  // Status-tekst
  let statusText = "La oss bygge litt momentum.";
  if (overallProgressPercent >= 100) statusText = "Du har nådd ukesmålet ditt 💪";
  else if (overallProgressPercent >= 60) statusText = "Sterk innsats så langt!";
  else if (overallProgressPercent > 0) statusText = "Du er i gang – hold flyten!";

  return (
    <div className="min-h-screen px-5 pb-28 pt-6 text-gray-100 bg-[#050509] relative overflow-hidden">
      {/* Bakgrunnsglow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute top-40 -left-20 h-[360px] w-[360px] rounded-full bg-purple-500/18 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[380px] w-[380px] rounded-full bg-cyan-400/12 blur-[110px]" />

      <div className="relative mx-auto w-full max-w-xl">
        {/* HERO */}
        <section className="mb-6 rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 shadow-xl shadow-black/50">
          <div className="rounded-2xl bg-[#07070c]/90 backdrop-blur px-4 py-5 border border-white/5">
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

        {/* STREAK + UKE */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <div className="col-span-1 rounded-xl border border-white/5 bg-[#101018]/70 backdrop-blur p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1">
              Streak
            </p>
            <p className="text-lg font-semibold text-emerald-400">🔥 {streak}</p>
            <p className="text-xs text-gray-400 mt-1">dager på rad</p>
          </div>

          <div className="col-span-2 rounded-xl border border-white/5 bg-[#101018]/70 backdrop-blur p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Ukeoversikt
              </p>
              <p className="text-xs text-gray-400">Man–Søn</p>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekStrip.map((d) => (
                <div
                  key={d.key}
                  className={
                    "h-9 rounded-lg border flex items-center justify-center text-xs " +
                    (d.isActive
                      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                      : "bg-[#0b0b10] border-white/5 text-gray-400")
                  }
                  title={d.key}
                >
                  {d.label}
                </div>
              ))}
            </div>

            <p className="mt-2 text-[11px] text-gray-500">
              Grønne dager = minst én økt logget.
            </p>
          </div>
        </section>

        {/* TOPP FAG */}
        {topSubject && (
          <section className="mb-6 bg-[#101018]/70 border border-white/5 rounded-xl p-4 shadow-md shadow-black/30 backdrop-blur">
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

        {/* KARUSELL MED DOTS */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Fag denne uken</h2>
            <p className="text-xs text-gray-400">
              {carouselSubjects.length > 0
                ? `${safeIndex + 1}/${carouselSubjects.length}`
                : ""}
            </p>
          </div>

          {carouselSubjects.length === 0 ? (
            <p className="text-sm text-gray-400">
              Du har ikke lagt til noen fag ennå. Gå til{" "}
              <span className="font-semibold">Fag</span>-siden.
            </p>
          ) : (
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="rounded-2xl border border-white/5 bg-[#101018]/70 backdrop-blur p-4 shadow-md shadow-black/25 select-none"
              style={{
                transform: `translateX(${touchDragging ? dragOffsetX : 0}px)`,
                transition: touchDragging ? "none" : "transform 160ms ease-out",
             }}
              >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 mb-1">
                    Fremgang
                  </p>
                  <h3 className="text-lg font-semibold leading-tight">
                    {current?.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {current?.hoursForSubject.toFixed(1)} t logget denne uken
                    {current && current.weeklyGoal > 0
                      ? ` • mål ${current.weeklyGoal} t`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="h-9 w-9 rounded-full border border-white/10 bg-[#0b0b10] text-gray-200 hover:bg-[#14141c] transition"
                    aria-label="Forrige fag"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="h-9 w-9 rounded-full border border-white/10 bg-[#0b0b10] text-gray-200 hover:bg-[#14141c] transition"
                    aria-label="Neste fag"
                  >
                    ›
                  </button>
                </div>
              </div>

              {current && (
                <>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span>Mot mål</span>
                    <span>{current.progressPercent.toFixed(0)}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#14141c] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 transition-all"
                      style={{
                        width: `${Math.min(100, current.progressPercent)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    {carouselSubjects.map((_, i) => {
                      const isActive = i === safeIndex;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSubjectIndex(i)}
                          className={
                            "h-2 w-2 rounded-full transition " +
                            (isActive
                              ? "bg-white/80"
                              : "bg-white/20 hover:bg-white/35")
                          }
                          aria-label={`Gå til fag ${i + 1}`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;