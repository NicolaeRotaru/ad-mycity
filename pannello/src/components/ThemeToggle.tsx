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
      className="nav-tab !px-2.5 !py-2"
      aria-label={dark ? "Schermo diurno" : "Schermo notturno"}
      title={dark ? "Schermo diurno" : "Schermo notturno"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
