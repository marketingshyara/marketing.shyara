import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { BrutalButton } from "../brutalist/BrutalButton";
import {
  portalDialogSurfaceClass
} from "../ui/portalDialogStyles";
import { useBulkDeleteLeadsMutation, useDeleteLeadMutation } from "../../hooks/useSalesQueries";

type Props = {
  leadIds: string[];
  clientNames: string[];
  triggerLabel?: string;
  variant?: "secondary" | "listRow" | "ghost" | "destructive";
  className?: string;
  onDeleted?: () => void;
};

export function DeleteLeadsDialog({
  leadIds,
  clientNames,
  triggerLabel,
  variant = "secondary",
  className,
  onDeleted
}: Props) {
  const [open, setOpen] = useState(false);
  const single = leadIds.length === 1;
  const deleteOne = useDeleteLeadMutation();
  const deleteMany = useBulkDeleteLeadsMutation();
  const pending = deleteOne.isPending || deleteMany.isPending;

  const title = single ? "Delete prospect?" : `Delete ${leadIds.length} prospects?`;
  const description = single
    ? `${clientNames[0] ?? "This prospect"} will be removed permanently. This cannot be undone.`
    : `${leadIds.length} prospects will be removed permanently. Converted clients, verified payments, and active projects cannot be deleted.`;

  const handleConfirm = () => {
    if (single) {
      deleteOne.mutate(leadIds[0]!, {
        onSuccess: () => {
          setOpen(false);
          onDeleted?.();
        }
      });
      return;
    }
    deleteMany.mutate(
      { ids: leadIds },
      {
        onSuccess: (data) => {
          if (data.deleted.length > 0) {
            setOpen(false);
            onDeleted?.();
          }
        }
      }
    );
  };

  const defaultLabel = single ? "Delete" : `Delete (${leadIds.length})`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <BrutalButton
          type="button"
          variant={variant === "destructive" ? "destructive" : variant === "ghost" ? "ghost" : "secondary"}
          className={cn(
            variant === "listRow" && "min-h-11 w-full justify-start text-sm font-medium",
            className
          )}
        >
          {variant !== "listRow" && <Trash2 className="mr-2 h-4 w-4" aria-hidden />}
          {triggerLabel ?? defaultLabel}
        </BrutalButton>
      </AlertDialogTrigger>
      <AlertDialogContent className={portalDialogSurfaceClass}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {!single && clientNames.length > 0 && clientNames.length <= 5 ? (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {clientNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : null}
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11" disabled={pending}>
            Cancel
          </AlertDialogCancel>
          <BrutalButton
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? "Deleting…" : single ? "Delete prospect" : "Delete selected"}
          </BrutalButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
