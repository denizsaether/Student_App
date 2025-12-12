import { useEffect, useState } from "react";
import { loadLogs, loadSubjects, saveLogs, saveSubjects } from "./storage";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import LogHours from "./pages/LogHours";

import type { Subject, LogEntry } from "./types";

function App() {
  const [page, setPage] = useState<"dashboard" | "subjects" | "log">("dashboard");

  // last inn lagrede data
const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
const [logs, setLogs] = useState<LogEntry[]>(() => loadLogs());

// lagre data ved endring 
useEffect(() => {
  saveSubjects(subjects);
}, [subjects]);

useEffect(() => {
  saveLogs(logs);
}, [logs]);

// sideinnhold og navigasjonreturn (
return (
  ///global bakgrunn
    <div className="min-h-screen text-gray-100 bg-gradient-to-b from-[#050509] via-[#0b0b12] to-[#15171a] pb-24">
      {/* Subtle glow bak */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-32 right-[-80px] h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-10 left-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* SIDE-INNHOLD */}
      <main className="relative mx-auto max-w-xl px-5 pt-6">
        {/* Page header */}
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            Clocked In
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {page === "dashboard"
              ? "Dashboard"
              : page === "subjects"
              ? "Fag"
              : "Logg timer"}
          </h1>
          <p className="text-sm text-gray-400">
            {page === "dashboard"
              ? "Ukestatus og fremgang"
              : page === "subjects"
              ? "Administrer fag og mål"
              : "Registrer økter og rediger historikk"}
          </p>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-[#232635] bg-[#0b0b12]/70 shadow-xl shadow-black/40 backdrop-blur">
          <div className="p-4">
            {page === "dashboard" && (
              <Dashboard subjects={subjects} logs={logs} />
            )}

            {page === "subjects" && (
              <Subjects subjects={subjects} setSubjects={setSubjects} />
            )}

            {page === "log" && (
              <LogHours subjects={subjects} logs={logs} setLogs={setLogs} />
            )}
          </div>
        </div>

        <div className="h-24" />
      </main>

      {/* FOOTER / NAVIGATION */}
      <footer className="fixed bottom-0 left-0 w-full">
        <div className="mx-auto max-w-xl px-5 pb-5">
          <div className="rounded-2xl border border-[#232635] bg-[#0b0b12]/80 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="flex justify-around px-3 py-2">
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className={
                  "group flex w-full flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] transition " +
                  (page === "dashboard"
                    ? "text-blue-300"
                    : "text-gray-400 hover:text-gray-200")
                }
              >
                <div
                  className={
                    "mb-1 flex h-10 w-10 items-center justify-center rounded-xl border transition " +
                    (page === "dashboard"
                      ? "border-blue-400/40 bg-blue-500/10 shadow-md shadow-blue-500/20"
                      : "border-transparent bg-transparent group-hover:border-[#232635] group-hover:bg-white/5")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5m-6 0H4a1 1 0 01-1-1V10"
                    />
                  </svg>
                </div>
                Dashboard
              </button>

              {/* Fag */}
              <button
                type="button"
                onClick={() => setPage("subjects")}
                className={
                  "group flex w-full flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] transition " +
                  (page === "subjects"
                    ? "text-purple-300"
                    : "text-gray-400 hover:text-gray-200")
                }
              >
                <div
                  className={
                    "mb-1 flex h-10 w-10 items-center justify-center rounded-xl border transition " +
                    (page === "subjects"
                      ? "border-purple-400/40 bg-purple-500/10 shadow-md shadow-purple-500/20"
                      : "border-transparent bg-transparent group-hover:border-[#232635] group-hover:bg-white/5")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                </div>
                Fag
              </button>

              {/* Timer */}
              <button
                type="button"
                onClick={() => setPage("log")}
                className={
                  "group flex w-full flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] transition " +
                  (page === "log"
                    ? "text-cyan-300"
                    : "text-gray-400 hover:text-gray-200")
                }
              >
                <div
                  className={
                    "mb-1 flex h-10 w-10 items-center justify-center rounded-xl border transition " +
                    (page === "log"
                      ? "border-cyan-400/40 bg-cyan-500/10 shadow-md shadow-cyan-500/20"
                      : "border-transparent bg-transparent group-hover:border-[#232635] group-hover:bg-white/5")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Timer
              </button>
            </div>

            {/* active indicator */}
            <div className="px-4 pb-3">
              <div className="h-[2px] w-full rounded-full bg-[#15171f] overflow-hidden">
                <div
                  className={
                    "h-[2px] rounded-full transition-all duration-300 " +
                    (page === "dashboard"
                      ? "w-1/3 bg-gradient-to-r from-blue-500 to-cyan-400"
                      : page === "subjects"
                      ? "w-2/3 bg-gradient-to-r from-purple-500 to-pink-400"
                      : "w-full bg-gradient-to-r from-cyan-400 to-emerald-400")
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;