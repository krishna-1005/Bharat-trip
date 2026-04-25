import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { sampleItinerary } from "@/lib/sample-data";
import { useEffect, useState } from "react";
import {
  Edit3, Share2, Download, MapPin, Plane, Utensils, Camera, Landmark, Ship, Music,
  ShoppingBag, ChevronDown, Sparkles, Wallet, Calendar, Hotel, Receipt, Loader2,
} from "lucide-react";
import { z } from "zod";
import api from "@/lib/api";
import { toast } from "sonner";

const resultsSearchSchema = z.object({
  planId: z.string().optional(),
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane, utensils: Utensils, camera: Camera, landmark: Landmark,
  ship: Ship, music: Music, "shopping-bag": ShoppingBag,
};

export const Route = createFileRoute("/results")({
  validateSearch: resultsSearchSchema,
  head: () => ({
    meta: [
      { title: "Your AI itinerary — GoTripo" },
      { name: "description", content: "AI-generated day-by-day itinerary, costs and map." },
    ],
  }),
  component: () => (<ProtectedRoute><Results /></ProtectedRoute>),
});

function Results() {
  const { planId } = useSearch({ from: "/results" });
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(!!planId);
  const [open, setOpen] = useState<number | null>(1);
  const [activePlace, setActivePlace] = useState<any>(null);

  useEffect(() => {
    if (planId) {
      setLoading(true);
      api.get(`/trips/${planId}`)
        .then(res => {
          setPlan(res.data);
        })
        .catch(err => {
          toast.error("Failed to fetch plan");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [planId]);

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
  const title = plan?.destination ? `${plan.destination} · ${plan.days} days` : (plan?.city ? `${plan.city} Trip` : "Royal Rajasthan · 5 days");
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
                <Sparkles className="size-3.5 text-accent" /> {plan ? "AI-generated" : "Sample Plan"}
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">{title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5"><Calendar className="size-4" /> {plan?.days || 5} days</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {destinationName}</span>
                <span className="inline-flex items-center gap-1.5"><Wallet className="size-4" /> ₹{costLabel.toLocaleString("en-IN")} / person</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionBtn icon={Edit3} label="Edit plan" />
              <ActionBtn icon={Share2} label="Share" />
              <ActionBtn icon={Download} label="PDF" primary />
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_400px] gap-6">
          {/* LEFT: timeline */}
          <div className="space-y-4">
            {itinerary.map((day: any) => {
              const isOpen = open === (day.day === "Arrival" ? 1 : (typeof day.day === 'string' ? parseInt(day.day) : day.day));
              const dayLabel = day.day;
              const dayActivities = day.places || day.items || day.activities || [];
              
              return (
                <div key={day.day} className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : (day.day === "Arrival" ? 1 : parseInt(day.day)))}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/40 transition"
                  >
                    <div className="size-12 rounded-2xl bg-warm-gradient text-white grid place-items-center font-display font-bold shadow-cta">
                      {typeof dayLabel === 'number' ? `D${dayLabel}` : (dayLabel.toString().startsWith('D') ? dayLabel : `D${dayLabel}`)}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-lg">{day.title || day.theme || `Exploring ${destinationName}`}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{dayActivities.length} stops · ~ 8 hrs</div>
                    </div>
                    <ChevronDown className={`size-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1">
                      <div className="relative ml-6 border-l-2 border-dashed border-border space-y-4 py-2">
                        {dayActivities.map((it: any, i: number) => {
                          const Ico = iconMap[it.icon] ?? MapPin;
                          const placeName = it.name || it.place || it.activity;
                          const placeDesc = it.tag || it.desc || it.description || it.category;
                          const placeTime = it.time || it.bestTime || "Scheduled";
                          const isCurrentlyActive = activePlace && (placeName === (activePlace.name || activePlace.place));
                          
                          return (
                            <div key={i} className="relative pl-6">
                              <div className={`absolute -left-[13px] top-1 size-6 rounded-full border-2 grid place-items-center transition-colors ${
                                isCurrentlyActive ? "bg-accent border-accent" : "bg-card border-accent"
                              }`}>
                                <Ico className={`size-3 ${isCurrentlyActive ? "text-white" : "text-accent"}`} />
                              </div>
                              <div className={`rounded-2xl p-4 transition-all duration-300 ${
                                isCurrentlyActive ? "bg-accent/10 border border-accent/20" : "bg-secondary hover:bg-primary-soft border border-transparent"
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className={`text-xs font-semibold ${isCurrentlyActive ? "text-accent" : "text-primary"}`}>{placeTime}</div>
                                  <button 
                                    onClick={() => setActivePlace(it)}
                                    className={`text-xs font-bold transition hover:opacity-70 ${isCurrentlyActive ? "text-accent" : "text-muted-foreground"}`}
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
                  )}
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
                  { l: "Stays", v: (plan?.totalBudget || plan?.budget || 38400) * 0.5, c: "bg-primary" },
                  { l: "Travel", v: (plan?.totalBudget || plan?.budget || 38400) * 0.2, c: "bg-accent" },
                  { l: "Food & experiences", v: (plan?.totalBudget || plan?.budget || 38400) * 0.25, c: "bg-success" },
                  { l: "Buffer", v: (plan?.totalBudget || plan?.budget || 38400) * 0.05, c: "bg-muted-foreground" },
                ].map((r) => (
                  <div key={r.l}>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.l}</span>
                      <span className="font-semibold">₹{r.v.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${r.c}`} style={{ width: `${(r.v / (plan?.totalBudget || plan?.budget || 38400)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ActionBtn({ icon: Icon, label, primary }: { icon: React.ComponentType<{ className?: string }>; label: string; primary?: boolean }) {
  return (
    <button className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold transition ${
      primary ? "bg-warm-gradient text-white shadow-cta" : "glass text-white hover:bg-white/15"
    }`}>
      <Icon className="size-4" /> {label}
    </button>
  );
}
