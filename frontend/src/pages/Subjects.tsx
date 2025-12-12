import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Subject } from "../types";

interface SubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

function Subjects({ subjects, setSubjects }: SubjectsProps) {
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newWeeklyGoal, setNewWeeklyGoal] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGoal, setEditGoal] = useState("");

  const handleAddSubject = (): void => {
    const name = newSubjectName.trim();
    const weekly =
      newWeeklyGoal.trim() === "" ? 0 : Number(newWeeklyGoal);

    if (!name) return alert("Vennligst skriv inn et fagnavn.");
    if (newWeeklyGoal.trim() !== "" && (Number.isNaN(weekly) || weekly < 0))
      return alert("Vennligst skriv inn et gyldig mål (0 eller større).");

    const newSubject: Subject = {
      id: Date.now(),
      name,
      weeklyGoal: weekly,
    };

    setSubjects((prev) => [...prev, newSubject]);
    setNewSubjectName("");
    setNewWeeklyGoal("");
  };

  const handleRemove = (id: number): void => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveGoal = (id: number): void => {
    const newGoal = Number(editGoal);
    if (Number.isNaN(newGoal) || newGoal < 0)
      return alert("Ugyldig mål. Må være 0 eller større.");

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === id ? { ...subject, weeklyGoal: newGoal } : subject
      )
    );

    setEditingId(null);
    setEditGoal("");
  };

  return (
    ///design bakgrunn
    <div className="min-h-screen px-6 pb-24 pt-6 text-gray-100 
                    bg-gradient-to-b from-[#0f0f11] to-[#1c677f]">

      <h2 className="text-3xl font-bold mb-6 tracking-tight">
        Your inspiring Subjects :) 
      </h2>

      {/* Input area */}
      <div className="space-y-4 mb-8 bg-[#1a1c1f] border border-[#2e3136] 
                      rounded-xl p-5 shadow-lg shadow-black/30">

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Name</label>
          <input
            type="text"
            value={newSubjectName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewSubjectName(e.target.value)
            }
            placeholder="For example: Math"
            className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200
                       border border-[#2e3136] focus:border-blue-500 
                       transition outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">
            WeeklyGoal (Hours)
          </label>
          <input
            type="number"
            value={newWeeklyGoal}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewWeeklyGoal(e.target.value)
            }
            min="0"
            placeholder="Recommended: 10"
            className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200
                       border border-[#2e3136] focus:border-blue-500 
                       transition outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAddSubject}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 
                     transition font-semibold tracking-wide shadow-sm"
        >
          Add
        </button>
      </div>

      {/* Subjects list */}
      <ul className="space-y-4">
        {subjects.map((s) => (
          <li
            key={s.id}
            className="bg-[#1a1c1f] rounded-xl p-4 border border-[#2e3136]
                       shadow-md shadow-black/20 hover:bg-[#222427]
                       transition flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">{s.name}</p>

              {editingId === s.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={editGoal}
                    min="0"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEditGoal(e.target.value)
                    }
                    className="w-24 px-2 py-1 rounded bg-[#111214] border border-[#2e3136] 
                               text-gray-200 focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => handleSaveGoal(s.id)}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm"
                  >
                    Save 
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditGoal("");
                    }}
                    className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-1">
                  {s.weeklyGoal} h/Week
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {editingId !== s.id && (
                <button
                  className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
                  onClick={() => {
                    setEditingId(s.id);
                    setEditGoal(String(s.weeklyGoal));
                  }}
                >
                  Edit
                </button>
              )}

              <button
                className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                onClick={() => handleRemove(s.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subjects;
