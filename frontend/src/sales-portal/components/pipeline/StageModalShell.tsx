import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional; prefer field-level helpers when possible */
  description?: string;
  /** Shown below title (e.g. status chip) */
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Responsive stage modal: full-width on mobile, scrollable body, safe-area padding.
 */
export function StageModalShell({
  open,
  onOpenChange,
  title,
  description,
  headerExtra,
  children,
  footer,
  className
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "flex max-h-[min(90dvh,calc(100dvh-2rem))] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 touch-manipulation sm:w-full",
          className
        )}
      >
        <DialogHeader className="shrink-0 space-y-2 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>
          {headerExtra}
          {description ? (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {children}
        </div>
        {footer ? (
          <DialogFooter className="shrink-0 flex-col gap-2 border-t px-4 py-4 sm:px-6">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end [&_button]:min-h-11 [&_button]:w-full sm:[&_button]:w-auto">
              {footer}
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
