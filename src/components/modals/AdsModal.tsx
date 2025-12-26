import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";

interface AdsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  "Campaign planning and strategy",
  "Audience targeting and setup",
  "Ad creative support (image creatives included)",
  "Continuous optimization and monitoring",
  "Performance tracking and reporting",
];

export function AdsModal({ open, onOpenChange }: AdsModalProps) {
  const openWhatsApp = (topic?: string) => {
    const message = topic 
      ? `Hi, I'd like to ${topic} for my business.`
      : "Hi, I'd like to discuss Ads Campaign Management.";
    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ads Campaign Management</DialogTitle>
          <DialogDescription className="text-base">
            We handle end-to-end ad campaign management focused on results, 
            transparency, and continuous optimization.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* What We Do */}
          <div>
            <h3 className="text-lg font-semibold mb-4">What We Do</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Model */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Pricing Model</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Management fee:</strong> 20% of the ad budget</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>100% advance payment for management fee</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Free image ad creatives included</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Video ads editing available as an add-on</span>
              </li>
            </ul>
          </div>

          {/* Add-on */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold">Optional Add-on</h3>
            </div>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Ad video editing:</strong> ₹2,000 per video
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            onClick={() => openWhatsApp("add Ad Management")}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Add Ad Management
          </Button>
          <Button 
            variant="outline" 
            onClick={() => openWhatsApp("discuss my campaign")}
            className="flex-1"
          >
            Discuss Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
