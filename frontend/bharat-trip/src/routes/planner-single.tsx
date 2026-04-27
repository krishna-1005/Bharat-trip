import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Sparkles, 
  Mountain, 
  Tent, 
  Heart, 
  Loader2, 
  Flame 
} from "lucide-react";
import api, { generatePlan } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

const styles = [
  { id: "luxury", label: "Luxury", icon: Sparkles },
  { id: "backpacking", label: "Backpacking", icon: Tent },
  { id: "spiritual", label: "Spiritual", icon: Heart },
  { id: "adventure", label: "Adventure", icon: Mountain },
];

export default function PlannerSingle() {
  return (
    <PlannerSingleContent />
  );
}

function PlannerSingleContent() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDest = searchParams.get("dest") || "Delhi";
  const initialDays = parseInt(searchParams.get("days") || "5");

  const [destination, setDestination] = useState(initialDest);
  const [days, setDays] = useState(initialDays);
  const [budget, setBudget] = useState(35000);
  const [style, setStyle] = useState("luxury");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  // Auto-trigger generation if we just logged in and have pending data
  useEffect(() => {
    if (authLoading || !user) return;
    
    const pending = sessionStorage.getItem("pending_plan_single");
    if (pending) {
      sessionStorage.removeItem("pending_plan_single");
      const data = JSON.parse(pending);
      // Restore state if needed, but the data is already in the function call below
      setDestination(data.city);
      setDays(data.days);
      setBudget(data.budget);
      setStyle(data.travelerType);
      
      // We can't call handleGenerate directly because it needs the latest state
      // but we can pass the data to a helper or just run it with the parsed data
      const runGeneration = async () => {
        setLoading(true);
        try {
          const plan = await generatePlan(data);
          const planId = plan._id || plan.id;
          navigate(`/results?planId=${planId}`);
        } catch (err: any) {
          toast.error(err.message || "Failed to generate plan");
        } finally {
          setLoading(false);
        }
      };
      runGeneration();
    }
  }, [user, authLoading, navigate]);

  // Fetch quick preview data when destination changes
  useEffect(() => {
    if (!destination.trim()) return;
    
    const delayDebounceFn = setTimeout(() => {
      setFetchingPreview(true);
      api.post("/nearby", { city: destination, radius: 20 })
        .then(res => {
          setPreviewData(res.data.slice(0, 4));
        })
        .catch(() => {
          // Fallback if API fails
          setPreviewData([
            { name: "Major Landmark" },
            { name: "Popular Cafe" },
            { name: "Historical Site" },
            { name: "Shopping Street" }
          ]);
        })
        .finally(() => {
          setFetchingPreview(false);
        });
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [destination]);

  const handleGenerate = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    const planData = {
      city: destination,
      days: days,
      budget,
      interests: ["Photography", "Food trail"],
      travelerType: style,
      pace: "balanced"
    };

    if (!user) {
      // Save data and redirect to auth
      sessionStorage.setItem("pending_plan_single", JSON.stringify(planData));
      toast.info("Please sign in to save and view your plan");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setLoading(true);
    try {
      const plan = await generatePlan(planData);
      const planId = plan._id || plan.id;
      navigate(`/results?planId=${planId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 2 · Single destination</div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Tell us the vibe.</h1>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* LEFT: Inputs */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-soft space-y-7">
            <Field label="Destination" icon={<MapPin className="size-4" />}>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="From" icon={<Calendar className="size-4" />}>
                <input type="date" defaultValue="2025-03-12" className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm" />
              </Field>
              <Field label="To" icon={<Calendar className="size-4" />}>
                <input type="date" defaultValue="2025-03-16" className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm" />
              </Field>
            </div>

            <Field label={`Budget · ₹${budget.toLocaleString("en-IN")}`} icon={<Wallet className="size-4" />}>
              <input
                type="range"
                min={10000}
                max={150000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹10k</span><span>₹80k</span><span>₹1.5L</span>
              </div>
            </Field>

            <div>
              <div className="text-sm font-medium mb-3">Travel style</div>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((s) => {
                  const active = style === s.id;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary-soft shadow-pop"
                          : "border-border bg-surface hover:border-foreground/20"
                      }`}
                    >
                      <Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="mt-2 font-semibold text-sm">{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-warm-gradient text-white font-semibold shadow-cta inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Generating..." : "Generate Trip Plan"}
            </button>
          </div>

          {/* RIGHT: Live preview */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Live preview</div>
                <div className="font-display font-bold text-xl mt-1 capitalize">{destination || "Planning"} · {days} days</div>
              </div>
              <div className="size-9 rounded-full bg-warm-gradient grid place-items-center text-white shadow-cta">
                <Sparkles className="size-4" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {fetchingPreview ? (
                 [1,2,3,4].map((i) => (
                  <div key={i} className="flex gap-3 items-start animate-pulse">
                    <div className="size-10 rounded-xl bg-secondary grid place-items-center font-bold text-sm shrink-0">D{i}</div>
                    <div className="flex-1 space-y-2 mt-1">
                      <div className="h-3 rounded bg-secondary w-3/4" />
                      <div className="h-2.5 rounded bg-secondary w-1/2 opacity-50" />
                    </div>
                  </div>
                ))
              ) : (
                previewData.map((p, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center font-bold text-sm shrink-0">D{i+1}</div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">AI suggested for {style}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-foreground text-background p-4 text-sm flex items-center gap-2">
              <Flame className="size-4 text-accent animate-pulse" />
              <span>GoTripo is sketching ideas for <b>{destination}</b></span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </div>
      {children}
    </div>
  );
}
