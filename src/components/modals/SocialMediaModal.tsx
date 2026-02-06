import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface SocialMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Features included in every plan
const commonFeatures = [
  "Zero Hidden Fees on Ads - 100% of your ad budget goes to your ads",
  "Daily Story Content to keep your brand top-of-mind",
  "Full Community Management - we respond to comments, DMs & reviews for you",
  "Trend-First Strategy - stay relevant with viral-ready content",
  "Detailed Monthly Reports with actionable insights",
];

// Plan-specific features and pricing
const plans = [
  {
    name: "Starter",
    price: "₹7,999",
    period: "/ Month",
    description: "Launch your brand online with a strong, consistent presence.",
    features: [
      "8 Scroll-Stopping Reels/month",
      "12 Professionally Designed Posts/month",
    ],
  },
  {
    name: "Growth",
    price: "₹14,999",
    period: "/ Month",
    description: "Dominate your niche with high-volume content and smart ad strategies.",
    features: [
      "16 Viral-Ready Reels/month",
      "16 Professionally Designed Posts/month",
      "Strategic Ad Planning before every campaign",
    ],
    popular: true,
  },
  {
    name: "Scale",
    price: "₹25,000",
    period: "/ Month",
    description: "The complete social media department for brands ready to lead their industry.",
    features: [
      "16 Premium Reels/month",
      "32 High-Impact Posts/month",
      "Multi-Platform Optimization",
      "Quarterly Growth Roadmap with industry insights",
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
            Transform your brand into a social media powerhouse. We handle everything - 
            from scroll-stopping content to building a loyal community - so you can focus on running your business.
          </DialogDescription>
        </DialogHeader>

        {/* Common Features Section */}
        <div className="mt-6 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="text-base font-semibold text-accent">Premium Benefits with Every Plan</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col ${
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
              
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  What you get
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Button 
                  onClick={() => openWhatsApp(plan.name)}
                  className={`w-full ${
                    plan.popular 
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  Choose This Plan
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => openWhatsApp()}>
            Need a Custom Plan?
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
