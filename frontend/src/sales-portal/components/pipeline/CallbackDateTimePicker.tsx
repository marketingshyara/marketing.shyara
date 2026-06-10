import { useMemo } from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrutalButton } from "../brutalist/BrutalButton";
import {
  portalFieldLabelClass,
  portalPopoverSurfaceClass,
  portalSelectContentClass,
  portalSelectTriggerClass
} from "../ui/portalDialogStyles";

type Meridiem = "AM" | "PM";

type TimeParts = {
  hour12: number;
  minute: number;
  meridiem: Meridiem;
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function to12Hour(date: Date): TimeParts {
  const h24 = date.getHours();
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const minute = Math.round(date.getMinutes() / 5) * 5;
  return { hour12, minute: minute === 60 ? 55 : minute, meridiem };
}

function to24Hour(hour12: number, meridiem: Meridiem): number {
  if (meridiem === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function mergeDateAndTime(day: Date, parts: TimeParts): Date {
  const base = startOfDay(day);
  return setMinutes(setHours(base, to24Hour(parts.hour12, parts.meridiem)), parts.minute);
}

type Props = {
  id?: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
};

export function CallbackDateTimePicker({ id, value, onChange, disabled }: Props) {
  const timeParts = useMemo(() => (value ? to12Hour(value) : { hour12: 10, minute: 0, meridiem: "AM" as Meridiem }), [value]);

  const updateTime = (patch: Partial<TimeParts>) => {
    if (!value) return;
    const next: TimeParts = { ...timeParts, ...patch };
    onChange(mergeDateAndTime(startOfDay(value), next));
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(mergeDateAndTime(day, timeParts));
  };

  const label = value ? format(value, "d MMM yyyy, h:mm a") : "Add time (optional)";

  return (
    <div className="space-y-2">
      <p className={portalFieldLabelClass}>Callback time (optional)</p>
      <div className="flex flex-wrap items-center gap-2">
        <Popover modal={false}>
          <PopoverTrigger asChild>
            <BrutalButton
              id={id}
              type="button"
              variant="secondary"
              disabled={disabled}
              className={cn(
                "w-full flex-1 justify-start gap-2 font-semibold normal-case tracking-normal",
                !value && "text-[#0A0A0A]/50"
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{label}</span>
            </BrutalButton>
          </PopoverTrigger>
          <PopoverContent
            className={cn(portalPopoverSurfaceClass, "portal-dialog-surface z-[70] w-auto p-0")}
            align="start"
          >
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDaySelect}
              initialFocus
              className="rounded-md"
            />
            <div className="space-y-3 border-t-2 border-[#0A0A0A]/15 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {value ? "Time" : "Pick a date to set time"}
              </p>
              <div className={cn("grid grid-cols-3 gap-2", !value && "pointer-events-none opacity-50")}>
                <div className="space-y-1">
                  <Label className="sr-only" htmlFor={`${id}-hour`}>
                    Hour
                  </Label>
                  <Select
                    value={String(timeParts.hour12)}
                    onValueChange={(v) => updateTime({ hour12: Number(v) })}
                  >
                    <SelectTrigger id={`${id}-hour`} className={portalSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={portalSelectContentClass}>
                      {HOURS_12.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="sr-only" htmlFor={`${id}-minute`}>
                    Minute
                  </Label>
                  <Select
                    value={String(timeParts.minute).padStart(2, "0")}
                    onValueChange={(v) => updateTime({ minute: Number(v) })}
                  >
                    <SelectTrigger id={`${id}-minute`} className={portalSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={portalSelectContentClass}>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {String(m).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="sr-only" htmlFor={`${id}-meridiem`}>
                    AM or PM
                  </Label>
                  <Select
                    value={timeParts.meridiem}
                    onValueChange={(v) => updateTime({ meridiem: v as Meridiem })}
                  >
                    <SelectTrigger id={`${id}-meridiem`} className={portalSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={portalSelectContentClass}>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {value ? (
          <BrutalButton
            type="button"
            variant="ghost"
            className="min-h-11 min-w-11 shrink-0 px-2"
            disabled={disabled}
            aria-label="Clear callback time"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" aria-hidden />
          </BrutalButton>
        ) : null}
      </div>
    </div>
  );
}
