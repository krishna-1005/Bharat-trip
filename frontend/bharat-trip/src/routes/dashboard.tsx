import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { destinations } from "@/lib/sample-data";
import { Sparkles, Compass, Users, ArrowRight, MapPin, Calendar, TrendingUp, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GoTripo" },
      { name: "description", content: "Your trips, AI suggestions and trending destinations in one place." },
    ],
  }),
  component: () => (<ProtectedRoute><Dashboard /></ProtectedRoute>),
});

const recent = destinations.slice(0, 4);
const suggested = destinations.slice(2, 6);
const trending = destinations.slice(1, 5);

function Dashboard() {
  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto space-y-12">
        {/* Greeting */}
        <section className="rounded-3xl bg-hero-gradient text-white p-8 md:p-10 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative">
            <div className="text-sm text-white/70">Good morning, Aarav 👋</div>
            <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Where to next?</h1>
            <p className="mt-2 text-white/80 max-w-lg">Your AI co-pilot is warmed up. Pick a quick action below or describe a vibe.</p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl">
              <Link to="/trip-type" className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition group">
                <Sparkles className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Plan new trip</div>
                <div className="text-xs text-white/70">AI builds a draft in 30s</div>
              </Link>
              <Link to="/explore" className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition">
                <Compass className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Explore</div>
                <div className="text-xs text-white/70">Curated destinations</div>
              </Link>
              <Link to="/collaborate" className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition">
                <Users className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Group poll</div>
                <div className="text-xs text-white/70">Decide with friends</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recent trips */}
        <Section title="Recent trips" subtitle="Pick up where you left off" cta="My trips" to="/trips">
          <HorizontalCards items={recent} variant="recent" />
        </Section>

        {/* Suggested */}
        <Section
          title="AI picks for you"
          subtitle="Tuned to your love for slow, scenic getaways"
          icon={<Sparkles className="size-4" />}
          cta="See more"
          to="/explore"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suggested.map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
        </Section>

        {/* Trending */}
        <Section
          title="Trending this week"
          subtitle="What other explorers are booking right now"
          icon={<TrendingUp className="size-4" />}
          cta="View board"
          to="/explore"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((d, i) => (
              <div key={d.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-accent-soft text-accent grid place-items-center font-bold">#{i + 1}</div>
                  <span className="text-xs font-semibold text-success">+{18 + i * 7}%</span>
                </div>
                <div className="mt-4 font-display font-bold text-lg">{d.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {d.region}
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-warm-gradient" style={{ width: `${60 + i * 8}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title, subtitle, cta, to, icon, children,
}: { title: string; subtitle?: string; cta?: string; to?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
            {icon && <span className="text-accent">{icon}</span>}
            {title}
          </div>
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        {cta && to && (
          <Link to={to} className="text-sm font-semibold text-primary hover:gap-2 inline-flex items-center gap-1 transition-all">
            {cta} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function HorizontalCards({ items }: { items: typeof destinations; variant?: string }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
      {items.map((d) => (
        <Link
          key={d.id}
          to="/trip-details"
          className="snap-start shrink-0 w-[280px] rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all"
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <img src={d.img} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-widest bg-white/95 text-foreground px-2.5 py-1 rounded-full">{d.tag}</div>
          </div>
          <div className="p-4">
            <div className="font-display font-bold text-lg">{d.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="size-3" /> {d.days}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{d.price}</span>
              <span className="text-xs text-muted-foreground">per person</span>
            </div>
          </div>
        </Link>
      ))}
      <Link to="/trip-type" className="snap-start shrink-0 w-[200px] rounded-3xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary transition">
        <div className="text-center">
          <Plus className="size-6 mx-auto" />
          <div className="text-sm font-semibold mt-1">New trip</div>
        </div>
      </Link>
    </div>
  );
}

function DestinationCard({ d }: { d: (typeof destinations)[number] }) {
  return (
    <Link to="/trip-details" className="group rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-widest bg-white/95 text-foreground px-2.5 py-1 rounded-full">{d.tag}</div>
      </div>
      <div className="p-4">
        <div className="font-display font-bold">{d.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="size-3" /> {d.region}</div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">{d.price}</span>
          <span className="text-xs text-muted-foreground">{d.days}</span>
        </div>
      </div>
    </Link>
  );
}
