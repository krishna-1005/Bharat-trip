import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { X, ArrowRight, Plane, Train, Car, Sparkles, Clock, MoveHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PlannerMulti() {
  return (
    <ProtectedRoute>
      <PlannerMultiContent />
    </ProtectedRoute>
  );
}

function PlannerMultiContent() {
  const [stops, setStops] = useState(["Bengaluru", "Mysuru", "Coorg"]);
  const [newStop, setNewStop] = useState("");
  const [mode, setMode] = useState("car");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  const handleGenerate = async () => {
    if (stops.length < 2) {
      toast.error("Please add at least 2 destinations for a multi-city trip");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/plan/generate", {
        cities: stops,
        city: stops[0], // fallback for old code
        days: stops.length * 2, // Estimate 2 days per city
        budget: 50000,
        interests: ["Sightseeing", "Nature"],
        travelerType: "friends",
        pace: "balanced",
        isMultiCity: true
      });
      
      const plan = res.data.plan;
      const planId = plan._id || plan.id;
      navigate(`/results?planId=${planId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate multi-city plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 2 · Multi-city</div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Chart your journey.</h1>

        {/* Stops input */}
        <div className="mt-8 rounded-3xl bg-card border border-border p-6 shadow-soft">
          <div className="text-sm font-medium mb-3">Destinations</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {stops.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-primary-soft text-primary text-sm font-semibold">
                <span className="size-5 rounded-full bg-primary text-primary-foreground grid place-items-center text-[11px]">{i + 1}</span>
                {s}
                <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))} className="hover:bg-primary/10 rounded-full p-0.5"><X className="size-3.5" /></button>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 max-w-md">
            <input 
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
              placeholder="Add another city..."
              className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm"
            />
            <button 
              onClick={handleAddStop}
              className="h-11 px-4 rounded-xl bg-secondary text-sm font-semibold hover:bg-border transition"
            >
              Add
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="text-sm font-medium">Travel mode:</div>
            {[
              { id: "car", label: "Car", icon: Car },
              { id: "train", label: "Train", icon: Train },
              { id: "flight", label: "Flight", icon: Plane },
            ].map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    active ? "bg-primary text-primary-foreground shadow-pop" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <m.icon className="size-4" /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Route visualization */}
        <div className="mt-6 rounded-3xl bg-card border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="font-display font-bold text-lg">Route Preview</div>
            <button className="text-sm font-semibold text-accent inline-flex items-center gap-1.5">
              <Sparkles className="size-4" /> Optimise route
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex items-center gap-2 min-w-max pb-4">
              {stops.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-2xl border border-border bg-surface p-4 w-44 shadow-soft">
                    <div className="text-xs text-muted-foreground">Stop {i + 1}</div>
                    <div className="font-display font-bold mt-1">{s}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" /> 2 nights
                    </div>
                  </div>
                  {i < stops.length - 1 && (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <div className="text-[11px] font-semibold">{120 + i * 40} km</div>
                      <MoveHorizontal className="size-5 text-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Stat label="Total cities" value={stops.length.toString()} />
            <Stat label="Estimated duration" value={`${stops.length * 2} days`} />
            <Stat label="Estimated cost" value={`₹${(stops.length * 12000).toLocaleString("en-IN")}`} accent />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-warm-gradient text-white font-semibold shadow-cta inline-flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {loading ? "Generating journey..." : "Generate journey"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-bold text-xl ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}
