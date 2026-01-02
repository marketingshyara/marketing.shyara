import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
  keywords?: string;
  image?: string;
  noIndex?: boolean;
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
  noIndex = false
}: SEOProps) {
  const fullTitle = title === "Shyara Marketing" 
    ? title 
    : `${title} | Shyara Marketing`;
  
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

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
    </Helmet>
  );
}
