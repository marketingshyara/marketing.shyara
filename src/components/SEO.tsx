import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
  keywords?: string;
  image?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  serviceSchema?: {
    name: string;
    description: string;
    url: string;
  };
}

const BASE_URL = "https://shyaramarketing.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function SEO({
  title,
  description,
  canonical,
  type = "website",
  keywords,
  image = DEFAULT_IMAGE,
  noIndex = false,
  breadcrumbs,
  serviceSchema,
}: SEOProps) {
  const fullTitle = title === "Shyara Marketing"
    ? title
    : `${title} | Shyara Marketing`;

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

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Shyara Marketing" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* BreadcrumbList Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">{breadcrumbSchema}</script>
      )}

      {/* Service Schema */}
      {serviceJsonLd && (
        <script type="application/ld+json">{serviceJsonLd}</script>
      )}
    </Helmet>
  );
}
