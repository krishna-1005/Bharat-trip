import { useLocation } from "react-router-dom";
import { SEO } from "./SEO";
import { findSEORoute, SITE_URL, DEFAULT_OG_IMAGE } from "./seo-routes";

/**
 * Automatic SEO component that reads the current route
 * and applies the matching SEO configuration from seo-routes.ts.
 *
 * Place this ONCE in your App component. It will automatically
 * set title, description, OG tags, Twitter cards, and canonical URL
 * for every page defined in seo-routes.ts.
 *
 * For pages not in the config (e.g., dynamic routes), it uses defaults.
 * Individual pages can override by rendering their own <SEO> component.
 */
export function AutoSEO() {
  const { pathname } = useLocation();

  const routeConfig = findSEORoute(pathname);

  if (routeConfig) {
    return (
      <SEO
        title={routeConfig.title}
        description={routeConfig.description}
        canonicalPath={routeConfig.path}
        ogType={routeConfig.ogType || "website"}
        ogImage={routeConfig.ogImage || DEFAULT_OG_IMAGE}
        noindex={routeConfig.noindex}
        structuredData={
          routeConfig.path === "/"
            ? {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "GoTripo",
                url: SITE_URL,
                description: routeConfig.description,
                applicationCategory: "TravelApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  reviewCount: "150",
                },
              }
            : undefined
        }
      />
    );
  }

  // Default SEO for routes not in the config (dynamic routes, etc.)
  return (
    <SEO
      title="GoTripo – Group Trip Planning & Travel Expense Split App"
      description="Plan group trips with friends, split expenses, manage itineraries, and collaborate easily with GoTripo."
      canonicalPath={pathname}
      noindex={false}
    />
  );
}
