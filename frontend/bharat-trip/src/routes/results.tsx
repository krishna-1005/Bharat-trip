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
  User,
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
  Info,
  Clock,
  Sun,
  CloudSun,
  ShieldCheck,
  Zap,
  Map,
  Eye,
  AlertTriangle,
  Award,
  Star,
  Navigation,
  Search,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PDFViewerModal } from "@/components/PDFViewerModal";

/* ── 1. SIDEBAR COMPONENTS ── */

function AutoScoutAgent({ city }: { city: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground dark:text-white">
          <Search className="size-5 text-primary" /> Auto-Scout Agent
        </div>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-primary/20">Premium Scan</span>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-accent">
            <Zap className="size-3" /> Best Value Window
          </div>
          <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">
            Book your flights to {city} on a Wednesday instead of a Monday to save up to 15% on airfare. Additionally, consider visiting during the shoulder season (April to May) to save up to 20% on accommodations.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 border-l-amber-500/50 border-l-4">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-amber-500">
            <Clock className="size-3" /> Real-time Local Alerts
          </div>
          <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">
            The Red Fort is closed on Mondays, and the Qutub Minar is under renovation until August. However, the nearby Hauz Khas village is a great alternative, offering a mix of historic sites, street food, and trendy boutiques.
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[9px] font-bold text-muted-foreground/30 dark:text-white/20 uppercase tracking-widest italic">Smarter with every scan using GoTripo Intelligence</p>
      </div>
    </div>
  );
}

function AgenticValidationStack({ city }: { city: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground dark:text-white">
          <Activity className="size-5 text-emerald-500" /> Validation Stack
        </div>
        <div className="text-[10px] font-bold text-muted-foreground dark:text-white/40 bg-secondary dark:bg-white/5 px-2 py-0.5 rounded uppercase">Live Scan</div>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 mb-6">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/20 grid place-items-center text-emerald-500 shadow-sm">
               <Sun className="size-5" />
            </div>
            <div>
               <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/40">Current Weather</div>
               <div className="text-xs font-bold text-foreground dark:text-white">Clear skies, 28°C. Perfect for sightseeing.</div>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {[
          "Verifying opening hours...",
          "Checking weather feasibility...",
          "Calculating route efficiency...",
          "Syncing local price averages..."
        ].map((check, i) => (
          <div key={i} className="flex items-center justify-between group">
            <span className="text-xs text-muted-foreground dark:text-white/60 group-hover:text-foreground dark:group-hover:text-white transition-colors">{check}</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border dark:border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/30">Confidence Score</span>
        <span className="text-2xl font-display font-black text-emerald-500">98.4%</span>
      </div>
    </div>
  );
}

function PlanIntegrityReport({ city }: { city: string }) {
  return (
    <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-soft relative overflow-hidden group backdrop-blur-md">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
        <ShieldCheck className="size-24" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-soft text-primary-foreground font-bold">
          <ShieldCheck className="size-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-primary">Integrity Report</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/30">Transparency & Trust Index</p>
        </div>
      </div>

      <div className="grid gap-4 relative z-10">
        <div className="p-4 rounded-2xl bg-card dark:bg-[#0B1221] border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-primary font-bold">
            <Award className="size-3" /> Expert Verdict
          </div>
          <p className="text-sm font-medium italic text-muted-foreground dark:text-white/70 leading-relaxed">
            "Rahul from Delhi recommends this plan for a comprehensive city experience."
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-border dark:border-white/10">
          <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase text-muted-foreground dark:text-white/30">
            <span>Decision Logic</span>
            <span className="text-emerald-500 dark:text-emerald-400">Optimized</span>
          </div>
          <div className="space-y-2">
            {[
              "Backtrack Prevention",
              "Opening Hours Sync",
              "Crowd Avoidance"
            ].map((label) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground dark:text-white/50">{label}</span>
                <span className="flex items-center gap-1 font-bold text-[9px] uppercase text-emerald-500 dark:text-emerald-400">
                  <Check className="size-3" /> Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[9px] font-bold text-muted-foreground dark:text-white/20 uppercase tracking-widest px-1 relative z-10">
        <div className="flex items-center gap-1.5">
          <Zap className="size-3 text-emerald-500" /> Real-time cross-checked
        </div>
        <div>v2.1 Agentic Core</div>
      </div>
    </div>
  );
}

function TransportRecommendation({ transport }: { transport?: any }) {
  if (!transport) return null;
  const Icon = transport.icon === "train" ? Train : transport.icon === "car" ? Car : Plane;
  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between text-foreground dark:text-white">
        Travel from {transport.from}
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-primary/20">Recommended</span>
      </h3>
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10">
        <div className="size-14 rounded-xl bg-warm-gradient text-white grid place-items-center shrink-0 shadow-soft">
          <Icon className="size-7" />
        </div>
        <div>
          <div className="font-display font-bold text-xl text-primary">{transport.mode}</div>
          <div className="text-xs text-muted-foreground dark:text-white/50 font-medium mt-0.5 flex items-center gap-1.5">
            <MapPin className="size-3" /> {transport.distance} km total distance
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
        <Info className="size-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">{transport.reason}</p>
      </div>
    </div>
  );
}

function StayRecommendations({ lat, lng, city, budgetTier, recommendedStay, travelerType }: { lat: number; lng: number; city: string; budgetTier: string; recommendedStay?: any; travelerType?: string }) {
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.post("/nearby", { lat, lng, city, category: "Stay", radius: 15, travelerType })
      .then(res => {
        let nearbyStays = res.data.slice(0, 3);
        if (recommendedStay) nearbyStays = [recommendedStay, ...nearbyStays.filter((s: any) => s.name !== recommendedStay.name)].slice(0, 3);
        setStays(nearbyStays);
      })
      .catch(() => recommendedStay && setStays([recommendedStay]))
      .finally(() => setLoading(false));
  }, [lat, lng, city, recommendedStay]);

  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between text-foreground dark:text-white">
        Nearby Boutique Hotels
        <span className="text-[10px] bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-emerald-500/20">Matched to Budget</span>
      </h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl w-full bg-secondary dark:bg-white/5" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {stays.map((s, i) => (
            <div key={i} className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-between group hover:bg-secondary/50 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500 grid place-items-center shadow-sm">
                   <Hotel className="size-5 text-white" />
                </div>
                <div>
                   <div className="font-bold text-sm text-foreground dark:text-white line-clamp-1">{s.name}</div>
                   <div className="text-[10px] text-muted-foreground dark:text-white/40 mt-0.5 flex items-center gap-1.5">
                      <Star className="size-2.5 text-amber-500 fill-current" /> {s.rating || "4.5"} · {s.reviews || "800+"} Reviews
                   </div>
                </div>
              </div>
              <div className="text-right">
                 <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">₹{(s.avgCost || 2500 + i * 500).toLocaleString()}</div>
                 <div className="text-[9px] font-bold text-muted-foreground dark:text-white/30 uppercase tracking-widest">per night</div>
              </div>
            </div>
          ))}
          <button className="w-full mt-4 py-3 rounded-xl border border-border dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/40 hover:bg-secondary dark:hover:bg-white/5 transition flex items-center justify-center gap-2">Explore All Accommodations <ArrowRight className="size-3" /></button>
        </div>
      )}
    </div>
  );
}

