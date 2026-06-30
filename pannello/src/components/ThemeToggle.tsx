"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mycity_theme";

export function initTheme() {
  if (typeof document === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    /* ignore */
  }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-white/10 text-black/55 dark:text-white/70 ring-1 ring-black/[0.06] dark:ring-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition"
      aria-label={dark ? "Schermo diurno" : "Schermo notturno"}
      title={dark ? "Schermo diurno" : "Schermo notturno"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
