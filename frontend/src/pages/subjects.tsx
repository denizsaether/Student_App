import type { Session } from "@supabase/supabase-js";

import { createSubject } from "../db/subjects";
import { setSubjectArchived } from "../db/subjects";
import { updateSubject } from "../db/subjects";
import { deleteSubject } from "../db/subjects";



import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Subject, LogEntry } from "../types";

interface SubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  logs: LogEntry[];
  session: Session | null;
};

function parseGoal(input: string): number | null {
  const raw = input.trim().replace(",", ".");
  if (raw === "") return 0;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function Subjects({ subjects, setSubjects, logs, session }: SubjectsProps) {
  // ===== Toast (2,2 sek) =====
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toastMsg = (msg: string) => setToast(msg);

  // ===== Nytt fag =====
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newWeeklyGoal, setNewWeeklyGoal] = useState("");

  // ===== Redigering =====
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");

  // ===== Lister (skjult) =====
  const [showActive, setShowActive] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeSubjects = useMemo(
    () => subjects.filter((s) => !(s.isArchived ?? false)),
    [subjects]
  );

  const archivedSubjects = useMemo(
    () => subjects.filter((s) => s.isArchived ?? false),
    [subjects]
  );

  const subjectHasLogs = (id: number): boolean => logs.some((l) => l.subjectId === id);

  const sortSubjects = (list: Subject[]) =>
    list
      .slice()
      .sort((a, b) => Number(b.weeklyGoal ?? 0) - Number(a.weeklyGoal ?? 0))
      .sort((a, b) => {
        const diff = Number(b.weeklyGoal ?? 0) - Number(a.weeklyGoal ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "nb");
      });

  const handleAddSubject = async (): Promise<void> => {
    const name = newSubjectName.trim();
    const goal = parseGoal(newWeeklyGoal);

    if (!name) return alert("Skriv inn emnekode.");
    if (goal === null) return alert("Ukemål må være 0 eller høyere.");

    let newSubject: Subject | null = null;

    if (session) {
      newSubject = await createSubject(session.user.id, name, goal);
      if (!newSubject) return alert("Kunne ikke lagre faget i databasen.");
    } else {
      newSubject = {
        id: Date.now(),
        name,
        weeklyGoal: goal,
        isArchived: false,
      };
    }
    if (!newSubject) return;

    setSubjects((prev) => [...prev, newSubject]);
    setNewSubjectName("");
    setNewWeeklyGoal("");
    setShowActive(true); // UX: vis listen når du legger til
    toastMsg("Fag lagt til ✅");
  };

  const startEdit = (s: Subject): void => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditGoal(String(s.weeklyGoal ?? 0));
  };

  const handleSaveEdit = async (id: number): Promise<void> => {
    const name = editName.trim();
    const goal = parseGoal(editGoal);

    if (!name) return alert("Emnekode kan ikke være tomt.");
    if (goal === null) return alert("Ukemål må være 0 eller høyere.");

    if (session) {
      const updated = await updateSubject(id, name, goal);
      if (!updated) return alert("Kunne ikke lagre endringen i databasen.");

      setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name, weeklyGoal: goal } : s))
      );
    }

    setEditingId(null);
    setEditName("");
    setEditGoal("");
    toastMsg("Oppdatert ✅");
  };

  const handleArchive = async (id: number): Promise<void> => {
    if (session) {
      const updated = await setSubjectArchived(id, true);
      if (!updated) return alert("Kunne ikke arkivere i databasen.");

      setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isArchived: true } : s))
      );
    }

    if (editingId === id) {
      setEditingId(null);
      setEditName("");
      setEditGoal("");
    }
    toastMsg("Arkivert");
  };


  const handleUnarchive = async (id: number): Promise<void> => {
    if (session) {
      const updated = await setSubjectArchived(id, false);
      if (!updated) return alert("Kunne ikke gjenopprette i databasen.");

      setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isArchived: false } : s))
      );
    }

    toastMsg("Gjenopprettet");
  };


  const handlePermanentDelete = async (s: Subject): Promise<void> => {
    if (subjectHasLogs(s.id)) {
      alert(
        "Kan ikke slette permanent: du har logget økter på dette faget. Bruk Arkiver i stedet."
      );
      return;
    }

    const ok = window.confirm(`Slett "${s.name}" permanent? Dette kan ikke angres.`);
    if (!ok) return;

    if (session) {
      const deleted = await deleteSubject(s.id);
      if (!deleted) {
        alert("Kunne ikke slette faget i databasen.");
        return;
      }
    }

    setSubjects((prev) => prev.filter((x) => x.id !== s.id));
    if (editingId === s.id) {
      setEditingId(null);
      setEditName("");
      setEditGoal("");
    }
    toastMsg("Slettet");
  };

  // Standardmål: 6 / 10 / 13 (for 5 / 7.5 / 10 studiepoeng)
  const quickGoals = [
    { hours: 6, label: "5 stp" },
    { hours: 10, label: "7,5 stp" },
    { hours: 13, label: "10 stp" },
  ];

  const renderList = (list: Subject[], archived: boolean) => {
    const sorted = sortSubjects(list);

    if (sorted.length === 0) {
      return (
        <div className="rounded-xl border border-[#2e3136] bg-[#1a1c1f] p-5 shadow-lg shadow-black/30">
          <p className="text-sm text-gray-300">
            {archived ? "Ingen arkiverte fag." : "Ingen aktive fag enda."}
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {sorted.map((s) => {
          const isEditing = editingId === s.id;
          const hasLogs = subjectHasLogs(s.id);
          const isArchived = Boolean(s.isArchived ?? false);

          return (
            <li
              key={s.id}
              className="rounded-xl border border-[#2e3136] bg-[#1a1c1f] p-4 shadow-md shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{s.name}</p>

                        {isArchived && (
                          <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300">
                            Arkivert
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 mt-1">
                        Ukemål:{" "}
                        <span className="text-gray-200 font-semibold">
                          {Number(s.weeklyGoal ?? 0)} t
                        </span>
                      </p>

                      {hasLogs && (
                        <p className="text-xs text-gray-500 mt-1">
                          Har historikk (kan ikke slettes permanent)
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Emnekode
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Ukemål (timer)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editGoal}
                          onChange={(e) => setEditGoal(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(s.id)}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-semibold transition"
                      >
                        Lagre
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                          setEditGoal("");
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-sm transition"
                      >
                        Avbryt
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition"
                      >
                        Rediger
                      </button>

                      {archived ? (
                        <button
                          type="button"
                          onClick={() => handleUnarchive(s.id)}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold transition"
                        >
                          Gjenopprett
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(s.id)}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold transition"
                        >
                          Arkiver
                        </button>
                      )}

                      {!hasLogs && (
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(s)}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm transition"
                        >
                          Slett permanent
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="min-h-screen px-6 pb-24 pt-6 text-gray-100 bg-gradient-to-b from-[#050509] to-[#15171a] relative">
      {/* Toast øverst */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/12 backdrop-blur px-4 py-3 shadow-lg shadow-black/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-sm font-semibold text-emerald-100">{toast}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Fag</h2>
        <p className="text-sm text-gray-400 mt-1">
          Legg til fag. Arkiver når eksamen er fullført – historikken blir.
        </p>
      </div>

      {/* Legg til fag */}
      <section className="mb-6 rounded-xl border border-[#2e3136] bg-[#1a1c1f] p-5 shadow-lg shadow-black/30">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-3">
          Legg til nytt fag
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Emnekode</label>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewSubjectName(e.target.value)
              }
              placeholder="For eksempel: IN1000"
              className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 transition outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Ukemål (timer)
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {quickGoals.map((q) => (
                <button
                  key={q.hours}
                  type="button"
                  onClick={() => setNewWeeklyGoal(String(q.hours))}
                  className="px-3 py-2 rounded-xl border border-[#2e3136] bg-[#111214] text-gray-200 hover:bg-[#181a1f] text-sm transition"
                  title={`${q.label} – forslag`}
                >
                  {q.hours} t <span className="text-gray-400">({q.label})</span>
                </button>
              ))}
            </div>

            <input
              type="number"
              min="0"
              step="0.5"
              value={newWeeklyGoal}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewWeeklyGoal(e.target.value)
              }
              placeholder="Egendefinert, f.eks. 7.5"
              className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 transition outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold tracking-wide shadow-sm"
          >
            Legg til fag
          </button>
        </div>
      </section>

      {/* Aktive (skjult) */}
      <section className="mb-4">
        <button
          type="button"
          onClick={() => setShowActive((v) => !v)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition"
        >
          {showActive
            ? "Skjul aktive fag"
            : `Vis aktive fag (${activeSubjects.length})`}
        </button>

        {showActive && (
          <div className="mt-4">
            {renderList(activeSubjects, false)}
          </div>
        )}
      </section>

      {/* Arkiverte (skjult) */}
      <section>
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition"
        >
          {showArchived
            ? "Skjul arkiverte fag"
            : `Vis arkiverte fag (${archivedSubjects.length})`}
        </button>

        {showArchived && (
          <div className="mt-4">
            {renderList(archivedSubjects, true)}
          </div>
        )}
      </section>
    </div>
  );
}

export default Subjects;
