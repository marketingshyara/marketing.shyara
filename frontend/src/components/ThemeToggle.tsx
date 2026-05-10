import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label =
    theme === "system"
      ? `Theme: system (${resolvedTheme ?? "…"})`
      : `Theme: ${theme ?? resolvedTheme ?? "light"}`;

  const icon =
    theme === "system" ? (
      <Monitor className="h-5 w-5" />
    ) : resolvedTheme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="rounded-full min-h-11 min-w-11 md:min-h-10 md:min-w-10"
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
