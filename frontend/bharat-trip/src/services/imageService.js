const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// simple in-memory cache
const imageCache = {};

function stringHash(str) {
  if (!str) return 0;
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export async function getPlaceImage(placeName, city) {
  const cacheKey = `${placeName}-${city}`;
  if (imageCache[cacheKey]) return imageCache[cacheKey];

  // Try multiple refined queries to get specific results
  const queries = [
    `"${placeName}" ${city} landmark`,
    `${placeName} ${city} exterior`,
    `${placeName} tourist destination`
  ];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&content_filter=high`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );

      if (res.status === 403 || res.status === 401) break; // API limit reached
      if (!res.ok) continue;

      const data = await res.json();
      if (data?.results?.length > 0) {
        const imageUrl = data.results[0]?.urls?.small;
        if (imageUrl) {
          imageCache[cacheKey] = imageUrl;
          return imageUrl;
        }
      }
    } catch (err) {
      console.error("Image fetch error:", err);
    }
  }

  // REAL FALLBACK: If no specific photo is found, use a clean, stylized Map-themed placeholder
  // This feels 'real' because it's showing the context of the trip, not a random monument.
  const hash = stringHash(placeName);
  const mapVibe = hash % 5;
  const mapFallbacks = [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600", // Map/Compass vibe
    "https://images.unsplash.com/photo-1512783558244-78c7d75a85ee?q=80&w=600", // Scenic road
    "https://images.unsplash.com/photo-1477584264176-507e81e7f4f5?q=80&w=600", // Architecture
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=600", // Nature/Park
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600"  // Heritage
  ];

  const finalFallback = mapFallbacks[mapVibe];
  imageCache[cacheKey] = finalFallback;
  return finalFallback;
}