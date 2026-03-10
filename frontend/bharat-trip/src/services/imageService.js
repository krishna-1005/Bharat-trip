const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// simple in-memory cache
const imageCache = {};

export async function getPlaceImage(placeName, city) {
  const cacheKey = `${placeName}-${city}`;

  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  const query = `${placeName} ${city}`;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`
      }
    }
  );

  if (!res.ok) return null;

  const data = await res.json();

  const imageUrl = data?.results?.[0]?.urls?.small || null;

  imageCache[cacheKey] = imageUrl;
  return imageUrl;
}