/* ── 2. SUMMARY COMPONENTS ── */

function TripBlueprint({ plan }: { plan: any }) {
  if (!plan) return null;
  const breakdown = plan.costBreakdown || {
    hotel: plan.totalTripCost * 0.4 || 15000,
    food: plan.totalTripCost * 0.2 || 8000,
    transport: plan.totalTripCost * 0.15 || 5000,
    activities: plan.totalTripCost * 0.25 || 10000
  };

  const details = [
    { icon: User, label: "Traveler", value: plan.travelerType || "Solo" },
    { icon: Zap, label: "Pace", value: plan.pace || "Moderate" },
    { icon: Wallet, label: "Budget", value: plan.totalBudget ? `₹${plan.totalBudget.toLocaleString()}` : "Custom" },
    { icon: Calendar, label: "Duration", value: `${plan.days} Days` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Cost Card */}
      <div className="bg-card dark:bg-[#0B1221] border border-border p-6 rounded-3xl shadow-soft">
         <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2 text-foreground dark:text-white">
            <Receipt className="size-4 text-primary" /> Budget Blueprint
         </h3>
         <div className="space-y-3">
            {[
              { label: "Accommodations", val: breakdown.hotel, color: "bg-blue-400" },
              { label: "Food & Dining", val: breakdown.food, color: "bg-orange-400" },
              { label: "Local Transport", val: breakdown.transport, color: "bg-emerald-400" },
              { label: "Activities", val: breakdown.activities, color: "bg-purple-400" }
            ].map(it => (
              <div key={it.label} className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full ${it.color}`} />
                    <span className="text-muted-foreground dark:text-white/60">{it.label}</span>
                 </div>
                 <span className="font-bold text-foreground dark:text-white">₹{Math.round(it.val).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border dark:border-white/10 mt-3 flex justify-between items-end">
               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/30">Total Estimate</span>
               <span className="text-xl font-display font-bold text-primary">₹{Number(plan?.totalTripCost || 38400).toLocaleString()}</span>
            </div>
         </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card dark:bg-[#0B1221] border border-border p-6 rounded-3xl shadow-soft">
         <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2 text-foreground dark:text-white">
            <User className="size-4 text-accent" /> Traveler Profile
         </h3>
         <div className="grid grid-cols-2 gap-3 mb-4">
            {details.slice(0, 2).map(d => (
              <div key={d.label} className="bg-secondary dark:bg-white/5 p-3 rounded-2xl border border-border dark:border-white/5">
                 <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/30 mb-1">{d.label}</div>
                 <div className="text-xs font-bold text-foreground dark:text-white">{d.value}</div>
              </div>
            ))}
         </div>
         <div className="bg-secondary dark:bg-white/5 p-3 rounded-2xl border border-border dark:border-white/5 flex justify-between items-center">
            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/30">Budget Tier</div>
            <div className="text-xs font-bold text-foreground dark:text-white">{plan?.budgetTier || "Standard"}</div>
         </div>
      </div>

      {/* Insights Card */}
      <div className="bg-card dark:bg-[#0B1221] border border-border p-6 rounded-3xl shadow-soft relative overflow-hidden group">
         <Sparkles className="absolute -right-4 -top-4 size-20 text-accent/5 group-hover:rotate-12 transition-transform" />
         <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2 text-foreground dark:text-white">
            <Sparkles className="size-4 text-accent" /> Co-pilot Insights
         </h3>
         <p className="text-[11px] text-muted-foreground dark:text-white/60 leading-relaxed italic line-clamp-4 font-medium">
            "{plan?.summary || `A perfectly balanced immersion designed to cover the best of the city while respecting your style.`}"
         </p>
         <div className="mt-4 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-secondary dark:bg-white/5 grid place-items-center shadow-sm">
               <Sun className="size-4 text-amber-500" />
            </div>
            <div>
               <div className="text-[8px] font-bold uppercase text-muted-foreground dark:text-white/30 tracking-widest">Ideal Visit</div>
               <div className="text-[10px] font-bold text-foreground dark:text-white">Sept - March (Best Weather)</div>
            </div>
         </div>
      </div>
    </div>
  );
}

/* ── 3. MAIN COMPONENT ── */

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const sampleId = searchParams.get("sampleId");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(1);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If it's a dynamic plan, user must be logged in
    if (planId && !authLoading && !user) {
      toast.info("Please sign in to view this generated itinerary");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (planId) {
      setLoading(true);
      api.get(`/trips/${planId}`)
        .then((res) => { setPlan(res.data); setLoading(false); })
        .catch(() => { toast.error("Failed to load plan"); setLoading(false); });
    } else if (sampleId) {
      const sample = destinationItineraries[sampleId];
      const destInfo = destinations.find(d => d.id === sampleId);
      if (sample && destInfo) {
        setPlan({
          title: `${destInfo.name} AI Plan`,
          destination: destInfo.name,
          city: destInfo.name,
          days: parseInt(destInfo.days),
          itinerary: sample,
          totalBudget: 38400,
          summary: `A curated ${destInfo.days} day immersion through ${destInfo.name}.`,
          isSample: true
        });
        setLoading(false);
      }
    }
  }, [planId, sampleId]);

  if (loading) return <AppShell><div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-40 rounded-3xl w-full bg-secondary dark:bg-white/5" /></div></AppShell>;

  const itinerary = plan?.itinerary || [];
  const destinationName = plan?.destination || plan?.city || "Delhi";
  const costLabel = plan?.totalTripCost || plan?.totalBudget || 38400;

  return (
    <AppShell>
      <div className="min-h-screen bg-background dark:bg-[#020817] text-foreground transition-colors duration-300">
        <div className="px-4 lg:px-10 py-8 max-w-[1600px] mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-foreground dark:text-white">{plan?.title || `${destinationName} AI Plan`}</h1>
              <div className="mt-4 flex flex-wrap gap-3">
                 <div className="flex items-center gap-1.5 bg-secondary dark:bg-white/5 border border-border dark:border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground dark:text-white">
                    <Calendar className="size-3.5 text-primary" /> {plan?.days || 5} days
                 </div>
                 <div className="flex items-center gap-1.5 bg-secondary dark:bg-white/5 border border-border dark:border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground dark:text-white">
                    <MapPin className="size-3.5 text-primary" /> {destinationName}
                 </div>
                 <div className="flex items-center gap-1.5 bg-secondary dark:bg-white/5 border border-border dark:border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground dark:text-white">
                    <Wallet className="size-3.5 text-primary" /> ₹{Number(costLabel).toLocaleString("en-IN")}
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="h-11 px-6 rounded-2xl bg-secondary dark:bg-white/10 border border-border dark:border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-border dark:hover:bg-white/20 transition text-foreground dark:text-white"><Check className="size-4" /> Saved</button>
               <button onClick={() => setIsPdfModalOpen(true)} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 shadow-cta hover:opacity-90 transition">
                  <Download className="size-4" /> Export PDF
               </button>
               <button className="size-11 rounded-2xl bg-emerald-500 text-white grid place-items-center shadow-soft hover:opacity-90 transition">
                  <Share2 className="size-4" />
               </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-10">
               <TripBlueprint plan={plan} />
               
               <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-2xl tracking-tight text-foreground dark:text-white">Daily Itinerary</h2>
                  <div className="text-[10px] font-bold text-muted-foreground dark:text-white/30 uppercase tracking-widest">Tap to expand</div>
               </div>

               <div className="space-y-6">
                  {itinerary.map((day: any, idx: number) => (
                    <div key={idx} className={`rounded-3xl border transition-all duration-300 ${open === idx + 1 ? 'border-primary/30 bg-card dark:bg-[#0B1221] shadow-pop ring-1 ring-primary/10' : 'border-border bg-card dark:bg-white/[0.02] hover:bg-card'}`}>
                       <button onClick={() => setOpen(open === idx + 1 ? null : idx + 1)} className="w-full flex items-center gap-5 p-6 text-left">
                          <div className={`size-14 rounded-2xl grid place-items-center font-display font-bold text-lg transition-all ${open === idx + 1 ? 'bg-primary text-primary-foreground shadow-cta' : 'bg-secondary dark:bg-white/5 text-muted-foreground dark:text-white/40'}`}>D{idx + 1}</div>
                          <div className="flex-1">
                             <div className="font-display font-bold text-xl text-foreground dark:text-white">{day.title || `Exploring ${destinationName}`}</div>
                             <div className="text-xs text-muted-foreground dark:text-white/40 mt-1 flex items-center gap-3">
                                <span className="flex items-center gap-1 font-medium"><Clock className="size-3 text-primary/70" /> 6h active time</span>
                                <span className="flex items-center gap-1 font-medium"><MapPin className="size-3 text-primary/70" /> {(day.places || []).length} locations</span>
                             </div>
                          </div>
                          <ChevronDown className={`size-5 text-muted-foreground dark:text-white/20 transition-transform ${open === idx + 1 ? 'rotate-180' : ''}`} />
                       </button>

                       {open === idx + 1 && (
                         <div className="px-6 pb-6 space-y-4">
                            {(day.places || []).map((p: any, i: number) => (
                              <div key={i} className="group p-5 rounded-[2rem] bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/5 flex items-center justify-between hover:bg-secondary/50 dark:hover:bg-white/10 transition-all shadow-sm">
                                 <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-background dark:bg-[#0B1221] border border-border dark:border-white/10 grid place-items-center text-muted-foreground dark:text-white/60 group-hover:text-primary transition-colors"><Landmark className="size-6" /></div>
                                    <div>
                                       <div className="font-bold text-lg text-foreground dark:text-white">{p.name || p.place}</div>
                                       <div className="flex items-center gap-3 mt-1.5">
                                          <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1.5"><Clock className="size-3" /> {p.time || "Morning"}</div>
                                          <div className="text-[10px] font-bold text-muted-foreground dark:text-white/30 uppercase tracking-widest">{p.category || "Popular Spot"}</div>
                                       </div>
                                    </div>
                                 </div>
                                 <button className="px-4 py-2 rounded-xl bg-background dark:bg-white/5 border border-border dark:border-white/10 text-xs font-bold text-foreground dark:text-white hover:bg-secondary dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm">View Details</button>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <aside className="space-y-6">
               <div className="rounded-[2.5rem] border border-border bg-card dark:bg-[#0B1221] overflow-hidden shadow-pop h-[400px]">
                  <MapPreview itinerary={itinerary} activePlace={activePlace} onMarkerClick={setActivePlace} />
               </div>
               <StayRecommendations lat={28.6139} lng={77.209} city={destinationName} budgetTier="medium" />
               <AutoScoutAgent city={destinationName} />
               <AgenticValidationStack city={destinationName} />
               <PlanIntegrityReport city={destinationName} />
            </aside>
          </div>
        </div>
      </div>
      <PDFViewerModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} plan={plan} />
    </AppShell>
  );
}
