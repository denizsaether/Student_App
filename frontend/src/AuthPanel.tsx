import { useState } from "react";
import { supabase } from "./supabaseClient";

type Mode = "signin" | "signup";

export default function AuthPanel() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageTone, setMessageTone] = useState<"info" | "error" | "success">("info");

  function show(msg: string, tone: "info" | "error" | "success") {
    setMessage(msg);
    setMessageTone(tone);
  }

  async function handleSubmit() {
    const e = email.trim();

    if (!e || !password) {
      show("Fyll inn e-post og passord.", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: e, password });

        if (error) {
          show("Kunne ikke registrere. Prøv igjen, eller logg inn hvis du allerede har konto.", "error");
          return;
        }

        // Med email-confirm: bruker må ofte bekrefte før innlogging fungerer
        show("Konto opprettet. Sjekk e-posten og bekreft. Deretter kan du logge inn.", "success");
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: e, password });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("confirm") || msg.includes("verified") || msg.includes("verification")) {
          show("Du må bekrefte e-posten først. Sjekk innboksen din og trykk Verify.", "error");
          return;
        }
        show("Ugyldig e-post eller passord.", "error");
        return;
      }

      show("Logget inn.", "success");
    } finally {
      setLoading(false);
    }
  }

  const chipBase =
    "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition";
  const activeChip = "border-white/10 bg-white/10 text-gray-100";
  const inactiveChip = "border-transparent bg-transparent text-gray-400 hover:bg-white/5";

  const msgBoxClass =
    messageTone === "success"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : messageTone === "error"
      ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
      : "border-white/10 bg-white/5 text-gray-200";

  return (
    <div className="min-h-screen text-gray-100 bg-gradient-to-b from-[#050509] via-[#0b0b12] to-[#15171a]">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-32 right-[-80px] h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-10 left-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-xl px-5 pt-10">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Clocked In</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Logg inn" : "Opprett konto"}
          </h1>
          <p className="text-sm text-gray-400">
            {mode === "signin"
              ? "Logg inn for å synkronisere fag og timer på tvers av enheter."
              : "Opprett konto med e-post. Du kan bli bedt om å bekrefte e-posten."}
          </p>
        </div>

        <div className="rounded-2xl border border-[#232635] bg-[#0b0b12]/70 shadow-xl shadow-black/40 backdrop-blur">
          <div className="p-4 space-y-4">
            {/* Mode switch */}
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={chipBase + " " + (mode === "signin" ? activeChip : inactiveChip)}
              >
                Logg inn
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={chipBase + " " + (mode === "signup" ? activeChip : inactiveChip)}
              >
                Registrer
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 outline-none"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 tegn"
                className="w-full px-3 py-2 rounded-lg bg-[#111214] text-gray-200 border border-[#2e3136] focus:border-blue-500 outline-none"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-lg shadow-black/25 disabled:opacity-50"
            >
              {loading ? "Jobber..." : mode === "signin" ? "Logg inn" : "Opprett konto"}
            </button>

            {message && (
              <div className={"rounded-xl border px-3 py-2 " + msgBoxClass}>
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
