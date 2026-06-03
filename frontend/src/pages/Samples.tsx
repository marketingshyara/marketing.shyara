import { memo, useMemo, startTransition, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { MotionReveal } from "@/components/marketing/motion/MotionReveal";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion/StaggerChildren";
import { useRevealOnScroll } from "@/components/marketing/motion/useRevealOnScroll";
import { WebsiteSampleCard } from "@/components/samples/WebsiteSampleCard";
import { usePreferPosterGrid } from "@/hooks/use-mobile";
import { useWebsiteManifest } from "@/hooks/useWebsiteManifest";
import { setMaxConcurrentIframePreviews } from "@/lib/iframePreviewSlot";
import { samplesPage } from "@/content/samples";
import { samplesWhatsAppMessages } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Loader2, FolderOpen, Share2, Check, LayoutGrid } from "lucide-react";
import { UtensilsCrossed, Stethoscope, Stars, GraduationCap, Dumbbell, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WebsiteSample } from "@/types/samples";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Stethoscope,
  Stars,
  GraduationCap,
  Dumbbell,
  Car,
};

const SamplesGrid = memo(function SamplesGrid({ samples }: { samples: WebsiteSample[] }) {
  const reduce = useReducedMotion();

  return (
    <StaggerChildren
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      stagger={0.06}
    >
      {samples.map((sample) => (
        <StaggerItem key={sample.id}>
          <motion.div
            whileHover={reduce ? undefined : { y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <WebsiteSampleCard sample={sample} />
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
});

SamplesGrid.displayName = "SamplesGrid";

function ShareButton({ category }: { category?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = category
      ? `${window.location.origin}/samples?category=${category}`
      : `${window.location.origin}/samples`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 min-h-11">
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-emerald text-white shadow-sm shadow-brand-emerald/20"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {children}
    </motion.button>
  );
}

export default function Samples() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preferPosterGrid = usePreferPosterGrid();
  const filterRef = useRevealOnScroll({ direction: "up", stagger: 0.06 });
  const { categories, samples, loading } = useWebsiteManifest();

  useEffect(() => {
    setMaxConcurrentIframePreviews(preferPosterGrid ? 1 : 3);
  }, [preferPosterGrid]);

  const activeCategory = searchParams.get("category") || null;
  const codeFilter = searchParams.get("code")?.trim().toUpperCase() ?? "";

  const filteredSamples = useMemo(() => {
    let list = activeCategory ? samples.filter((s) => s.category === activeCategory) : samples;
    if (codeFilter) {
      list = list.filter((s) => s.displayCode.toUpperCase() === codeFilter);
    }
    return list;
  }, [samples, activeCategory, codeFilter]);

  const isClinicCategory = activeCategory === "clinics";

  const waitingRoomClinicSamples = useMemo(
    () =>
      isClinicCategory ? filteredSamples.filter((s) => s.clinicExperience === "waiting-room") : [],
    [filteredSamples, isClinicCategory]
  );

  const standardClinicSamples = useMemo(
    () =>
      isClinicCategory ? filteredSamples.filter((s) => s.clinicExperience !== "waiting-room") : [],
    [filteredSamples, isClinicCategory]
  );

  const activeCategoryData = useMemo(
    () => (activeCategory ? categories.find((c) => c.id === activeCategory) : null),
    [categories, activeCategory]
  );

  const goAll = () => startTransition(() => navigate("/samples"));
  const goCategory = (id: string) =>
    startTransition(() => navigate(`/samples?category=${id}`));

  const pageTitle = activeCategoryData
    ? `${activeCategoryData.name} samples`
    : "Website samples";

  const pageDescription = activeCategoryData
    ? `Live ${activeCategoryData.name.toLowerCase()} website previews you can open and explore.`
    : samplesPage.description;

  const seoCanonical = activeCategory ? `/samples?category=${activeCategory}` : "/samples";

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={seoCanonical}
        keywords="website samples, website portfolio, web design examples, live website previews, business website examples"
      />

      <MarketingPageHero
        label={samplesPage.label}
        title={
          <>
            {samplesPage.title}{" "}
            <span className="text-brand-emerald">{samplesPage.titleAccent}</span>
          </>
        }
        description={pageDescription}
        trustPoints={[...samplesPage.trustPoints]}
      />

      <ScrollSection section="samples-filters" className="surface-sky border-b border-border/40">
        <div ref={filterRef} className="container py-8 md:py-10">
          <p className="section-label mb-4 text-center" data-reveal>
            {samplesPage.filterLabel}
          </p>
          <div
            className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row"
            data-reveal
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <CategoryPill active={!activeCategory} onClick={goAll}>
                <LayoutGrid className="h-4 w-4" />
                All
              </CategoryPill>
              {categories.map((cat) => {
                const IconComp = iconMap[cat.icon];
                return (
                  <CategoryPill
                    key={cat.id}
                    active={activeCategory === cat.id}
                    onClick={() => goCategory(cat.id)}
                  >
                    {IconComp && <IconComp className="h-4 w-4" />}
                    {cat.name}
                  </CategoryPill>
                );
              })}
            </div>
            <ShareButton category={activeCategory || undefined} />
          </div>
        </div>
      </ScrollSection>

      <ScrollSection section="samples-grid" className="bg-background py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            {loading ? (
              <MotionReveal className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-emerald" />
                <p>Loading samples…</p>
              </MotionReveal>
            ) : filteredSamples.length === 0 ? (
              <MotionReveal className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FolderOpen className="mb-4 h-12 w-12 opacity-50" />
                <p className="mb-2 text-center">
                  {codeFilter
                    ? samplesPage.empty.code(codeFilter)
                    : activeCategory
                      ? samplesPage.empty.category
                      : samplesPage.empty.default}
                </p>
                <p className="text-center text-sm opacity-75">{samplesPage.empty.sub}</p>
              </MotionReveal>
            ) : isClinicCategory ? (
              <div className="space-y-10">
                <MotionReveal>
                  <div className="rounded-2xl border border-brand-emerald/25 bg-brand-emerald/5 p-5 md:p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {samplesPage.clinicBanner.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {samplesPage.clinicBanner.body}
                    </p>
                  </div>
                </MotionReveal>

                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {samplesPage.waitingRoomHeading}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {waitingRoomClinicSamples.length} samples
                    </p>
                  </div>
                  {waitingRoomClinicSamples.length > 0 ? (
                    <SamplesGrid samples={waitingRoomClinicSamples} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-10 px-6 text-center text-sm text-muted-foreground">
                      No waiting-room clinic samples yet.
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {samplesPage.standardClinicHeading}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {standardClinicSamples.length} samples
                    </p>
                  </div>
                  {standardClinicSamples.length > 0 ? (
                    <SamplesGrid samples={standardClinicSamples} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-10 px-6 text-center text-sm text-muted-foreground">
                      Standard clinic samples will appear here.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SamplesGrid samples={filteredSamples} />
            )}
          </div>
        </div>
      </ScrollSection>

      <MarketingCtaBand
        headline={samplesPage.cta.headline}
        body={samplesPage.cta.body}
        whatsappMessage={samplesWhatsAppMessages.cta}
        primaryLabel={samplesPage.cta.primary}
      />
    </Layout>
  );
}
