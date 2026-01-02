import { Helmet } from "react-helmet-async";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Shyara Marketing",
  "legalName": "Shyara Tech Solutions (OPC) Pvt. Ltd.",
  "url": "https://shyaramarketing.com",
  "logo": "https://shyaramarketing.com/logo.png",
  "description": "Digital marketing and technology services company helping businesses grow through social media, advertising, websites, and apps.",
  "email": "marketing.shyara@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "sameAs": []
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Shyara Marketing",
  "description": "Digital marketing and technology services company in India",
  "url": "https://shyaramarketing.com",
  "email": "marketing.shyara@gmail.com",
  "priceRange": "₹₹",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "22.7196",
    "longitude": "75.8577"
  }
};

interface StructuredDataProps {
  type?: "organization" | "localBusiness" | "service" | "offer" | "webpage";
  data?: Record<string, unknown>;
}

export function StructuredData({ type = "organization", data }: StructuredDataProps) {
  let schema;

  switch (type) {
    case "organization":
      schema = organizationSchema;
      break;
    case "localBusiness":
      schema = localBusinessSchema;
      break;
    case "service":
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "provider": {
          "@type": "Organization",
          "name": "Shyara Marketing"
        },
        ...data
      };
      break;
    case "offer":
      schema = {
        "@context": "https://schema.org",
        "@type": "Offer",
        "seller": {
          "@type": "Organization",
          "name": "Shyara Marketing"
        },
        ...data
      };
      break;
    case "webpage":
      schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Shyara Marketing",
          "url": "https://shyaramarketing.com"
        },
        ...data
      };
      break;
    default:
      schema = organizationSchema;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
}
