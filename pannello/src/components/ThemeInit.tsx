"use client";

import { useEffect } from "react";
import { initTheme } from "@/components/ThemeToggle";

export default function ThemeInit() {
  useEffect(() => {
    initTheme();
  }, []);
  return null;
}
