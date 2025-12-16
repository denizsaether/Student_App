import React, { useEffect, useMemo, useState } from "react";
import type { Subject, LogEntry } from "../types";
import { minutesToHoursText } from "../utils/format";

interface LogHoursProps {
  subjects: Subject[];
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

type DurationMode = "preset" | "custom";

/** Timer (string) -> minutter (int) */
function hoursInputToMinutes(hoursInput: string): number | null {
  const raw = hoursInput.trim().replace(",", ".");
  if (raw === "") return null;

  const hours = Number(raw);
  if (Number.isNaN(hours) || hours <= 0) return null;

  return Math.round(hours * 60);
}

function LogHours({ subjects, logs, setLogs }: LogHoursProps) {
  // ===== Aktivt fag-filter (arkiverte skal ikke kunne logges) =====
  const activeSubjects = useMemo(
    () => subjects.filter((s) => !(s.isArchived ?? false)),
    [subjects]
  );

  // ===== Default fag = sist loggede fag (men kun hvis aktivt) =====
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  useEffect(() => {
    if (activeSubjects.length === 0) return;
    if (selectedSubjectId) return;

    const last = logs[0];
    const fallback = String(activeSubjects[0]?.id ?? "");
    const next = last ? String(last.subjectId) : fallback;

    const exists = activeSubjects.some((s) => String(s.id) === next);
    setSelectedSubjectId(exists ? next : fallback);
  }, [activeSubjects, logs, selectedSubjectId]);

  // ===== Varighet: presets + custom =====
  const presetMinutes = [30, 45, 60, 90, 120];
  const [durationMode, setDurationMode] = useState<DurationMode>("preset");
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<number>(60);
  const [customHoursInput, setCustomHoursInput] = useState<string>("");

  // ===== Toast (2 sek) øverst =====
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showSuccessToast = (): void => {
    const messages = ["Økt logget 💪", "Bra jobba!", "Studietid registrert", "Keep going 🔥"];
    setToast(messages[Math.floor(Math.random() * messages.length)]);
  };

  const showUpdatedToast = (): void => {
    const messages = ["Oppdatert ✅", "Økt endret", "Fikset!"];
    setToast(messages[Math.floor(Math.random() * messages.length)]);
  };

  // ===== Beregninger =====
  const totalMinutesAllTime = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  }, [logs]);

  const durationMinutes: number | null = useMemo(() => {
    if (durationMode === "preset") return selectedPresetMinutes;
    return hoursInputToMinutes(customHoursInput);
  }, [durationMode, selectedPresetMinutes, customHoursInput]);

  const canSubmit =
    activeSubjects.length > 0 && Boolean(selectedSubjectId) && durationMinutes !== null;

  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Ukjent fag";
  };

  // ===== Logging =====
  const handleAddLog = (): void => {
    if (activeSubjects.length === 0) {
      alert("Du har ingen aktive fag. Gå til Fag-siden og legg til et fag (eller gjenopprett et arkivert).");
      return;
    }

    if (!selectedSubjectId) {
      alert("Velg et fag.");
      return;
    }

    if (durationMinutes === null) {
      alert("Velg en varighet (eller skriv inn egendefinert).");
      return;
    }

    // Ekstra sikkerhet: hindre logging på arkivert fag
    const chosenId = Number(selectedSubjectId);
    const stillActive = activeSubjects.some((s) => s.id === chosenId);
    if (!stillActive) {
      alert("Dette faget er arkivert. Velg et aktivt fag.");
      return;
    }

    const now = new Date();

    const newLog: LogEntry = {
      id: Date.now(),
      subjectId: chosenId,
      durationMinutes, // ✅ lagres i minutter
      createdAtISO: now.toISOString(),
      createdAt: now.toLocaleString(),
    };

    setLogs((prev) => [newLog, ...prev]);

    // UX: behold fagvalg, reset varighet
    setDurationMode("preset");
    setSelectedPresetMinutes(60);
    setCustomHoursInput("");

    showSuccessToast();
  };

  // ===== Historikk (bak knapp) =====
  const [showHistory, setShowHistory] = useState(false);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editHoursInput, setEditHoursInput] = useState<string>("");

  const handleDeleteLog = (id: number): void => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (editingLogId === id) {
      setEditingLogId(null);
      setEditHoursInput("");
    }
    setToast("Slettet.");
  };

  const handleStartEdit = (log: LogEntry): void => {
    setEditingLogId(log.id);
    setEditHoursInput(String((log.durationMinutes / 60).toFixed(2)));
  };

  const handleSaveEdit = (id: number): void => {
    const newDurationMinutes = hoursInputToMinutes(editHoursInput);
    if (newDurationMinutes === null) {
      alert("Skriv inn et gyldig antall timer (større enn 0).");
      return;
    }

    setLogs((prev) =>
      prev.map((log) =>
        log.id === id ? { ...log, durationMinutes: newDurationMinutes } : log
      )
    );

    setEditingLogId(null);
    setEditHoursInput("");
    showUpdatedToast();
  };

  const history = logs; // newest-first i appen din

  return (
    <div className="min-h-screen px-6 pb-24 pt-6 text-gray-100 bg-gradient-to-b from-[#050509] to-[#15171a] relative">
      {/* ===== Toast øverst ===== */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/12 backdrop-blur px-4 py-3 shadow-lg shadow-black/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-sm font-semibold text-emerald-100">{toast}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Logg studieøkt</h2>
        <p className="text-sm text-gray-400 mt-1">Velg fag og varighet. Ett trykk – ferdig.</p>
      </div>

      {activeSubjects.length === 0 ? (
        <div className="bg-[#1a1c1f] border border-[#2e3136] rounded-xl p-5 shadow-lg shadow-black/30">
          <p className="text-gray-300">
            Du har ingen <span className="font-semibold">aktive</span> fag akkurat nå.
            Gå til <span className="font-semibold">Fag</span>-siden og legg til et fag
            (eller gjenopprett et arkivert).
          </p>
        </div>
      ) : (
        <>
          {/* 1) Velg fag */}
          <section className="mb-6 rounded-xl border border-[#2e3136] bg-[#1a1c1f] p-5 shadow-lg shadow-black/30">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-3">
              1. Velg fag
            </p>

            <div className="grid grid-cols-2 gap-3">
              {activeSubjects.map((subject) => {
                const isSelected = selectedSubjectId === String(subject.id);

                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(String(subject.id))}
                    className={
                      "p-3 rounded-xl border text-left transition " +
                      (isSelected
                        ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30"
                        : "bg-[#111214] border-[#2e3136] text-gray-200 hover:bg-[#181a1f]")
                    }
                  >
                    <div className="font-semibold">{subject.name}</div>
                    {subject.weeklyGoal > 0 && (
                      <div className="text-xs text-gray-300 mt-1">
                        Ukemål: {subject.weeklyGoal} t
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2) Varighet */}
          <section className="mb-6 rounded-xl border border-[#2e3136] bg-[#1a1c1f] p-5 shadow-lg shadow-black/30">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-3">
              2. Varighet
            </p>

            <div className="flex flex-wrap gap-2">
              {presetMinutes.map((m) => {
                const isActive = durationMode === "preset" && selectedPresetMinutes === m;

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setDurationMode("preset");
                      setSelectedPresetMinutes(m);
                    }}
                    className={
                      "px-3 py-2 rounded-xl border text-sm transition " +
                      (isActive
                        ? "bg-cyan-600/30 border-cyan-400/40 text-cyan-100"
                        : "bg-[#111214] border-[#2e3136] text-gray-200 hover:bg-[#181a1f]")
                    }
                  >
                    {m} min
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setDurationMode("custom")}
                className={
                  "px-3 py-2 rounded-xl border text-sm transition " +
                  (durationMode === "custom"
                    ? "bg-purple-600/30 border-purple-400/40 text-purple-100"
                    : "bg-[#111214] border-[#2e3136] text-gray-200 hover:bg-[#181a1f]")
                }
              >
                Egendefinert
              </button>
            </div>

            {durationMode === "custom" && (
              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-1">Antall timer</label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={customHoursInput}
                  onChange={(e) => setCustomHoursInput(e.target.value)}
                  placeholder="For eksempel: 1.5"
                  className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-purple-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Lagres internt som minutter.</p>
              </div>
            )}
          </section>

          {/* Primær handling */}
          <section className="mb-6">
            <button
              type="button"
              onClick={handleAddLog}
              disabled={!canSubmit}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold tracking-wide shadow-lg shadow-black/25 disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              Logg økt
            </button>

            <div className="mt-3 text-sm text-gray-300">
              {logs.length === 0 ? (
                <p>Ingen økter logget enda.</p>
              ) : (
                <p>
                  Totalt logget:{" "}
                  <span className="font-semibold text-blue-400">
                    {minutesToHoursText(totalMinutesAllTime)} timer
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* Historikk */}
          <section className="mt-2">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition"
            >
              {showHistory ? "Skjul tidligere økter" : "Se tidligere økter"}
            </button>

            {showHistory && (
              <ul className="mt-4 space-y-3">
                {history.length === 0 ? (
                  <li className="text-sm text-gray-400">Ingen økter enda.</li>
                ) : (
                  history.map((log) => {
                    const isEditing = editingLogId === log.id;

                    return (
                      <li
                        key={log.id}
                        className="bg-[#1a1c1f] rounded-xl p-4 border border-[#2e3136] shadow-md shadow-black/20 flex justify-between items-center gap-4"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{getSubjectName(log.subjectId)}</p>

                          {!isEditing && (
                            <p className="text-sm text-gray-400">
                              {minutesToHoursText(log.durationMinutes)} t — {log.createdAt}
                            </p>
                          )}

                          {isEditing && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={editHoursInput}
                                onChange={(e) => setEditHoursInput(e.target.value)}
                                className="w-28 px-2 py-1 rounded bg-[#111214] border border-[#2e3136] text-gray-200 focus:border-blue-500 outline-none text-sm"
                              />
                              <span className="text-xs text-gray-400">timer</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(log.id)}
                                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-xs"
                              >
                                Lagre
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLogId(null);
                                  setEditHoursInput("");
                                }}
                                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-xs"
                              >
                                Avbryt
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(log)}
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs"
                              >
                                Rediger
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLog(log.id)}
                                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs"
                              >
                                Slett
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default LogHours;
