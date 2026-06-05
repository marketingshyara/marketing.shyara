import { useState } from "react";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useMarkNotInterestedMutation } from "../../hooks/useSalesQueries";

type Props = {
  leadId: string;
  clientName: string;
  variant?: "icon" | "outline" | "listRow";
  onMarked?: () => void;
};

export function MarkNotInterestedButton({
  leadId,
  clientName,
  variant = "outline",
  onMarked
}: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const mark = useMarkNotInterestedMutation();

  const handleConfirm = () => {
    const trimmed = note.trim();
    mark.mutate(
      { leadId, note: trimmed || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setNote("");
          onMarked?.();
        }
      }
    );
  };

  const trigger =
    variant === "icon" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11"
        aria-label={`Mark ${clientName} not interested`}
        disabled={mark.isPending}
      >
        <UserX className="h-4 w-4" aria-hidden />
      </Button>
    ) : variant === "listRow" ? (
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:w-auto"
        disabled={mark.isPending}
      >
        Not interested
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        className={cn("min-h-11 w-full sm:w-auto")}
        disabled={mark.isPending}
      >
        Not interested
      </Button>
    );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-1.5rem)] max-w-lg">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>Mark as not interested?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">{clientName}</span> will be removed
                from your active Prospects list. You can restore them anytime from Not interested.
              </p>
              <div className="space-y-2">
                <Label htmlFor={`ni-note-${leadId}`}>Note (optional)</Label>
                <Textarea
                  id={`ni-note-${leadId}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Why they passed, timing, follow-up later…"
                  className="resize-none"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="min-h-11 w-full sm:w-auto" disabled={mark.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={mark.isPending}
          >
            {mark.isPending ? "Saving…" : "Mark not interested"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
