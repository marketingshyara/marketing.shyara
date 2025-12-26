import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WebsiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const offerings = [
  {
    name: "Basic Website",
    description: "Ideal for small businesses and personal brands.",
    examples: [
      "Personal portfolio",
      "Local business website",
      "Consultant or coach website",
      "Wedding or event website",
    ],
    cta: "Add Basic Site",
    ctaMessage: "add a Basic Website",
  },
  {
    name: "E-commerce / Booking Website",
    description: "For businesses that need online payments or bookings.",
    examples: [
      "Online clothing store",
      "Salon or clinic booking system",
      "Restaurant ordering & table booking",
      "Yoga or fitness class booking",
    ],
    cta: "Add E-commerce Site",
    ctaMessage: "add an E-commerce Website",
  },
  {
    name: "Custom Website",
    description: "Fully customized solutions for advanced requirements.",
    examples: [
      "Social media platform",
      "Online marketplace",
      "Learning management system (LMS)",
      "Healthcare or construction project portal",
    ],
    cta: "Get Custom Quote",
    ctaMessage: "get a quote for a Custom Website",
  },
];

export function WebsiteModal({ open, onOpenChange }: WebsiteModalProps) {
  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(`Hi, I'd like to ${message}.`)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Website Development</DialogTitle>
          <DialogDescription className="text-base">
            We build fast, functional, and business-focused websites that are 
            designed to convert and scale.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {offerings.map((offering) => (
            <div
              key={offering.name}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{offering.name}</h3>
              <p className="text-muted-foreground mb-4">{offering.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {offering.examples.map((example, index) => (
                    <span 
                      key={index}
                      className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => openWhatsApp(offering.ctaMessage)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {offering.cta}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
