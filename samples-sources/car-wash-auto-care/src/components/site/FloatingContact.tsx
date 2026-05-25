import { MessageCircle, Phone } from "lucide-react";

export function FloatingContact() {
  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col gap-3">
      <a
        href="https://wa.me/919584661610"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="size-14 grid place-items-center rounded-full bg-[#25D366] text-white shadow-glow hover:scale-110 transition-transform"
      >
        <MessageCircle className="size-6" />
      </a>
      <a
        href="tel:+919584661610"
        aria-label="Call Shyara Auto Care"
        className="size-14 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow hover:scale-110 transition-transform"
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
