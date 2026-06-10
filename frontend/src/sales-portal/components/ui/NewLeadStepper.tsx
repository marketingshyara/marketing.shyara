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
    <div className="border-2 border-[#0A0A0A] bg-[#FAFAFA] p-4 shadow-[2px_2px_0_0_#0A0A0A]">
      <ol className="flex items-start justify-between gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.label} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center border-2 border-[#0A0A0A] bg-white",
                  i === 0 && "border-[#FF3333] bg-[#FF3333] text-white"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-xs font-bold uppercase leading-tight tracking-wide">
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <Collapsible className="mt-3">
        <CollapsibleTrigger className="flex w-full items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#0A0A0A]/60">
          <ChevronDown className="h-3.5 w-3.5" />
          How it works
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-[#0A0A0A]/70">
            <li>Add prospect details below.</li>
            <li>Convert to client and record advance on the project page.</li>
            <li>Admin verifies payment; then WhatsApp and demo steps unlock.</li>
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
