import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const offerings = [
  {
    name: "Basic App",
    description: "Simple apps with core features.",
    examples: [
      "Business profile app",
      "Portfolio app",
      "Restaurant menu app",
      "Event or booking enquiry app",
      "Educational content or notes app",
      "Community or blog app",
    ],
    cta: "Enquire on WhatsApp",
    ctaMessage: "Hi Shyara Marketing, I need a Basic App for my business (business profile / menu / booking / content type). Can you share the pricing and timeline?",
  },
  {
    name: "Custom App",
    description: "Advanced apps with integrations and scalability.",
    examples: [
      "E-commerce marketplace app",
      "Fintech or banking app",
      "Healthcare management app",
      "Real estate platform",
      "Food delivery app",
      "Fitness tracking app",
      "On-demand service app",
    ],
    cta: "Get Quote on WhatsApp",
    ctaMessage: "Hi Shyara Marketing, I'm looking for a Custom App with advanced features and integrations. I'd like to discuss my requirements and get a quote. When can we talk?",
  },
];

export function AppModal({ open, onOpenChange }: AppModalProps) {
  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">App Development</DialogTitle>
          <DialogDescription className="text-base">
            We design and develop mobile apps that solve real business problems — 
            from simple MVPs to complex platforms.
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
