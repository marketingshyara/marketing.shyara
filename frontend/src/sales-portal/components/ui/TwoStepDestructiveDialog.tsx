import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/** Solid destructive actions — readable on dark portal backgrounds. */
export const portalDestructiveButtonClass =
  "bg-destructive text-destructive-foreground shadow-sm ring-1 ring-destructive/60 hover:bg-destructive/90 hover:brightness-110";

export const portalDestructiveIconButtonClass =
  "text-destructive hover:bg-destructive/15 hover:text-destructive";

type StepContent = {
  title: string;
  description: ReactNode;
};

type Props = {
  trigger: ReactNode;
  step1: StepContent;
  step2: StepContent;
  confirmLabel: string;
  pendingLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TwoStepDestructiveDialog({
  trigger,
  step1,
  step2,
  confirmLabel,
  pendingLabel = "Working…",
  onConfirm,
  isPending = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const content = step === 1 ? step1 : step2;

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-1.5rem)] max-w-lg border-destructive/35">
        <AlertDialogHeader className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive"
              aria-hidden
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-2">
              <AlertDialogTitle>{content.title}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>{content.description}</div>
              </AlertDialogDescription>
            </div>
          </div>
          {step === 2 ? (
            <p
              className="rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive"
              role="alert"
            >
              Final confirmation — this cannot be undone.
            </p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Step 1 of 2
            </p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11 w-full sm:w-auto" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          {step === 1 ? (
            <Button
              type="button"
              variant="destructive"
              className={cn("min-h-11 w-full sm:w-auto", portalDestructiveButtonClass)}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              className={cn("min-h-11 w-full sm:w-auto", portalDestructiveButtonClass)}
              disabled={isPending}
              onClick={() => onConfirm()}
            >
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
