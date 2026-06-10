import { memo, useMemo, startTransition, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { WebsiteSampleCard } from "@/components/samples/WebsiteSampleCard";
import { usePreferPosterGrid } from "@/hooks/use-mobile";
import { useWebsiteManifest } from "@/hooks/useWebsiteManifest";
import { setMaxConcurrentIframePreviews } from "@/lib/iframePreviewSlot";
import { samplesPage } from "@/content/samples";
import { cn } from "@/lib/utils";
import { Loader2, FolderOpen, Share2, Check, LayoutGrid } from "lucide-react";
import type { WebsiteSample } from "@/types/samples";
import { sampleCategoriesWithSamples, sampleCategoryIcon } from "@/lib/sampleFilterCategories";

const SamplesGrid = memo(function SamplesGrid({
  samples,
  revealKey,
}: {
  samples: WebsiteSample[];
  revealKey: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      key={revealKey}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {samples.map((sample, i) => (
        <motion.div
          key={sample.id}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
          whileHover={reduce ? undefined : { y: -4 }}
          className="border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0px_0px_#0a0a0a] transition-shadow hover:shadow-[6px_6px_0px_0px_#0a0a0a]"
        >
          <WebsiteSampleCard sample={sample} variant="embedded" />
        </motion.div>
      ))}
    </div>
  );
});

SamplesGrid.displayName = "SamplesGrid";

function ShareButton({ category }: { category?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = category
      ? `${window.location.origin}/work?category=${category}`
      : `${window.location.origin}/work`;

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
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-h-11 items-center gap-2 border-2 border-[#0A0A0A] bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0a0a0a]"
    >
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
    </button>
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
        "inline-flex min-h-11 items-center gap-2 border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all",
        active
          ? "border-[#0A0A0A] bg-[#FF3333] text-white shadow-[3px_3px_0px_0px_#0a0a0a]"
          : "border-[#0A0A0A]/30 bg-white text-[#0A0A0A] hover:border-[#0A0A0A] hover:shadow-[2px_2px_0px_0px_#0a0a0a]"
      )}
    >
      {children}
    </motion.button>
  );
}

export function WorkSamplesGrid() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preferPosterGrid = usePreferPosterGrid();
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

  const filterCategories = useMemo(
    () => sampleCategoriesWithSamples(categories, samples),
    [categories, samples]
  );

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

  const goAll = () => startTransition(() => navigate("/work"));
  const goCategory = (id: string) =>
    startTransition(() => navigate(`/work?category=${id}`));

  return (
    <div data-testid="work-samples-grid">
      <div className="mb-10 border-b-2 border-[#0A0A0A]/10 pb-8">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-[#0A0A0A]/50">
          {samplesPage.filterLabel}
        </p>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className="flex min-w-min flex-wrap items-center justify-center gap-2 px-1 sm:px-0"
              role="tablist"
              aria-label="Filter samples by industry"
            >
              <CategoryPill active={!activeCategory} onClick={goAll}>
                <LayoutGrid className="h-4 w-4" />
                All
              </CategoryPill>
              {filterCategories.map((cat) => {
                const IconComp = sampleCategoryIcon(cat.icon);
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
          </div>
          <ShareButton category={activeCategory || undefined} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#0A0A0A]/60">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#FF3333]" />
          <p>Loading samples…</p>
        </div>
      ) : filteredSamples.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#0A0A0A]/60">
          <FolderOpen className="mb-4 h-12 w-12 opacity-50" />
          <p className="mb-2 text-center">
            {codeFilter
              ? samplesPage.empty.code(codeFilter)
              : activeCategory
                ? samplesPage.empty.category
                : samplesPage.empty.default}
          </p>
          {!codeFilter && !activeCategory && (
            <p className="text-center text-sm">{samplesPage.empty.sub}</p>
          )}
        </div>
      ) : isClinicCategory ? (
        <div className="space-y-12">
          {waitingRoomClinicSamples.length > 0 && (
            <div>
              <h3 className="font-heading mb-6 text-lg font-black uppercase tracking-wide">
                {samplesPage.waitingRoomHeading}
              </h3>
              <p className="mb-6 max-w-2xl text-sm text-[#0A0A0A]/70">{samplesPage.clinicBanner.body}</p>
              <SamplesGrid
                samples={waitingRoomClinicSamples}
                revealKey={`waiting-${activeCategory}`}
              />
            </div>
          )}
          {standardClinicSamples.length > 0 && (
            <div>
              <h3 className="font-heading mb-6 text-lg font-black uppercase tracking-wide">
                {samplesPage.standardClinicHeading}
              </h3>
              <SamplesGrid
                samples={standardClinicSamples}
                revealKey={`standard-${activeCategory}`}
              />
            </div>
          )}
        </div>
      ) : (
        <SamplesGrid samples={filteredSamples} revealKey={activeCategory ?? "all"} />
      )}
    </div>
  );
}
