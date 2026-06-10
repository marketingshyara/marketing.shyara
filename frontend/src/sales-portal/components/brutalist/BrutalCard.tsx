import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function BrutalCard({ className, ...props }: Props) {
  return <div className={cn("portal-brutal-card p-5 md:p-6", className)} {...props} />;
}
