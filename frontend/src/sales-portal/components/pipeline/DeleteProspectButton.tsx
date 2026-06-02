import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useDeleteLeadMutation } from "../../hooks/useSalesQueries";

type Props = {
  leadId: string;
  clientName: string;
  variant?: "icon" | "destructive" | "listRow";
  onDeleted?: () => void;
};

export function DeleteProspectButton({
  leadId,
  clientName,
  variant = "icon",
  onDeleted
}: Props) {
  const [open, setOpen] = useState(false);
  const del = useDeleteLeadMutation();

  const handleConfirm = () => {
    del.mutate(leadId, {
      onSuccess: () => {
        setOpen(false);
        onDeleted?.();
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-muted-foreground hover:text-destructive"
            aria-label={`Delete prospect ${clientName}`}
            disabled={del.isPending}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        ) : variant === "listRow" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={del.isPending}
          >
            Delete
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 w-full sm:w-auto"
            disabled={del.isPending}
          >
            Delete prospect
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-1.5rem)] max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete prospect?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes <span className="font-medium text-foreground">{clientName}</span>{" "}
            and any pending payment records. You cannot undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11 w-full sm:w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11 w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            disabled={del.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {del.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
