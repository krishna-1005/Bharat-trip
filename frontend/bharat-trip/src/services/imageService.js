const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// simple in-memory cache
const imageCache = {};

export async function getPlaceImage(placeName, city) {
  const cacheKey = `${placeName}-${city}`;

  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  // Try strict first, then broader
  const queries = [
    `"${placeName}" ${city} landmark`,
    `"${placeName}" ${city} tourist place`,
    `${placeName} ${city} india`,
    `${placeName} ${city}`,
    `${placeName} tourist attraction`,
    `${city} india tourism landmark`
  ];

  let isBlocked = false;

  for (const query of queries) {
    if (isBlocked) break;

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_KEY}`
          }
        }
      );

      if (res.status === 403 || res.status === 401) {
        console.warn("Unsplash API access denied or limit reached. Using fallbacks.");
        isBlocked = true;
        break;
      }

      if (!res.ok) continue;

      const data = await res.json();
      const results = data?.results || [];

      if (results.length > 0) {
        // Use a hash of the placeName to consistently pick one of the results
        const hash = placeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % results.length;
        const imageUrl = results[index]?.urls?.small || results[0]?.urls?.small;

        if (imageUrl) {
          imageCache[cacheKey] = imageUrl;
          return imageUrl;
        }
      }
    } catch (err) {
      console.error("Image fetch error for query:", query, err);
    }
  }

  return null;
}