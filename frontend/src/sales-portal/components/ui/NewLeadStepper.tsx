import { ClipboardList, IndianRupee, UserPlus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: UserPlus, label: "Add lead" },
  { icon: IndianRupee, label: "Convert + advance" },
  { icon: ClipboardList, label: "Admin verifies" }
];

export function NewLeadStepper() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <ol className="flex items-start justify-between gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.label} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border bg-background",
                  i === 0 && "border-primary text-primary"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-xs font-medium leading-tight">{step.label}</span>
            </li>
          );
        })}
      </ol>
      <Collapsible className="mt-3">
        <CollapsibleTrigger className="flex w-full items-center gap-1 text-xs font-medium text-muted-foreground">
          <ChevronDown className="h-3.5 w-3.5" />
          How it works
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-muted-foreground">
            <li>Add prospect details below.</li>
            <li>Convert to client and record advance on the project page.</li>
            <li>Admin verifies payment; then WhatsApp and demo steps unlock.</li>
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
