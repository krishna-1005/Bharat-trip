import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { sampleItinerary } from "@/lib/sample-data";
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
  Loader2,
  Bookmark,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PDFViewerModal } from "@/components/PDFViewerModal";

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
      api
        .get(`/trips/${planId}`)
        .then((res) => {
          const tripData = res.data;
          setPlan(tripData);

          // Check if it's already saved for THIS user
          if (mongoUserId && tripData.userId === mongoUserId) {
            setSaved(true);
          }
        })
        .catch((err) => {
          toast.error("Failed to fetch plan");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [planId, mongoUserId]);

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
        <div className="min-h-[60vh] grid place-items-center">
          <div className="text-center">
            <Loader2 className="size-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground font-display">Fetching your AI itinerary...</p>
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
                                <button
                                  onClick={() => setActivePlace(it)}
                                  className={`text-xs font-bold transition hover:opacity-70 no-print ${isCurrentlyActive ? "text-accent" : "text-muted-foreground"}`}
                                >
                                  {isCurrentlyActive ? "Focused" : "View on map"}
                                </button>
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
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft h-[500px] sticky top-6">
              <MapPreview
                itinerary={itinerary}
                activePlace={activePlace}
                onMarkerClick={(p) => setActivePlace(p)}
              />
            </div>

            {/* Cost breakdown */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 font-display font-bold">
                <Receipt className="size-4 text-accent" /> Cost breakdown
              </div>
              <div className="mt-4 space-y-3">
                {[
                  {
                    l: "Stays",
                    v: (plan?.totalBudget || plan?.budget || 38400) * 0.5,
                    c: "bg-primary",
                  },
                  {
                    l: "Travel",
                    v: (plan?.totalBudget || plan?.budget || 38400) * 0.2,
                    c: "bg-accent",
                  },
                  {
                    l: "Food & experiences",
                    v: (plan?.totalBudget || plan?.budget || 38400) * 0.25,
                    c: "bg-success",
                  },
                  {
                    l: "Buffer",
                    v: (plan?.totalBudget || plan?.budget || 38400) * 0.05,
                    c: "bg-muted-foreground",
                  },
                ].map((r) => (
                  <div key={r.l}>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.l}</span>
                      <span className="font-semibold">₹{Number(r.v).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${r.c}`}
                        style={{
                          width: `${(r.v / (plan?.totalBudget || plan?.budget || 38400)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
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
