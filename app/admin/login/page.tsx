"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("bad password");
      window.location.href = "/admin";
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.5)]"
      >
        <h1 className="font-display text-xl font-bold tracking-tight">
          Atlas <span style={{ color: "#c0703a" }}>Admin</span>
        </h1>
        <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#5b6b7d]">
          Restricted · enter password
        </p>

        <label className="mt-5 block">
          <span className="sr-only">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 font-mono text-sm outline-none transition focus:border-[#c0703a] focus:ring-2 focus:ring-[#c0703a]/30"
          />
        </label>

        {error && (
          <p className="mt-2 font-mono text-[0.7rem] text-[#c0392b]">
            Incorrect password.
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-lg py-2.5 font-mono text-[0.72rem] uppercase tracking-wider text-white transition disabled:opacity-40"
          style={{ background: "#c0703a" }}
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
