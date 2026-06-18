import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useArchiveUserMutation } from "../../hooks/useSalesQueries";
import {
  portalDestructiveButtonClass,
  TwoStepDestructiveDialog
} from "../ui/TwoStepDestructiveDialog";

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
    <TwoStepDestructiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="destructive"
          className={cn("min-h-11", portalDestructiveButtonClass)}
          disabled={disabled || archive.isPending}
          title={disabled ? disabledReason : undefined}
        >
          Remove
        </Button>
      }
      step1={{
        title: "Remove this user?",
        description: (
          <>
            You are about to permanently delete{" "}
            <span className="font-semibold text-foreground">{email}</span>. They will be removed
            from the portal and their email can be used to create a new account later.
          </>
        )
      }}
      step2={{
        title: "Confirm user removal?",
        description: (
          <>
            Last chance: permanently delete{" "}
            <span className="font-semibold text-foreground">{email}</span>? Their leads stay in
            the system (reassigned to you); their commission rows for payout are removed.
          </>
        )
      }}
      confirmLabel="Yes, remove user"
      pendingLabel="Removing…"
      onConfirm={() =>
        archive.mutate(userId, {
          onSuccess: () => setOpen(false)
        })
      }
      isPending={archive.isPending}
    />
  );
}
