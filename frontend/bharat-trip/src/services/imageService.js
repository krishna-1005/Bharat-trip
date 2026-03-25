const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// simple in-memory cache
const imageCache = {};

// Helper to get a consistent pseudo-random number for a string
function stringHash(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export async function getPlaceImage(placeName, city) {
  const cacheKey = `${placeName}-${city}`;

  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  // Fallback set for different vibes (generic but varied)
  const genericFallbacks = [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600", // Taj
    "https://images.unsplash.com/photo-1512783558244-78c7d75a85ee?q=80&w=600", // Goa
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=600", // Mumbai
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600", // Bengaluru
    "https://images.unsplash.com/photo-1477584264176-507e81e7f4f5?q=80&w=600", // Jaipur
    "https://images.unsplash.com/photo-1587474260584-1f3c8b4a339a?q=80&w=600", // Delhi
    "https://images.unsplash.com/photo-1548013146-72479768bbfd?q=80&w=600", // Varanasi
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=600", // Hill Station
    "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=600", // Udaipur
    "https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?q=80&w=600"  // Rishikesh
  ];

  // Try strict first, then broader
  const queries = [
    `"${placeName}" ${city} landmark`,
    `${placeName} ${city} tourist place`,
    `${placeName} india architecture`
  ];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=5&orientation=landscape&content_filter=high`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_KEY}`
          }
        }
      );

      if (res.status === 403 || res.status === 401) break;
      if (!res.ok) continue;

      const data = await res.json();
      const results = data?.results || [];

      if (results.length > 0) {
        // Find the most relevant result - usually the first one for specific queries
        // But we'll use a hash to stay consistent for the same place
        const hash = stringHash(placeName);
        const index = hash % Math.min(results.length, 3); // Pick from top 3 for quality
        const imageUrl = results[index]?.urls?.small;

        if (imageUrl) {
          console.log(`[ImageService] Matched ${placeName} in ${city} -> Result #${index}`);
          imageCache[cacheKey] = imageUrl;
          return imageUrl;
        }
      }
    } catch (err) {
      console.error("Image fetch error:", err);
    }
  }

  // If no Unsplash result, return a CONSISTENT fallback based on name hash
  // This ensures different places get different generic images
  const fallbackIdx = stringHash(placeName) % genericFallbacks.length;
  const finalFallback = genericFallbacks[fallbackIdx];
  imageCache[cacheKey] = finalFallback;
  return finalFallback;
}