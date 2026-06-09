import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";
import { Phone, Mail, MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Verdant Heights" },
      { name: "description", content: "Schedule a private tour of Verdant Heights or speak with our sales team." },
      { property: "og:image", content: IMG.exterior2 },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="pt-40 pb-12 md:pt-52 md:pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="reveal text-[11px] tracking-[0.4em] uppercase text-accent">Contact</p>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl md:text-7xl leading-[1] text-balance max-w-3xl">
            Come <em className="text-gold not-italic">visit</em> the experience centre.
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-muted-foreground">
            Our sales gallery is open seven days a week, by appointment. Walk
            through a full-scale 3 BHK and material library before you decide.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-10 pb-24 md:pb-32 grid md:grid-cols-12 gap-12 md:gap-16">
        {/* Form */}
        <div className="md:col-span-7 reveal">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="bg-card border border-border rounded-sm p-6 md:p-10"
          >
            {sent ? (
              <div className="text-center py-14">
                <div className="mx-auto h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center">
                  <Check className="text-gold" />
                </div>
                <h3 className="mt-6 font-serif text-3xl">Thank you.</h3>
                <p className="mt-3 text-muted-foreground">
                  A relationship manager will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                <Field label="Full name" name="name" required />
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Phone" name="phone" type="tel" />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Interested in
                  </label>
                  <select
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-accent outline-none py-3 text-base"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a configuration</option>
                    <option>2 BHK Garden Suite</option>
                    <option>3 BHK Family Residence</option>
                    <option>4 BHK Sky Residence</option>
                    <option>Signature Duplex</option>
                    <option>Not sure yet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-accent outline-none py-3 text-base resize-none"
                    placeholder="Tell us about your timeline or any questions..."
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-xs tracking-widest uppercase text-primary-foreground hover:bg-accent transition-colors w-full sm:w-auto"
                >
                  Request a visit
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Aside */}
        <aside className="md:col-span-5 reveal reveal-delay-1 space-y-10">
          <div className="overflow-hidden rounded-sm aspect-[4/3]">
            <img src={IMG.exterior2} alt="Verdant Heights sales gallery" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6">
            <Info icon={<Phone size={16} />} label="Speak with sales" value="+91 80 4567 8900" />
            <Info icon={<Mail size={16} />} label="Email" value="hello@verdantheights.in" />
            <Info icon={<MapPin size={16} />} label="Sales Gallery" value={`Sector 27, Greenway Avenue\nWhitefield, Bengaluru 560066`} />
          </div>
          <div className="pt-6 border-t border-border">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Hours</p>
            <ul className="text-sm space-y-1.5 text-foreground/80">
              <li>Mon – Sat · 10:00 – 19:00</li>
              <li>Sunday · 11:00 – 17:00</li>
            </ul>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-accent outline-none py-3 text-base"
      />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 text-gold">{icon}</span>
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</p>
        <p className="mt-1.5 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}
