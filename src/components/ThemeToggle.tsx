"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-surface-elevated animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn-icon btn-ghost w-9 h-9 relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isDark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}>
        <Sun className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isDark ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}>
        <Moon className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
      </div>
    </button>
  );
}
