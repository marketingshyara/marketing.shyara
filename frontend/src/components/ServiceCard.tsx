import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { brandToneClasses, type BrandTone } from "@/lib/brandColors";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  ctaLabel?: string;
  tone?: BrandTone;
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  ctaLabel = "View Details",
  tone = "emerald",
}: ServiceCardProps) {
  const chroma = brandToneClasses[tone];

  const content = (
    <Card
      className={cn(
        "group h-full shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300",
        chroma.border
      )}
    >
      <CardHeader className="pb-4">
        <div className={cn("icon-well-lg mb-4 transition-colors", chroma.well, chroma.wellHover)}>
          <Icon className={cn("h-8 w-8", chroma.text)} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-small leading-relaxed mt-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            "flex items-center gap-2 text-small font-semibold group-hover:gap-3 transition-all",
            chroma.text
          )}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="w-full text-left rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default"
    >
      {content}
    </button>
  );
}
