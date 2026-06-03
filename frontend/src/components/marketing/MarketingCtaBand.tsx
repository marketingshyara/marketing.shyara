import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { MotionReveal } from "@/components/marketing/motion/MotionReveal";
import { openWhatsApp } from "@/lib/whatsapp";

interface MarketingCtaBandProps {
  headline: string;
  body: string;
  whatsappMessage: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function MarketingCtaBand({
  headline,
  body,
  whatsappMessage,
  primaryLabel = "Chat on WhatsApp",
  secondaryHref,
  secondaryLabel,
}: MarketingCtaBandProps) {
  return (
    <ScrollSection section="page-cta" className="gradient-cta border-t border-brand-teal/25">
      <div className="container max-w-3xl px-4 py-16 text-center md:py-20">
        <MotionReveal>
          <h2 className="font-display text-display-clamp font-bold">{headline}</h2>
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-md opacity-90">{body}</p>
        </MotionReveal>
        <MotionReveal delay={0.14} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="min-h-[48px] w-full gap-2 bg-brand-coral text-white shadow-lg shadow-brand-coral/25 hover:bg-brand-coral/90 sm:w-auto"
            onClick={() => openWhatsApp(whatsappMessage)}
          >
            <MessageCircle className="h-5 w-5" />
            {primaryLabel}
          </Button>
          {secondaryHref && secondaryLabel && (
            <Button
              size="lg"
              variant="outline"
              className="min-h-[48px] w-full gap-2 border-[hsl(var(--cta-foreground)/0.35)] bg-transparent text-inherit hover:bg-white/10 hover:text-inherit sm:w-auto"
              asChild
            >
              <Link to={secondaryHref}>
                {secondaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </MotionReveal>
      </div>
    </ScrollSection>
  );
}
