import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLParagraphElement>;

export function BrutalEyebrow({ className, ...props }: Props) {
  return <p className={cn("portal-brutal-eyebrow", className)} {...props} />;
}
