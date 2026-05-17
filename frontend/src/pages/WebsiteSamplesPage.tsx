import { memo, useMemo, startTransition, useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { WebsiteSampleCard } from "@/components/samples/WebsiteSampleCard";
import { Loader2, FolderOpen, Share2, Check, ArrowLeft } from "lucide-react";
import { UtensilsCrossed, Stethoscope, Stars, LayoutGrid, GraduationCap } from "lucide-react";
import type { WebsiteSample, SampleCategory, WebsitesManifest } from "@/types/samples";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Stethoscope,
  Stars,
  GraduationCap,
};

function useWebsiteManifest() {
  const [categories, setCategories] = useState<SampleCategory[]>([]);
  const [samples, setSamples] = useState<WebsiteSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManifest() {
      try {
        setLoading(true);
        const response = await fetch("/samples/websites/manifest.json");
        if (!response.ok) {
          setCategories([]);
          setSamples([]);
          return;
        }
        const data: WebsitesManifest = await response.json();
        setCategories(data.categories || []);
        setSamples(data.samples || []);
      } catch {
        setCategories([]);
        setSamples([]);
      } finally {
        setLoading(false);
      }
    }
    loadManifest();
  }, []);

  return { categories, samples, loading };
}

const SamplesGrid = memo(function SamplesGrid({ samples }: { samples: WebsiteSample[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {samples.map((sample) => (
        <WebsiteSampleCard key={sample.id} sample={sample} />
      ))}
    </div>
  );
});

SamplesGrid.displayName = "SamplesGrid";

function ShareButton({ category }: { category?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = category
      ? `${window.location.origin}/samples/websites?category=${category}`
      : `${window.location.origin}/samples/websites`;

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
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Link Copied!
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

export default function WebsiteSamplesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories, samples, loading } = useWebsiteManifest();

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
      isClinicCategory ? filteredSamples.filter((sample) => sample.clinicExperience === "waiting-room") : [],
    [filteredSamples, isClinicCategory]
  );

  const standardClinicSamples = useMemo(
    () =>
      isClinicCategory ? filteredSamples.filter((sample) => sample.clinicExperience !== "waiting-room") : [],
    [filteredSamples, isClinicCategory]
  );

  const activeCategoryData = useMemo(
    () => (activeCategory ? categories.find((c) => c.id === activeCategory) : null),
    [categories, activeCategory]
  );

  const goWebsites = () => startTransition(() => navigate("/samples/websites"));
  const goWebsitesCategory = (id: string) =>
    startTransition(() => navigate(`/samples/websites?category=${id}`));

  const pageTitle = activeCategoryData
    ? `${activeCategoryData.name} Website Samples`
    : "Website Samples";

  const pageDescription =
    activeCategory === "clinics"
      ? "Explore clinic website samples segmented by waiting-room enabled and standard builds. Waiting-room samples include QR flows to doctors, blogs, and clinic details."
      : activeCategoryData
        ? `Explore our portfolio of ${activeCategoryData.name.toLowerCase()} websites. Click on any preview to see the full website.`
        : "Explore our portfolio of professionally designed websites across different industries.";

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={activeCategory ? `/samples/websites?category=${activeCategory}` : "/samples/websites"}
        keywords="website samples, web design portfolio, website examples, professional websites"
      />

      <section className="py-12 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              to="/samples"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Samples
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{pageTitle}</h1>
            <p className="text-lg text-muted-foreground">{pageDescription}</p>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goWebsites}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !activeCategory
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                All
              </button>
              {categories.map((cat) => {
                const IconComp = iconMap[cat.icon];
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => goWebsitesCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {IconComp && <IconComp className="h-4 w-4" />}
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <ShareButton category={activeCategory || undefined} />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading samples...</p>
              </div>
            ) : filteredSamples.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center mb-2">
                  {codeFilter
                    ? `No sample found for code ${codeFilter}.`
                    : activeCategory
                      ? "No samples in this category yet."
                      : "Website samples coming soon!"}
                </p>
                <p className="text-sm text-center opacity-75">We're preparing our portfolio for you to explore.</p>
              </div>
            ) : isClinicCategory ? (
              <div className="space-y-10">
                <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
                  <h3 className="text-lg font-semibold text-foreground">Clinic Waiting Room Flow</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Waiting-room enabled samples support a QR journey where patients can scan in-clinic and open a
                    dedicated page with doctor profiles, blogs, and helpful clinic information while they wait.
                    Non-waiting-room clinic samples are listed separately below.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Waiting Room Enabled</h3>
                    <p className="text-sm text-muted-foreground">{waitingRoomClinicSamples.length} samples</p>
                  </div>
                  {waitingRoomClinicSamples.length > 0 ? (
                    <SamplesGrid samples={waitingRoomClinicSamples} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-10 px-6 text-center text-sm text-muted-foreground">
                      No waiting-room clinic samples added yet.
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Standard Clinic Websites</h3>
                    <p className="text-sm text-muted-foreground">{standardClinicSamples.length} samples</p>
                  </div>
                  {standardClinicSamples.length > 0 ? (
                    <SamplesGrid samples={standardClinicSamples} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-10 px-6 text-center text-sm text-muted-foreground">
                      Non-waiting-room clinic samples will appear here.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SamplesGrid samples={filteredSamples} />
            )}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Want a Website Like These?</h2>
            <p className="text-muted-foreground mb-6">
              Let us build a stunning website tailored to your business. Get in touch today.
            </p>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => {
                window.open(
                  "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27ve%20gone%20through%20your%20website%20samples%20and%20I%27m%20interested%20in%20getting%20a%20website%20built%20for%20my%20business.%20Can%20we%20discuss%20what%20would%20work%20best%20for%20me%3F",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Talk to Us on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
