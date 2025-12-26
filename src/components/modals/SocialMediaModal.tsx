import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SocialMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Basic",
    price: "₹15,000",
    period: "/ Month",
    description: "Ideal for businesses starting their social media journey.",
    features: [
      "20 image posts per month",
      "2 video posts per month",
      "Weekly video content (alternate Saturdays)",
      "Basic community engagement (comments & messages)",
      "Trend-based content ideas",
      "Monthly performance summary",
    ],
  },
  {
    name: "Premium",
    price: "₹18,000",
    period: "/ Month",
    description: "Best for growing brands that need consistent visibility and engagement.",
    features: [
      "25 image posts per month",
      "4 video posts per month",
      "Structured content strategy",
      "Advanced community engagement",
      "Story posting and highlights management",
      "Analytics and performance reports",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "₹25,000",
    period: "/ Month",
    description: "Designed for brands that want aggressive growth and strong content presence.",
    features: [
      "15 image posts per month",
      "15 video posts per month",
      "Premium video content creation",
      "Multi-platform management",
      "Dedicated account manager",
      "Detailed performance reporting",
    ],
  },
];

export function SocialMediaModal({ open, onOpenChange }: SocialMediaModalProps) {
  const openWhatsApp = (plan?: string) => {
    const message = plan 
      ? `Hi, I'm interested in the ${plan} plan for Social Media Management.`
      : "Hi, I'd like to discuss Social Media Management services.";
    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Social Media Management</DialogTitle>
          <DialogDescription className="text-base">
            We manage your brand's social media presence with a structured approach — 
            focusing on consistency, engagement, and content that aligns with your business goals.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${
                plan.popular 
                  ? "border-accent bg-accent/5" 
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => openWhatsApp(plan.name)}
                className={`w-full ${
                  plan.popular 
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => openWhatsApp()}>
            Talk to Us
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
