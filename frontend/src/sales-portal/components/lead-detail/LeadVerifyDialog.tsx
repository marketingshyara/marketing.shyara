import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useVerifyPaymentMutation } from "../../hooks/useSalesQueries";

const VERIFY_ADMIN_NOTE_MAX = 2000;

type Props = {
  leadId: string;
  paymentId: string;
};

function noteOrNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

/**
 * Admin-only verify/reject controls for a single pending payment. Encapsulates both the verify
 * and reject alert dialogs so the payments table doesn't need to manage their state. Closing a
 * dialog resets its note draft so we never leak text between two payments.
 */
export function LeadVerifyDialog({ leadId, paymentId }: Props) {
  const verify = useVerifyPaymentMutation(leadId);
  const pending = verify.isPending;
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  return (
    <div className="flex flex-wrap gap-2">
      <AlertDialog
        open={verifyOpen}
        onOpenChange={(o) => {
          setVerifyOpen(o);
          if (!o) setVerifyNote("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button size="sm" className="min-h-11" disabled={pending}>
            Verify
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Marks this payment as verified and updates the lead per portal rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`verify-note-${paymentId}`}>Admin note (optional)</Label>
            <Textarea
              id={`verify-note-${paymentId}`}
              maxLength={VERIFY_ADMIN_NOTE_MAX}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              rows={3}
              className="resize-y"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() =>
                verify.mutate(
                  {
                    paymentId,
                    body: { decision: "VERIFIED", adminNote: noteOrNull(verifyNote) }
                  },
                  {
                    onSuccess: () => {
                      toast.success("Payment verified.");
                      setVerifyOpen(false);
                    }
                  }
                )
              }
            >
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          setRejectOpen(o);
          if (!o) setRejectNote("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" className="min-h-11" disabled={pending}>
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject payment?</AlertDialogTitle>
            <AlertDialogDescription>
              The payment will stay on record as rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reject-note-${paymentId}`}>Admin note (optional)</Label>
            <Textarea
              id={`reject-note-${paymentId}`}
              maxLength={VERIFY_ADMIN_NOTE_MAX}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="resize-y"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                verify.mutate(
                  {
                    paymentId,
                    body: { decision: "REJECTED", adminNote: noteOrNull(rejectNote) }
                  },
                  {
                    onSuccess: () => {
                      toast.success("Payment rejected.");
                      setRejectOpen(false);
                    }
                  }
                )
              }
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
