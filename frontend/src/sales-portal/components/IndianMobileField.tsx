import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isValidIndianMobile, normalizeIndianMobileInput } from "../lib/indianMobilePhone";

type Props = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function IndianMobileField({
  id,
  label = "Mobile number",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className
}: Props) {
  const digits = normalizeIndianMobileInput(value);
  const complete = isValidIndianMobile(digits);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </Label>
      <div
        className={cn(
          "flex min-h-11 overflow-hidden rounded-md border bg-background shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error ? "border-destructive focus-within:ring-destructive" : "border-input"
        )}
      >
        <span
          className="flex shrink-0 items-center border-r bg-muted/50 px-3 text-sm text-muted-foreground"
          aria-hidden
        >
          +91
        </span>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          enterKeyHint="done"
          placeholder="9876543210"
          maxLength={10}
          className="min-h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={digits}
          disabled={disabled}
          readOnly={disabled}
          onChange={(e) => onChange(normalizeIndianMobileInput(e.target.value))}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-required={required}
        />
      </div>
      <p
        id={hintId}
        className={cn(
          "text-xs",
          complete ? "text-muted-foreground" : "text-muted-foreground tabular-nums"
        )}
      >
        {complete ? "10-digit mobile saved without +91." : `${digits.length}/10 digits`}
      </p>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
