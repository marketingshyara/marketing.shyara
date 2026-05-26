import { passwordCopy, portalSupportEmail } from "../../lib/passwordCopy";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function SignInHelpCard({ className }: Props) {
  const supportEmail = portalSupportEmail();

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-muted/30 p-4 text-left text-sm text-muted-foreground",
        className
      )}
      aria-labelledby="sign-in-help-title"
    >
      <h2 id="sign-in-help-title" className="text-sm font-semibold text-foreground">
        {passwordCopy.signInHelpTitle}
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>{passwordCopy.signInHelpStep1}</li>
        <li>{passwordCopy.signInHelpStep2}</li>
        <li>{passwordCopy.signInHelpStep3}</li>
      </ol>
      {supportEmail ? (
        <p className="mt-3 text-xs">
          {passwordCopy.signInHelpSupportPrefix}{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {supportEmail}
          </a>
        </p>
      ) : null}
    </section>
  );
}
