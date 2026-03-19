import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, FolderOpen, Share2, Check, ArrowLeft, MessageCircle } from "lucide-react";
import {
  UtensilsCrossed, Stethoscope, Stars, LayoutGrid, GraduationCap,
} from "lucide-react";
import type { WebsiteSample, SampleCategory, WebsitesManifest } from "@/types/samples";

// Icon mapping from string names in manifest to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Stethoscope,
  Stars,
  GraduationCap,
};

// Hook to load manifest data
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

// Sample card with iframe preview
function WebsiteSampleCard({ sample }: { sample: WebsiteSample }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const sampleUrl = `/samples/websites/${sample.folder}/`;
  const hasWaitingRoom = sample.category === "clinics" && sample.clinicExperience === "waiting-room";
  const waitingRoomPath = (sample.waitingRoomPath || "waiting").replace(/^\/+/, "");
  const waitingRoomUrl = hasWaitingRoom ? `${sampleUrl}${waitingRoomPath}` : null;

  const openInNewTab = () => {
    window.open(sampleUrl, "_blank");
  };

  const openWaitingRoomInNewTab = () => {
    if (waitingRoomUrl) {
      window.open(waitingRoomUrl, "_blank");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%]">
          <iframe
            src={sampleUrl}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            title={sample.name}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button onClick={openInNewTab} className="bg-white text-black hover:bg-gray-100">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Site
          </Button>
        </div>
      </div>
      <div className="p-4">
        {(sample.clinicType || sample.category === "clinics") && (
          <div className="flex flex-wrap gap-2 mb-2">
            {sample.clinicType && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {sample.clinicType}
              </span>
            )}
            {sample.category === "clinics" && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                hasWaitingRoom
                  ? "bg-accent/15 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
              >
                {hasWaitingRoom ? "Waiting Room + QR" : "Standard Clinic Website"}
              </span>
            )}
          </div>
        )}
        <h3 className="font-semibold text-foreground mb-1">{sample.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{sample.description}</p>
        <div className={`grid gap-2 mt-3 ${waitingRoomUrl ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button variant="outline" size="sm" className="flex-1" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {waitingRoomUrl && (
            <Button variant="outline" size="sm" className="flex-1" onClick={openWaitingRoomInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Waiting Room
            </Button>
          )}
          <Button
            size="sm"
            className={`bg-[#25D366] hover:bg-[#1fb855] text-white ${waitingRoomUrl ? "col-span-2" : ""}`}
            onClick={() => {
              const msg = `Hi Shyara Marketing, I just viewed the "${sample.name}" sample on your website and I'd like something similar for my business. Can we discuss the scope, timeline, and pricing?`;
              window.open(`https://wa.me/919584661610?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Inquire
          </Button>
        </div>
      </div>
    </div>
  );
}

function SamplesGrid({ samples }: { samples: WebsiteSample[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {samples.map((sample) => (
        <WebsiteSampleCard key={sample.id} sample={sample} />
      ))}
    </div>
  );
}

// Share button component
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
      // Fallback for older browsers
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
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

  const filteredSamples = activeCategory
    ? samples.filter((s) => s.category === activeCategory)
    : samples;
  const isClinicCategory = activeCategory === "clinics";
  const waitingRoomClinicSamples = isClinicCategory
    ? filteredSamples.filter((sample) => sample.clinicExperience === "waiting-room")
    : [];
  const standardClinicSamples = isClinicCategory
    ? filteredSamples.filter((sample) => sample.clinicExperience !== "waiting-room")
    : [];

  const activeCategoryData = activeCategory
    ? categories.find((c) => c.id === activeCategory)
    : null;

  const pageTitle = activeCategoryData
    ? `${activeCategoryData.name} Website Samples`
    : "Website Samples";

  const pageDescription = activeCategory === "clinics"
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

      {/* Hero Section */}
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {pageTitle}
            </h1>
            <p className="text-lg text-muted-foreground">{pageDescription}</p>
          </div>
        </div>
      </section>

      {/* Category Filter + Share */}
      <section className="pb-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/samples/websites")}
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
                    key={cat.id}
                    onClick={() => navigate(`/samples/websites?category=${cat.id}`)}
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

            {/* Share button */}
            <ShareButton category={activeCategory || undefined} />
          </div>
        </div>
      </section>

      {/* Samples Grid */}
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
                  {activeCategory
                    ? "No samples in this category yet."
                    : "Website samples coming soon!"}
                </p>
                <p className="text-sm text-center opacity-75">
                  We're preparing our portfolio for you to explore.
                </p>
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

      {/* CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Want a Website Like These?
            </h2>
            <p className="text-muted-foreground mb-6">
              Let us build a stunning website tailored to your business. Get in touch today.
            </p>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => {
                window.open(
                  "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27ve%20gone%20through%20your%20website%20samples%20and%20I%27m%20interested%20in%20getting%20a%20website%20built%20for%20my%20business.%20Can%20we%20discuss%20what%20would%20work%20best%20for%20me%3F",
                  "_blank"
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
