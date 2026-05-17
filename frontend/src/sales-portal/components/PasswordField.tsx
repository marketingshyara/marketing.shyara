import { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  autoFocus?: boolean;
  className?: string;
};

export function PasswordField({
  id,
  label,
  registration,
  error,
  autoComplete,
  hint,
  autoFocus,
  className
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          spellCheck={false}
          autoFocus={autoFocus}
          className="min-h-11 flex-1"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hintId}
          {...registration}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 gap-1.5 px-3 sm:min-w-[8.5rem]"
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {visible ? "Hide password" : "Show password"}
        </Button>
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : (
        <p id={hintId} className="sr-only">
          Use Show password or Hide password to reveal or conceal what you typed.
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
