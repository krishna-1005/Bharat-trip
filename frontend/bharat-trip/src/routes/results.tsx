import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { sampleItinerary, destinationItineraries, destinations } from "@/lib/sample-data";
import { useEffect, useState } from "react";
import {
  Edit3,
  Share2,
  Download,
  MapPin,
  Plane,
  Utensils,
  Camera,
  Landmark,
  Ship,
  Music,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  Wallet,
  Calendar,
  Receipt,
  Hotel,
  ArrowRight,
  X,
  Loader2,
  Bookmark,
  Check,
  ExternalLink,
  Train,
  Car,
  Info
} from "lucide-react";

function TransportRecommendation({ transport }: { transport?: any }) {
  if (!transport) return null;

  const Icon = transport.icon === "train" ? Train : transport.icon === "car" ? Car : Plane;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
        Travel from {transport.from}
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Recommended</span>
      </h3>
      
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-secondary/40 border border-border/50">
        <div className="size-14 rounded-xl bg-warm-gradient text-white grid place-items-center shrink-0 shadow-soft">
          <Icon className="size-7" />
        </div>
        <div>
          <div className="font-display font-bold text-xl text-primary">{transport.mode}</div>
          <div className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
            <MapPin className="size-3" /> {transport.distance} km total distance
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
        <Info className="size-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {transport.reason}
        </p>
      </div>
      
      <div className="mt-5 grid grid-cols-2 gap-3">
        <a 
          href={`https://www.google.com/search?q=${transport.mode}+from+${transport.from}+to+${transport.to}`}
          target="_blank"
          className="py-2.5 rounded-xl bg-foreground text-background text-[11px] font-bold text-center hover:opacity-90 transition"
        >
          Check Schedules
        </a>
        <a 
          href={`https://www.ixigo.com/search/result/${transport.icon === "plane" ? "flight" : transport.icon === "train" ? "train" : "bus"}/${transport.from}/${transport.to}`}
          target="_blank"
          className="py-2.5 rounded-xl border border-border text-[11px] font-bold text-center hover:bg-secondary transition"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PDFViewerModal } from "@/components/PDFViewerModal";

