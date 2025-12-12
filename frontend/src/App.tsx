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

// sideinnhold og navigasjon
  return (
    <div className="min-h-screen bg-[#000] text-white pb-20">
      {/* SIDE-INNHOLD */}
      <main className="p-4">
        {page === "dashboard" && (
          <Dashboard subjects={subjects} logs={logs} />
        )}

        {page === "subjects" && (
          <Subjects subjects={subjects} setSubjects={setSubjects} />
        )}

        {page === "log" && (
          <LogHours subjects={subjects} logs={logs} setLogs={setLogs} />
        )}
      </main>

      {/* FOOTER / NAVIGATION */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#111] border-t border-gray-700 text-gray-300">
        <div className="max-w-xl mx-auto flex justify-around py-3">
          {/* Dashboard */}
          <button
            onClick={() => setPage("dashboard")}
            className={`flex flex-col items-center text-xs ${
              page === "dashboard" ? "text-blue-400" : "text-gray-400"
            } hover:text-blue-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5m-6 0H4a1 1 0 01-1-1V10"
              />
            </svg>
            Dashboard
          </button>

          {/* Fag */}
          <button
            onClick={() => setPage("subjects")}
            className={`flex flex-col items-center text-xs ${
              page === "subjects" ? "text-blue-400" : "text-gray-400"
            } hover:text-blue-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 mb-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            Fag
          </button>

          {/* Timer */}
          <button
            onClick={() => setPage("log")}
            className={`flex flex-col items-center text-xs ${
              page === "log" ? "text-blue-400" : "text-gray-400"
            } hover:text-blue-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Timer
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;