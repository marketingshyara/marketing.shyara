import { MapPin, MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/site-config";

const fabClass =
  "size-14 grid place-items-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function FloatingContact() {
  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col gap-3">
      <a
        href={SITE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={`${fabClass} bg-[#25D366] text-white`}
      >
        <MessageCircle className="size-6" />
      </a>
      <a href={`tel:${SITE.phone}`} aria-label={`Call ${SITE.name}`} className={`${fabClass} bg-foreground text-background`}>
        <Phone className="size-6" />
      </a>
      <a
        href={SITE.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions on Google Maps"
        className={`${fabClass} bg-primary text-primary-foreground`}
      >
        <MapPin className="size-6" />
      </a>
    </div>
  );
}
