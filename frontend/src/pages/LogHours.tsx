import { useMemo, useState } from "react";
import type { Subject, LogEntry } from "../types";
import { minutesToHoursText } from "../utils/format";

interface LogHoursProps {
  subjects: Subject[];
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

function hoursInputToMinutes(hoursInput: string): number | null {
  const raw = hoursInput.trim();
  if (raw === "") return null;

  const hours = Number(raw);
  if (Number.isNaN(hours) || hours <= 0) return null;

  return Math.round(hours * 60);
}

function LogHours({ subjects, logs, setLogs }: LogHoursProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [hoursInput, setHoursInput] = useState<string>("");

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editHoursInput, setEditHoursInput] = useState<string>("");

  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Ukjent fag";
  };

  const totalMinutes = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  }, [logs]);

  const handleAddLog = (): void => {
    if (subjects.length === 0) {
      alert("Du må legge til et fag først på Fag-siden.");
      return;
    }

    if (!selectedSubjectId) {
      alert("Velg et fag.");
      return;
    }

    const durationMinutes = hoursInputToMinutes(hoursInput);
    if (durationMinutes === null) {
      alert("Skriv inn et gyldig antall timer (større enn 0).");
      return;
    }

    const now = new Date();

    const newLog: LogEntry = {
      id: Date.now(),
      subjectId: Number(selectedSubjectId),
      durationMinutes,
      createdAtISO: now.toISOString(), // alltid for beregning
      createdAt: now.toLocaleString(), // pen tekst til visning (MVP)
    };

    setLogs((prev) => [newLog, ...prev]);
    setHoursInput("");
  };

  const handleDeleteLog = (id: number): void => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (editingLogId === id) {
      setEditingLogId(null);
      setEditHoursInput("");
    }
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
  };

  return (
    <div className="min-h-screen px-6 pb-24 pt-6 text-gray-100 bg-gradient-to-b from-[#0f0f11] to-[#15171a]">
      <h2 className="text-3xl font-bold mb-6 tracking-tight">Logg timer</h2>

      {subjects.length === 0 ? (
        <div className="bg-[#1a1c1f] border border-[#2e3136] rounded-xl p-5 shadow-lg shadow-black/30">
          <p className="text-gray-300">
            Du har ingen fag enda. Gå til{" "}
            <span className="font-semibold">Fag</span>-siden og legg til minst
            ett fag før du logger timer.
          </p>
        </div>
      ) : (
        <>
          {/* Fag som knapper */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">Velg fag</label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => {
                const isSelected = selectedSubjectId === String(subject.id);

                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(String(subject.id))}
                    className={
                      "p-3 rounded-xl border text-sm text-left transition " +
                      (isSelected
                        ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30"
                        : "bg-[#111214] border-[#2e3136] text-gray-200 hover:bg-[#181a1f]")
                    }
                  >
                    <div className="font-semibold">{subject.name}</div>
                    {subject.weeklyGoal > 0 && (
                      <div className="text-xs text-gray-300 mt-1">
                        Mål: {subject.weeklyGoal} t/uke
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skjema for timer */}
          <div className="space-y-4 mb-8 bg-[#1a1c1f] border border-[#2e3136] rounded-xl p-5 shadow-lg shadow-black/30">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Antall timer
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                placeholder="For eksempel: 1.5"
                className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lagres internt som minutter (bedre for grafer og statistikk).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddLog}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold tracking-wide shadow-sm disabled:opacity-40"
              disabled={!selectedSubjectId}
            >
              Legg til økt
            </button>

            <div className="text-sm text-gray-300">
              {logs.length === 0 ? (
                <p>Ingen økter logget enda.</p>
              ) : (
                <p>
                  Totalt logget:{" "}
                  <span className="font-semibold text-blue-400">
                    {minutesToHoursText(totalMinutes)} timer
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Liste over økter */}
          <ul className="space-y-3">
            {logs.map((log) => {
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
                          className="w-24 px-2 py-1 rounded bg-[#111214] border border-[#2e3136] text-gray-200 focus:border-blue-500 outline-none text-sm"
                        />
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
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default LogHours;