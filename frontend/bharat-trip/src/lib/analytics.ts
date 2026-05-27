import ReactGA from "react-ga4";

/**
 * Reusable utility to send custom events to Google Analytics 4
 * @param action - Naming convention: snake_case (e.g., 'generate_itinerary')
 * @param category - E.g., 'engagement', 'outbound_redirect'
 * @param label - Optional details about the event
 * @param value - Optional numeric value (must be integer)
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  try {
    ReactGA.event({
      action,
      category,
      label,
      value,
    });
  } catch (error) {
    console.debug("GA4 trackEvent skipped:", error);
  }
};
