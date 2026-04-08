const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// Persistent cache in localStorage to prevent repeated API calls
const getCache = () => {
  try {
    const data = localStorage.getItem("bt_image_cache");
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const setCache = (key, value) => {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem("bt_image_cache", JSON.stringify(cache));
  } catch (e) {}
};

/**
 * Fetches an accurate image for a place using Google Places API (Primary) or Unsplash (Fallback).
 * @param {string} placeName Name of the specific location
 * @param {string} city The city context
 * @returns {Promise<string>} Image URL
 */
export async function getPlaceImage(placeName, city) {
  if (!placeName) return "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600";
  
  const cacheKey = `${placeName.toLowerCase().trim()}-${city?.toLowerCase().trim() || 'india'}`;
  const cache = getCache();
  
  // If we have a cache hit, check if it's the OLD Taj Mahal fallback.
  // If it is, ignore it and re-fetch to fix the mismatch.
  const oldFallback = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600";
  if (cache[cacheKey] && cache[cacheKey] !== oldFallback) {
    console.log(`[ImageService] Cache Hit: ${placeName}`);
    return cache[cacheKey];
  }

  console.log(`[ImageService] Fetching Real Image for: ${placeName} in ${city}`);

  // ── 1. GOOGLE PLACES API (PRIMARY) ──
  if (GOOGLE_KEY) {
    try {
      // More specific query for the exact landmark
      const searchQuery = `${placeName} ${city} original landmark architecture`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=photos,place_id,name&key=${GOOGLE_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData?.candidates?.length > 0 && searchData.candidates[0].photos?.length > 0) {
        const photoRef = searchData.candidates[0].photos[0].photo_reference;
        const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoRef}&key=${GOOGLE_KEY}`;
        
        console.log(`[ImageService] Google Match Found: ${placeName}`);
        setCache(cacheKey, imageUrl);
        return imageUrl;
      }
    } catch (err) {
      console.warn("[ImageService] Google Error:", err.message);
    }
  }

  // ── 2. UNSPLASH API (FALLBACK) ──
  if (UNSPLASH_KEY) {
    // Try exact place first
    const queries = [
      `"${placeName}" ${city} landmark original`,
      `${placeName} architecture ${city}`
    ];

    for (const query of queries) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
        );

        if (res.ok) {
          const data = await res.json();
          if (data?.results?.length > 0) {
            const imageUrl = data.results[0]?.urls?.regular; // Use 'regular' for better quality
            if (imageUrl) {
              setCache(cacheKey, imageUrl);
              return imageUrl;
            }
          }
        }
      } catch (err) {
        console.error("Unsplash fallback failed:", err);
      }
    }
  }

  // ── 3. GENERIC VIBE FALLBACK (LAST RESORT) ──
  const genericFallback = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600"; // Neutral mountain/scenic
  setCache(cacheKey, genericFallback);
  return genericFallback;
}