import { MessageCircle, Phone } from "lucide-react";

const fabClass =
  "size-14 grid place-items-center rounded-full shadow-glow transition-transform focus-ring motion-safe:hover:scale-105";

export function FloatingContact() {
  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col gap-3">
      <a
        href="https://wa.me/919584661610"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={`${fabClass} bg-[#25D366] text-white`}
      >
        <MessageCircle className="size-6" />
      </a>
      <a
        href="tel:+919584661610"
        aria-label="Call Shyara Auto Care"
        className={`${fabClass} bg-gradient-brand text-primary-foreground`}
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
