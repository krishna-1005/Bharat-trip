import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import jaipur from "@/assets/dest-jaipur.jpg";
import { Edit3, Share2, Copy, MapPin, Calendar, Wallet, Hotel, Plane, Utensils, Camera } from "lucide-react";

export default function TripDetails() {
  return (
    <ProtectedRoute>
      <TripDetailsContent />
    </ProtectedRoute>
  );
}

function TripDetailsContent() {
  return (
    <AppShell>
      <div className="relative">
        <div className="h-[320px] md:h-[400px] relative overflow-hidden">
          <img src={jaipur} alt="" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/10" />
          <div className="relative max-w-7xl mx-auto px-4 lg:px-10 h-full flex flex-col justify-end pb-8 text-white">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">Heritage · Rajasthan</div>
            <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl tracking-tight">Royal Rajasthan</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> Jaipur, India</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="size-4" /> Mar 12 – 16</span>
              <span className="inline-flex items-center gap-1.5"><Wallet className="size-4" /> ₹38,400</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-10 -mt-8">
          <div className="rounded-2xl bg-card border border-border shadow-pop p-3 flex flex-wrap gap-2">
            <Link to="/results" className="h-10 px-4 rounded-xl bg-warm-gradient text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow-cta">
              <Edit3 className="size-4" /> Edit plan
            </Link>
            <button className="h-10 px-4 rounded-xl border border-border text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-secondary">
              <Share2 className="size-4" /> Share
            </button>
            <button className="h-10 px-4 rounded-xl border border-border text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-secondary">
              <Copy className="size-4" /> Duplicate
            </button>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="font-display font-bold text-lg">Overview</div>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  A 5-day heritage immersion through Jaipur's pink streets, palace courtyards and quiet rooftop dinners. Designed for slow-travel pace with a balance of culture, food and rest.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Stat icon={Calendar} l="Days" v="5" />
                  <Stat icon={Hotel} l="Stays" v="2" />
                  <Stat icon={Plane} l="Transfers" v="4" />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="font-display font-bold text-lg">Day by day</div>
                <div className="mt-4 space-y-3">
                  {[
                    { d: 1, t: "Arrival & Old City", icon: Camera },
                    { d: 2, t: "Forts & Palaces", icon: Hotel },
                    { d: 3, t: "Markets & Crafts", icon: Utensils },
                    { d: 4, t: "Day trip to Pushkar", icon: Plane },
                    { d: 5, t: "Departure", icon: Plane },
                  ].map((d) => (
                    <div key={d.d} className="flex items-center gap-4 rounded-2xl bg-secondary p-4 hover:bg-primary-soft transition">
                      <div className="size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-bold text-sm">D{d.d}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{d.t}</div>
                        <div className="text-xs text-muted-foreground">3 stops · ~7 hrs</div>
                      </div>
                      <d.icon className="size-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
                <div className="aspect-square bg-secondary relative">
                  <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
                    <rect width="300" height="300" fill="oklch(0.96 0.01 250)" />
                    <path d="M30 250 Q 80 180 150 160 T 270 60" stroke="oklch(0.7 0.2 42)" strokeWidth="3" fill="none" strokeDasharray="6 6" />
                    {[[30,250],[150,160],[270,60]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="10" fill="white" stroke="oklch(0.32 0.16 268)" strokeWidth="3" />
                    ))}
                  </svg>
                </div>
                <div className="p-4 text-sm text-muted-foreground">Interactive map · 12 stops</div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="font-display font-bold">Stay suggestions</div>
                <div className="mt-3 space-y-3">
                  {["Samode Haveli", "The Oberoi Rajvilas", "Bissau Palace"].map((h, i) => (
                    <div key={h} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                      <div className="size-10 rounded-lg bg-warm-gradient" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{h}</div>
                        <div className="text-xs text-muted-foreground">Heritage · ₹{6+i},200/night</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, l, v }: { icon: React.ComponentType<{ className?: string }>; l: string; v: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <Icon className="size-4 text-primary" />
      <div className="mt-2 font-display font-bold text-xl">{v}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
