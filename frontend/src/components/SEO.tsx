import { Helmet } from "react-helmet-async";
import { SOCIAL_SHARE } from "@/constants/socialShare";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SEOProps {
  title: string;
  description: string;
  /** Short title for WhatsApp / Open Graph (keep under ~40 chars). */
  shareTitle?: string;
  /** Short blurb for link previews (one line, ~60 chars max). */
  shareDescription?: string;
  canonical?: string;
  type?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  serviceSchema?: {
    name: string;
    description: string;
    url: string;
  };
  faqSchema?: FaqItem[];
}

const BASE_URL = "https://marketing.shyara.co.in";

export function SEO({
  title,
  description,
  shareTitle,
  shareDescription,
  canonical,
  type = "website",
  keywords,
  image = SOCIAL_SHARE.image,
  imageAlt = SOCIAL_SHARE.imageAlt,
  noIndex = false,
  breadcrumbs,
  serviceSchema,
  faqSchema,
}: SEOProps) {
  const fullTitle = title === "Shyara Marketing"
    ? title
    : `${title} | Shyara Marketing`;

  const openGraphTitle = shareTitle ?? fullTitle;
  const openGraphDescription = shareDescription ?? description;

  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          ...breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            "position": i + 2,
            "name": crumb.name,
            "item": crumb.url,
          })),
        ],
      })
    : null;

  const serviceJsonLd = serviceSchema
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceSchema.name,
        "description": serviceSchema.description,
        "url": serviceSchema.url,
        "provider": { "@id": `${BASE_URL}/#organization` },
        "areaServed": { "@type": "GeoShape", "name": "India and Global" },
      })
    : null;

  const faqJsonLd = faqSchema && faqSchema.length > 0
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqSchema.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer,
          },
        })),
      })
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Shyara Marketing" />

      {keywords && <meta name="keywords" content={keywords} />}

      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph — short copy for WhatsApp / social previews */}
      <meta property="og:title" content={openGraphTitle} />
      <meta property="og:description" content={openGraphDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SOCIAL_SHARE.siteName} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={openGraphTitle} />
      <meta name="twitter:description" content={openGraphDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* BreadcrumbList Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">{breadcrumbSchema}</script>
      )}

      {/* Service Schema */}
      {serviceJsonLd && (
        <script type="application/ld+json">{serviceJsonLd}</script>
      )}

      {/* FAQ Schema */}
      {faqJsonLd && (
        <script type="application/ld+json">{faqJsonLd}</script>
      )}
    </Helmet>
  );
}
