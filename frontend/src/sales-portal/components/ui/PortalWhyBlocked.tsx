import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Props = {
  reasons: string[];
  className?: string;
};

export function PortalWhyBlocked({ reasons, className }: Props) {
  if (reasons.length === 0) return null;

  return (
    <Collapsible className={cn("pt-1", className)}>
      <CollapsibleTrigger className="group flex min-h-11 w-full items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#0A0A0A]/60 hover:text-[#FF3333] touch-manipulation">
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        Why blocked?
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 list-inside list-disc space-y-0.5 border-l-2 border-[#FF3333] pl-2 text-xs text-[#0A0A0A]/70">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
