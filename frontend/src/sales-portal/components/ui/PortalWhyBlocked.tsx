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
      <CollapsibleTrigger className="group flex min-h-11 w-full items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground touch-manipulation">
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        Why blocked?
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-xs text-muted-foreground">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
