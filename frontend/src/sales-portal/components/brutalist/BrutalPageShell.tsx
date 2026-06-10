import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function BrutalPageShell({ className, ...props }: Props) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8", className)}
      {...props}
    />
  );
}
