import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

/**
 * Light / dark toggle only (no system / monitor cycle).
 * Uses `resolvedTheme` so the control matches the applied appearance.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex h-9 min-w-[5.75rem] items-center justify-end gap-2"
        aria-hidden
      >
        <span className="sr-only">Theme</span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
      <Moon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </div>
  );
}
