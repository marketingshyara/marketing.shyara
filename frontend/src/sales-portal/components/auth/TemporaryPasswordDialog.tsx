import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { passwordCopy } from "../../lib/passwordCopy";

type Props = {
  password: string | null;
  onOpenChange: (open: boolean) => void;
};

export function TemporaryPasswordDialog({ password, onOpenChange }: Props) {
  return (
    <Dialog open={password !== null} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="temp-password-desc" className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{passwordCopy.temporaryPasswordDialogTitle}</DialogTitle>
          <DialogDescription id="temp-password-desc">
            {passwordCopy.temporaryPasswordDialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input readOnly className="min-h-11 font-mono text-sm" value={password ?? ""} />
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 shrink-0 touch-manipulation"
            onClick={() => {
              if (password) {
                void navigator.clipboard.writeText(password);
                toast.success(passwordCopy.temporaryPasswordCopiedToast);
              }
            }}
          >
            {passwordCopy.temporaryPasswordCopy}
          </Button>
        </div>
        <Button
          type="button"
          className="min-h-11 w-full touch-manipulation"
          onClick={() => onOpenChange(false)}
        >
          {passwordCopy.temporaryPasswordDone}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
