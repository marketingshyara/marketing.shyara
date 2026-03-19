import { Globe, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

export default function Samples() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20just%20browsed%20your%20portfolio%20and%20I%27d%20love%20something%20similar%20for%20my%20brand.%20Can%20we%20discuss%3F",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO
        title="Samples"
        description="Explore our portfolio of live website design samples. Preview real websites we have delivered before you commit."
        canonical="/samples"
        keywords="website samples, website portfolio, web design examples, live website previews, business website examples"
      />

      <PageHero
        label="Portfolio"
        title={<>See Our Work <span className="text-accent">Before You Commit.</span></>}
        description="Browse live website previews we have built for businesses like yours. No mockups, only delivered work."
        trustPoints={["Real project outputs", "Live website previews", "Quality you can verify"]}
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="max-w-5xl mx-auto flex justify-center">
            <Link
              to="/samples/websites"
              className="group w-full max-w-2xl rounded-card border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated hover:border-accent/40 transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-primary/5 to-muted/30 flex items-center justify-center relative overflow-hidden">
                <div className="w-[75%] aspect-video rounded-lg border border-border bg-card shadow-card opacity-50 group-hover:opacity-70 transition-opacity">
                  <div className="h-6 bg-muted rounded-t-lg flex items-center gap-1.5 px-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                    <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                  <div className="p-2.5 space-y-2">
                    <div className="h-2 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-2 bg-muted-foreground/15 rounded w-1/2" />
                    <div className="h-2 bg-accent/30 rounded w-1/3" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="icon-well-lg bg-background/80 backdrop-blur-sm group-hover:bg-accent/10 transition-colors">
                    <Globe className="h-8 w-8 text-accent" />
                  </div>
                </div>
              </div>

              <div className="p-7">
                <h2 className="text-xl font-semibold text-foreground mb-2">Website Design Samples</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Live interactive previews you can scroll and click through. Restaurants, clinics, portfolios, and more.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["Live Previews", "Multiple Categories", "Interactive"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">
                  Explore Websites <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-section font-bold text-foreground mb-3">
            Want Us to Create Something for Your Brand?
          </h2>
          <p className="text-body text-muted-foreground mb-6">
            Let us discuss what kind of content or website would work best for your business.
          </p>
          <Button
            size="lg"
            onClick={openWhatsApp}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Let&apos;s Talk
          </Button>
        </div>
      </section>
    </Layout>
  );
}
