import { Link, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { destinations, destinationItineraries } from "@/lib/sample-data";
import { 
  Edit3, Share2, Copy, MapPin, Calendar, Wallet, Hotel, Plane, 
  Utensils, Camera, Landmark, Ship, Music, ShoppingBag, Sun, 
  Sparkles, Coffee, Compass, Heart, ExternalLink
} from "lucide-react";
import { useMemo, useState } from "react";
import { MapPreview } from "@/components/MapPreview";
import { getNextThreeMonths } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  utensils: Utensils,
  camera: Camera,
  landmark: Landmark,
  ship: Ship,
  music: Music,
  "shopping-bag": ShoppingBag,
  sun: Sun,
};

export default function TripDetails() {
  return (
    <ProtectedRoute>
      <TripDetailsContent />
    </ProtectedRoute>
  );
}

function TripDetailsContent() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [activePlace, setActivePlace] = useState<any>(null);

  const d = useMemo(() => {
    return destinations.find((dest) => dest.id === id) || destinations[0];
  }, [id]);

  const itinerary = useMemo(() => {
    return destinationItineraries[d.id] || destinationItineraries.jaipur;
  }, [d.id]);

  return (
    <AppShell>
      <div className="relative pb-20">
        {/* Premium Header */}
        <div className="h-[400px] md:h-[500px] relative overflow-hidden group">
          <img 
            src={d.img} 
            alt={d.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 lg:px-10 h-full flex flex-col justify-end pb-12">
            <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest">
                {d.tag}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                {d.region}
              </span>
            </div>
            
            <h1 className="font-display font-bold text-5xl md:text-7xl text-white tracking-tighter max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              {d.id === 'jaipur' ? 'Royal Rajasthan' : `${d.name} Escape`}
            </h1>
            
            <div className="mt-6 flex flex-wrap gap-6 text-white/90 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <MapPin className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">{d.name}, {d.isInternational ? d.region : "India"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Calendar className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">Available {getNextThreeMonths()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Wallet className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">{d.price} / person</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-10 -mt-10 relative z-10">
          {/* Action Bar */}
          <div className="rounded-3xl bg-surface/80 backdrop-blur-2xl border border-white/20 shadow-pop p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Link to={`/results?sampleId=${d.id}`} className="h-12 px-6 rounded-2xl bg-warm-gradient text-white text-sm font-bold inline-flex items-center gap-2 shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Edit3 className="size-4" /> Edit Itinerary
              </Link>
              <button className="h-12 px-6 rounded-2xl bg-secondary hover:bg-secondary/80 text-sm font-bold inline-flex items-center gap-2 transition-all">
                <Share2 className="size-4" /> Share
              </button>
              <button className="h-12 px-6 rounded-2xl bg-secondary hover:bg-secondary/80 text-sm font-bold inline-flex items-center gap-2 transition-all">
                <Copy className="size-4" /> Duplicate
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 px-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><Heart className="size-4 text-destructive" /> 1.2k likes</span>
              <span className="flex items-center gap-1.5"><Compass className="size-4 text-primary" /> 450+ booked</span>
            </div>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              <section className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-3xl tracking-tight">Experience Overview</h2>
                  <p className="text-muted-foreground mt-3 text-lg leading-relaxed max-w-3xl">
                    A {d.days} {d.tag.toLowerCase()} immersion through {d.name}'s most iconic spots. 
                    Curated for travelers who value authenticity, slow-paced exploration, and premium local experiences.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Calendar} label="Duration" value={d.days} color="bg-blue-500/10 text-blue-600" />
                  <StatCard icon={Hotel} label="Stays" value="Luxury Haveli" color="bg-purple-500/10 text-purple-600" />
                  <StatCard icon={Plane} label="Transfers" value="Included" color="bg-emerald-500/10 text-emerald-600" />
                  <StatCard icon={Sparkles} label="Style" value="Curated AI" color="bg-amber-500/10 text-amber-600" />
                </div>
              </section>

              {/* Highlights Section */}
              <section className="rounded-3xl bg-secondary/30 p-8 border border-border">
                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <Coffee className="size-5 text-accent" /> Quick Highlights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Private guided tours of major landmarks",
                    "Authentic local cuisine tasting experiences",
                    "Premium stays in heritage properties",
                    "All intra-city transfers pre-arranged"
                  ].map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Sparkles className="size-3 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80">{h}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Itinerary Section */}
              <section className="space-y-6">
                <h2 className="font-display font-bold text-3xl tracking-tight">Day by Day Itinerary</h2>
                <div className="space-y-6">
                  {itinerary.map((day) => (
                    <div key={day.day} className="group rounded-3xl bg-card border border-border shadow-soft overflow-hidden transition-all hover:border-accent/30">
                       <div className="p-6 bg-secondary/20 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-warm-gradient text-white grid place-items-center font-display font-bold shadow-cta">
                            D{day.day}
                          </div>
                          <div>
                            <div className="font-display font-bold text-xl">{day.title}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Morning · Afternoon · Evening</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 pt-2 space-y-6">
                        <div className="relative ml-6 pl-10 border-l-2 border-dashed border-border/50 space-y-8 py-4">
                          {day.items.map((it, i) => {
                            const Icon = iconMap[it.icon] || MapPin;
                            const isCurrentlyActive = activePlace && (it.place === (activePlace.name || activePlace.place));
                            
                            return (
                              <div key={i} className="relative">
                                <div className={`absolute -left-[51px] top-0 size-10 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                                  isCurrentlyActive ? 'bg-accent border-accent text-white shadow-pop' : 'bg-card border-border text-primary'
                                }`}>
                                  <Icon className="size-5" />
                                </div>
                                <div className={`rounded-2xl p-5 transition-all duration-300 ${
                                  isCurrentlyActive ? 'bg-accent/5 border border-accent/20 ring-1 ring-accent/10' : 'bg-secondary/40 hover:bg-secondary border border-transparent'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className={`text-xs font-bold uppercase tracking-widest ${isCurrentlyActive ? 'text-accent' : 'text-primary'}`}>
                                      {it.time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => setActivePlace(it)}
                                        className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md transition-all ${
                                          isCurrentlyActive 
                                            ? "bg-accent text-white" 
                                            : "bg-background text-muted-foreground hover:bg-primary hover:text-white"
                                        }`}
                                      >
                                        {isCurrentlyActive ? "Active" : "Focus on Map"}
                                      </button>
                                      <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md bg-background text-muted-foreground hover:bg-accent hover:text-white transition-all border border-border"
                                      >
                                        <ExternalLink className="size-3" /> Maps
                                      </a>
                                    </div>
                                  </div>
                                  <div className="font-display font-bold text-lg mt-1">{it.place}</div>
                                  <div className="text-sm text-muted-foreground leading-relaxed mt-1">{it.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Content */}
            <aside className="space-y-6">
              <div className="space-y-6">
                {/* Real Map Card */}
                <div className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-pop h-[450px] relative group">
                  <MapPreview 
                    itinerary={itinerary} 
                    activePlace={activePlace} 
                    onMarkerClick={(p) => setActivePlace(p)} 
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                      Interactive Map
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] z-10">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-pop border border-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-white">
                          <Compass className="size-4" />
                        </div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {itinerary.reduce((acc, day) => acc + day.items.length, 0)} Curated Stops
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Control Card */}
                <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-pop">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <Wallet className="size-5 text-accent" /> Budget Control
                    </h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded">AI Estimate</div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { l: "Stays", p: 45, c: "bg-indigo-500", i: Hotel },
                      { l: "Food", p: 25, c: "bg-orange-500", i: Utensils },
                      { l: "Transport", p: 15, c: "bg-sky-500", i: Plane },
                      { l: "Activities", p: 15, c: "bg-rose-500", i: Camera },
                    ].map((r) => {
                      const totalNum = parseInt(d.price.replace(/[^\d]/g, ""));
                      const amount = Math.round((totalNum * r.p) / 100);
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
                              <div className="font-bold">₹{amount.toLocaleString("en-IN")}</div>
                              <div className="text-[10px] text-muted-foreground font-bold">{r.p}%</div>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full ${r.c} transition-all duration-1000 group-hover:brightness-110`}
                              style={{ width: `${r.p}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Estimate</div>
                    <div className="text-2xl font-display font-bold text-primary mt-1">
                      {d.price} <span className="text-sm font-normal text-muted-foreground">/ person</span>
                    </div>
                  </div>
                </div>

                {/* Stay Suggestions */}
                <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
                    Recommended Stays
                    <Link to="/explore" className="text-[10px] text-accent font-bold uppercase hover:underline">View All</Link>
                  </h3>
                  <div className="space-y-3">
                    {["The Heritage Palace", "The Luxury Boutique", "Royal Haveli"].map((h, i) => (
                      <div key={h} className="group flex items-center gap-4 rounded-3xl bg-secondary/50 p-3 hover:bg-secondary transition-all cursor-pointer border border-transparent hover:border-border">
                        <div className="size-16 rounded-2xl bg-warm-gradient shrink-0 shadow-soft group-hover:scale-105 transition-transform overflow-hidden relative">
                           <div className="absolute inset-0 bg-black/20" />
                           <Hotel className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 size-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{h}</div>
                          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{d.tag} Property</div>
                          <div className="text-sm font-bold text-primary mt-1">₹{6+i},200<span className="text-[10px] font-normal text-muted-foreground ml-1">/night</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 rounded-2xl bg-secondary font-bold text-sm hover:bg-border transition-colors">
                    Compare All Hotels
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string, color: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-5 shadow-soft hover:-translate-y-1 transition-transform">
      <div className={`size-10 rounded-2xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="size-5" />
      </div>
      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="text-base font-display font-bold text-foreground mt-0.5">{value}</div>
    </div>
  );
}
