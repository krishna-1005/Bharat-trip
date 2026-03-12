const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// simple in-memory cache
const imageCache = {};

export async function getPlaceImage(placeName, city) {
  const cacheKey = `${placeName}-${city}`;

  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  // Use a more descriptive query. Removing "landmark" if it's too generic
  const query = `"${placeName}" ${city} india`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=3&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`
        }
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    
    // Pick one of the top 3 results to reduce the "exact same image" feel for generic queries
    // but favor the first one for specific matches
    const results = data?.results || [];
    if (results.length === 0) return null;

    // Use a hash of the placeName to consistently pick one of the top results for that place
    // but differently across different places
    const hash = placeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % Math.min(results.length, 3);
    
    const imageUrl = results[index]?.urls?.small || results[0]?.urls?.small || null;

    imageCache[cacheKey] = imageUrl;
    return imageUrl;
  } catch (err) {
    console.error("Image fetch error:", err);
    return null;
  }
}