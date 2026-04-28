import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { destinations } from "@/lib/sample-data";
import { Search, SlidersHorizontal, MapPin, Star, ImageOff, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const cats = ["All", "Beaches", "Spiritual", "Mountains", "Heritage", "Nature", "Hills"];

function DestinationImage({ src, alt }: { src?: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
        <ImageOff className="size-8" aria-hidden />
        <span className="sr-only">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-secondary" aria-hidden />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

export default function Explore({ isInternational = false }: { isInternational?: boolean }) {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [remoteDestinations, setRemoteDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isInternational) {
      const fetchDestinations = async () => {
        setLoading(true);
        try {
          const res = await api.get("/public/explore-places", {
            params: { q: query, category: cat }
          });
          setRemoteDestinations(res.data);
        } catch (err) {
          console.error("Failed to fetch destinations:", err);
        } finally {
          setLoading(false);
        }
      };

      const timer = setTimeout(fetchDestinations, 300);
      return () => clearTimeout(timer);
    }
  }, [isInternational, query, cat]);

  // Use local destinations for International, remote for India
  const displayDestinations = useMemo(() => {
    if (isInternational) {
      const filteredByRegion = destinations.filter(d => d.isInternational === isInternational);
      const q = query.trim().toLowerCase();
      return filteredByRegion.filter((d) => {
        const matchCat = cat === "All" || d.tag === cat;
        const matchQuery =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.tag.toLowerCase().includes(q);
        return matchCat && matchQuery;
      }).sort(() => Math.random() - 0.5);
    }
    return remoteDestinations;
  }, [isInternational, query, cat, remoteDestinations]);

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          {isInternational ? "Explore the World" : "Explore India"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isInternational 
            ? "Iconic global tourist spots, curated for you." 
            : "Explore thousands of places across India, from popular landmarks to hidden gems."}
        </p>

        <div className="mt-6 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, vibes, e.g. ‘mountains in Himachal’"
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-transparent focus:bg-surface focus:border-ring outline-none text-sm"
            />
            {loading && !isInternational && (
              <Loader2 className="size-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
          </div>
          <button className="h-12 px-4 rounded-xl border border-border bg-surface inline-flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {cats.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 px-4 h-10 rounded-full text-sm font-semibold transition ${
                  active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {loading && !isInternational && remoteDestinations.length === 0 ? (
          <div className="mt-20 flex justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : displayDestinations.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground">No destinations match your search</p>
            <p className="text-sm mt-1">Try a different category or clear your filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDestinations.map((d) => (
              <Link
                to={isInternational ? `/trip-details?id=${d.id}` : `/explore-india?place=${d.name}&city=${d.city}`}
                key={d.id || d.name}
                className="group rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
                  <DestinationImage src={d.img} alt={d.name} />
                  <div className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-widest bg-white/95 text-foreground px-2.5 py-1 rounded-full z-10">
                    {d.tag || d.category}
                  </div>
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/70 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur z-10">
                    <Star className="size-3 fill-current text-accent" /> {d.rating?.toFixed(1) ?? "4.5"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-display font-bold text-lg">{d.name ?? "Untitled"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {d.region || d.city || "India"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {d.description || `Explore ${d.name} in ${d.city || d.region}. A perfect ${d.tag?.toLowerCase() || d.category?.toLowerCase() || "travel"} destination for your next trip.`}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Est. Cost</div>
                      <div className="font-display font-bold text-primary">{d.price || (d.avgCost ? `₹${d.avgCost}` : "₹500+")}</div>
                    </div>
                    <span className="text-xs font-semibold text-accent">{d.days || (d.timeHours ? `${d.timeHours} hrs` : "2 hrs")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
