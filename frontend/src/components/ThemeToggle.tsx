import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  /** Switch only — for crowded mobile headers */
  compact?: boolean;
  className?: string;
};

/**
 * Light / dark toggle only (no system / monitor cycle).
 * Uses `resolvedTheme` so the control matches the applied appearance.
 */
export function ThemeToggle({ compact = false, className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          compact
            ? "flex min-h-11 min-w-11 shrink-0 items-center justify-center"
            : "flex h-9 items-center justify-end gap-2",
          className
        )}
        aria-hidden
      >
        <span className="sr-only">Theme</span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (compact) {
    return (
      <div
        className={cn(
          "flex min-h-11 min-w-11 shrink-0 items-center justify-center touch-manipulation",
          className
        )}
      >
        <Switch
          id="theme-toggle-compact"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label={ariaLabel}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sun className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={ariaLabel}
      />
      <Moon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </div>
  );
}
