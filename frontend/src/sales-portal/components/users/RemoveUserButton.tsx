import { useState } from "react";
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
import { useArchiveUserMutation } from "../../hooks/useSalesQueries";

type Props = {
  userId: string;
  email: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function RemoveUserButton({ userId, email, disabled, disabledReason }: Props) {
  const [open, setOpen] = useState(false);
  const archive = useArchiveUserMutation();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={disabled || archive.isPending}
          title={disabled ? disabledReason : undefined}
        >
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-1.5rem)] max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove user?</AlertDialogTitle>
          <AlertDialogDescription>
            This moves <span className="font-medium text-foreground">{email}</span> to Past users.
            They cannot sign in. Their clients and commissions stay in the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11 w-full sm:w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11 w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            disabled={archive.isPending}
            onClick={(e) => {
              e.preventDefault();
              archive.mutate(userId, { onSuccess: () => setOpen(false) });
            }}
          >
            {archive.isPending ? "Removing…" : "Remove user"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