function StayRecommendations({ lat, lng, city, budgetTier, recommendedStay, travelerType }: { lat: number; lng: number; city: string; budgetTier: string; recommendedStay?: any; travelerType?: string }) {
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.post("/nearby", { lat, lng, city, category: "Stay", radius: 15, travelerType })
      .then(res => {
        let nearbyStays = res.data.slice(0, 3);
        // If we have a recommended stay from the planner, put it at the top
        if (recommendedStay) {
          nearbyStays = [recommendedStay, ...nearbyStays.filter((s: any) => s.name !== recommendedStay.name)].slice(0, 3);
        }
        setStays(nearbyStays);
      })
      .catch(err => {
        console.error("Stays fetch error", err);
        if (recommendedStay) setStays([recommendedStay]);
      })
      .finally(() => setLoading(false));
  }, [lat, lng, city, recommendedStay]);

  const getStayType = () => {
    if (recommendedStay?.stayType) return recommendedStay.stayType;
    if (budgetTier === "low") return "Hostels & Lodges";
    if (budgetTier === "medium") return "Boutique Hotels";
    return "Luxury Stays";
  };

  const getStayPrice = (s: any, index: number) => {
    if (s.avgCost) return s.avgCost;
    const base = budgetTier === "low" ? 800 : budgetTier === "medium" ? 2500 : 6000;
    return base + (index * 450);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
        Nearby {getStayType()}
        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Matched to Budget</span>
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl w-full" />)}
        </div>
      ) : stays.length > 0 ? (
        <div className="space-y-3">
          {stays.map((s, i) => (
            <div key={i} className="group flex items-center gap-4 rounded-2xl bg-secondary/50 p-3 hover:bg-secondary transition-all cursor-pointer border border-transparent hover:border-border">
              <div className="size-14 rounded-xl bg-warm-gradient shrink-0 shadow-soft group-hover:scale-105 transition-transform overflow-hidden relative grid place-items-center">
                 <Hotel className="text-white/70 size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{s.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(s.tags || []).slice(0, 2).map((tag: string, ti: number) => (
                    <span key={ti} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{tag}</span>
                  ))}
                  {!s.tags && (
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {s.distance ? `${s.distance.toFixed(1)} km away` : "Nearby Landmark"}
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-primary mt-1">₹{getStayPrice(s, i).toLocaleString("en-IN")}<span className="text-[10px] font-normal text-muted-foreground ml-1">/night</span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic text-center py-4">No specific stays found nearby.</div>
      )}
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-6 py-3 rounded-2xl bg-secondary font-bold text-sm hover:bg-border transition-colors flex items-center justify-center gap-2"
      >
        Explore All Accommodations <ArrowRight className="size-4" />
      </button>

      {/* Expanded Stays Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-pop overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/20">
              <div>
                <h2 className="text-2xl font-display font-bold">Accommodations in {city}</h2>
                <p className="text-sm text-muted-foreground mt-1">Showing top matches for your {budgetTier} budget.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full bg-background border border-border grid place-items-center hover:bg-secondary transition">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {stays.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                  <div className="flex items-center gap-5">
                    <div className="size-16 rounded-2xl bg-warm-gradient grid place-items-center shadow-soft">
                      <Hotel className="text-white size-8" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-lg">{s.name}</div>
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        {(s.tags || ["Verified", "Comfort"]).map((tag: string, ti: number) => (
                          <span key={ti} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {s.distance ? `${s.distance.toFixed(2)} km from center` : "Central Location"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-display font-bold text-primary">₹{getStayPrice(s, i).toLocaleString("en-IN")}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Per Night</div>
                  </div>
                </div>
              ))}
              
              <div className="p-8 rounded-3xl border-2 border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">Looking for something specific?</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <a href={`https://www.google.com/maps/search/hotels+in+${city}`} target="_blank" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:scale-105 transition">Google Maps</a>
                  <a href={`https://www.booking.com/searchresults.html?ss=${city}`} target="_blank" className="px-4 py-2 rounded-xl bg-[#003580] text-white text-xs font-bold hover:scale-105 transition">Booking.com</a>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/10 border-t border-border flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl bg-foreground text-background text-sm font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  utensils: Utensils,
  camera: Camera,
  landmark: Landmark,
  ship: Ship,
  music: Music,
  "shopping-bag": ShoppingBag,
};

export default function Results() {
  return (
    <ResultsContent />
  );
}

function ResultsContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const sampleId = searchParams.get("sampleId");
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(!!planId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<number | null>(1);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !firebaseUser) return;
    
    // Fetch user profile to get MongoDB ID
    api
      .get("/profile")
      .then((res) => {
        setMongoUserId(res.data.user._id);
      })
      .catch((err) => console.error("Failed to fetch profile", err));
  }, [firebaseUser, authLoading]);

  useEffect(() => {
    if (planId) {
      setLoading(true);
      const CACHE_KEY = `gotripo-plan-${planId}`;
      
      // Try to load from cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const tripData = JSON.parse(cached);
          setPlan(tripData);
          if (mongoUserId && tripData.userId === mongoUserId) {
            setSaved(true);
          }
          // We still fetch from API to ensure fresh data, but UI is responsive
        } catch (e) {}
      }

      api
        .get(`/trips/${planId}`)
        .then((res) => {
          const tripData = res.data;
          setPlan(tripData);
          localStorage.setItem(CACHE_KEY, JSON.stringify(tripData));

          // Check if it's already saved for THIS user
          if (mongoUserId && tripData.userId === mongoUserId) {
            setSaved(true);
          }
        })
        .catch((err) => {
          if (!plan) {
            toast.error("Failed to fetch plan and no cache found");
          } else {
            toast.info("Showing cached offline version");
          }
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (sampleId) {
      const sample = destinationItineraries[sampleId];
      const destInfo = destinations.find(d => d.id === sampleId);
      
      if (sample && destInfo) {
        setPlan({
          title: `${destInfo.name} Escape`,
          destination: destInfo.name,
          city: destInfo.name,
          days: parseInt(destInfo.days),
          itinerary: sample,
          totalBudget: parseInt(destInfo.price.replace(/[^\d]/g, "")),
          budget: parseInt(destInfo.price.replace(/[^\d]/g, "")),
          travelerType: "balanced",
          pace: "moderate",
          summary: `A curated ${destInfo.days} immersion through ${destInfo.name}'s most iconic spots.`,
          isSample: true,
          id: sampleId
        });
      }
    }
  }, [planId, sampleId, mongoUserId]);

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    try {
      const dataToSave = plan || {
        title: "Royal Rajasthan",
        destination: "Jaipur",
        city: "Jaipur",
        days: 5,
        itinerary: sampleItinerary,
        totalBudget: 38400,
        budget: 38400,
        travelerType: "luxury",
        pace: "balanced",
        summary: "A 5-day heritage immersion through Jaipur's pink streets.",
      };

      // Ensure itinerary is formatted correctly for backend
      const formattedItinerary = (dataToSave.itinerary || []).map((day: any, idx: number) => ({
        day: (day.day || day.label || idx + 1).toString(),
        title: day.title || day.theme || "",
        places: (day.places || day.items || []).map((p: any) => ({
          name: p.name || p.place || "Unknown Place",
          lat: p.lat,
          lng: p.lng,
          estimatedCost: p.estimatedCost || p.avgCost || 0,
          estimatedHours: p.estimatedHours || p.timeHours || 2,
          category: p.category || "Sightseeing",
          tag: p.tag || "",
          time: p.time || p.bestTime || "",
        })),
      }));

      await api.post("/profile/trips", {
        title: dataToSave.title || `${dataToSave.destination || dataToSave.city} Trip`,
        city: dataToSave.destination || dataToSave.city || "Unknown",
        days: Number(dataToSave.days) || 5,
        itinerary: formattedItinerary,
        totalCost: Number(
          dataToSave.totalTripCost || dataToSave.totalBudget || dataToSave.budget || 0,
        ),
        totalBudget: Number(dataToSave.totalBudget || dataToSave.budget || 0),
        travelerType: dataToSave.travelerType || "solo",
        pace: dataToSave.pace || "moderate",
        summary: dataToSave.summary || "",
      });

      setSaved(true);
      toast.success("Trip saved to your profile!");
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.error || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${destinationName}`,
          text: `Check out my travel plan for ${destinationName}!`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownloadPDF = () => {
    setIsPdfModalOpen(true);
  };

  const handleEdit = () => {
    // Navigate back to the appropriate planner with current params
    if (plan?.isMultiCity) {
      navigate(`/planner-multi`);
    } else {
      const dest = plan?.destination || plan?.city || "";
      const daysNum = plan?.days || 5;
      navigate(`/planner-single?dest=${encodeURIComponent(dest)}&days=${daysNum}`);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 lg:px-8 py-6 max-w-[1500px] mx-auto space-y-6">
          <Skeleton className="h-40 md:h-48 rounded-3xl w-full" />
          <div className="mt-6 grid lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-3xl border border-border overflow-hidden">
                  <div className="p-5 flex items-center gap-4">
                    <Skeleton className="size-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-4">
              <Skeleton className="h-[500px] rounded-3xl w-full" />
              <Skeleton className="h-60 rounded-3xl w-full" />
            </aside>
          </div>
        </div>
      </AppShell>
    );
  }

  const itinerary = plan?.itinerary || sampleItinerary;
  const title =
    plan?.title ||
    (plan?.destination
      ? `${plan.destination} · ${plan.days} days`
      : plan?.city
        ? `${plan.city} Trip`
        : "Royal Rajasthan · 5 days");
  const costLabel = plan?.totalBudget || plan?.budget || 38400;
  const destinationName = plan?.destination || plan?.city || "Jaipur, India";

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-6 max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="rounded-3xl bg-hero-gradient text-white p-7 md:p-9 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative flex flex-wrap gap-6 items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/70 font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-accent" />{" "}
                {plan ? "AI-generated" : "Sample Plan"}
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" /> {plan?.days || 5} days
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {destinationName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="size-4" /> ₹{Number(costLabel).toLocaleString("en-IN")} /
                  person
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                onClick={handleSave}
                disabled={saving || saved}
                icon={saved ? Check : Bookmark}
                label={saved ? "Saved to Profile" : saving ? "Saving..." : "Save to Profile"}
                primary={!saved}
              />
              <ActionBtn icon={Edit3} label="Edit plan" onClick={handleEdit} />
              <ActionBtn icon={Share2} label="Share" onClick={handleShare} />
              <ActionBtn icon={Download} label="PDF" onClick={handleDownloadPDF} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_400px] gap-6">
          {/* LEFT: timeline */}
          <div className="space-y-4">
            {itinerary.map((day: any, idx: number) => {
              const dayNum =
                day.day === "Arrival"
                  ? 1
                  : typeof day.day === "number"
                    ? day.day
                    : parseInt(day.day) || idx + 1;
              const isOpen = open === dayNum;
              const dayLabel = day.day;
              const dayActivities = day.places || day.items || day.activities || [];

              return (
                <div
                  key={day.day || idx}
                  className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : dayNum)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/40 transition"
                  >
                    <div className="size-12 rounded-2xl bg-warm-gradient text-white grid place-items-center font-display font-bold shadow-cta">
                      {typeof dayLabel === "number"
                        ? `D${dayLabel}`
                        : dayLabel.toString().startsWith("D")
                          ? dayLabel
                          : `D${dayLabel}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-lg">
                        {day.title || day.theme || `Exploring ${destinationName}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {dayActivities.length} stops · ~ 8 hrs
                      </div>
                    </div>
                    <ChevronDown
                      className={`size-5 text-muted-foreground transition-transform no-print ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div className={`px-5 pb-5 pt-1 ${isOpen ? "block" : "hidden"} print:block`}>
                    <div className="relative ml-6 border-l-2 border-dashed border-border space-y-4 py-2">
                      {dayActivities.map((it: any, i: number) => {
                        const Ico = iconMap[it.icon] ?? MapPin;
                        const placeName = it.name || it.place || it.activity;
                        const placeDesc = it.tag || it.desc || it.description || it.category;
                        const placeTime = it.time || it.bestTime || "Scheduled";
                        const isCurrentlyActive =
                          activePlace && placeName === (activePlace.name || activePlace.place);

                        return (
                          <div key={i} className="relative pl-6 itinerary-item">
                            <div
                              className={`absolute -left-[13px] top-1 size-6 rounded-full border-2 grid place-items-center transition-colors ${
                                isCurrentlyActive
                                  ? "bg-accent border-accent"
                                  : "bg-card border-accent"
                              }`}
                            >
                              <Ico
                                className={`size-3 ${isCurrentlyActive ? "text-white" : "text-accent"}`}
                              />
                            </div>
                            <div
                              className={`rounded-2xl p-4 transition-all duration-300 ${
                                isCurrentlyActive
                                  ? "bg-accent/10 border border-accent/20"
                                  : "bg-secondary hover:bg-primary-soft border border-transparent"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className={`text-xs font-semibold ${isCurrentlyActive ? "text-accent" : "text-primary"}`}
                                >
                                  {placeTime}
                                </div>
                                <div className="flex items-center gap-3 no-print">
                                  <button
                                    onClick={() => setActivePlace(it)}
                                    className={`text-xs font-bold transition hover:opacity-70 ${isCurrentlyActive ? "text-accent" : "text-muted-foreground"}`}
                                  >
                                    {isCurrentlyActive ? "Focused" : "Preview"}
                                  </button>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-accent transition"
                                  >
                                    <ExternalLink className="size-3" /> Maps
                                  </a>
                                </div>
                              </div>
                              <div className="font-display font-bold mt-1">{placeName}</div>
                              <div className="text-sm text-muted-foreground">{placeDesc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Map + cost + summary */}
          <aside className="space-y-4">
            {/* Real Map */}
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft h-[500px]">
              <MapPreview
                itinerary={itinerary}
                activePlace={activePlace}
                onMarkerClick={(p) => setActivePlace(p)}
              />
            </div>

            <TransportRecommendation transport={plan?.recommendedTransport} />

            <StayRecommendations 
              lat={plan?.coordinates?.lat || 28.6139} 
              lng={plan?.coordinates?.lng || 77.2090} 
              city={plan?.city || plan?.destination || "Delhi"}
              budgetTier={plan?.totalBudget / (plan?.days * 2) < 2000 ? "low" : plan?.totalBudget / (plan?.days * 2) < 5000 ? "medium" : "high"}
              recommendedStay={plan?.recommendedStay}
              travelerType={plan?.travelerType}
            />

            {/* Cost breakdown */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  <Receipt className="size-5 text-accent" /> Budget Control
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded">AI Estimate</div>
              </div>
              
              <div className="space-y-5">
                {[
                  {
                    l: "Stays",
                    v: plan?.costBreakdown?.hotel || (plan?.totalBudget || plan?.budget || 38400) * 0.45,
                    c: "bg-indigo-500",
                    i: Hotel
                  },
                  {
                    l: "Food & Drinks",
                    v: plan?.costBreakdown?.food || (plan?.totalBudget || plan?.budget || 38400) * 0.25,
                    c: "bg-orange-500",
                    i: Utensils
                  },
                  {
                    l: "Transport",
                    v: plan?.costBreakdown?.transport || (plan?.totalBudget || plan?.budget || 38400) * 0.15,
                    c: "bg-sky-500",
                    i: Plane
                  },
                  {
                    l: "Activities",
                    v: plan?.costBreakdown?.activities || (plan?.totalBudget || plan?.budget || 38400) * 0.15,
                    c: "bg-rose-500",
                    i: Camera
                  },
                ].map((r) => {
                  const total = plan?.totalTripCost || plan?.totalBudget || plan?.budget || 38400;
                  const percentage = Math.round((r.v / total) * 100);
                  
                  return (
                    <div key={r.l} className="group">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`size-8 rounded-lg ${r.c} bg-opacity-10 flex items-center justify-center`}>
                            <r.i className={`size-4 ${r.c.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-medium text-foreground/80">{r.l}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{Number(r.v).toLocaleString("en-IN")}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">{percentage}%</div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full ${r.c} transition-all duration-1000 group-hover:brightness-110`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Total</div>
                    <div className="text-2xl font-display font-bold text-primary">
                      ₹{Number(plan?.totalTripCost || plan?.totalBudget || plan?.budget || 38400).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-success">Remaining</div>
                    <div className="text-lg font-display font-bold text-success">
                      ₹{Number((plan?.totalBudget || 40000) - (plan?.totalTripCost || 38400)).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PDFViewerModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        plan={plan} 
      />
    </AppShell>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  primary,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition ${
        primary ? "bg-warm-gradient text-white shadow-cta" : "glass text-white hover:bg-white/15"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}
