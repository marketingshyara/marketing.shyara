import { cn } from "@/lib/utils";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

export function BrutalLabel({ className, ...props }: Props) {
  return (
    <label
      className={cn("text-xs font-bold uppercase tracking-[0.12em] text-[#0A0A0A]", className)}
      {...props}
    />
  );
}
