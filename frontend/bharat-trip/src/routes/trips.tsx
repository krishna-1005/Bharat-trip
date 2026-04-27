import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Bookmark, Plus, MapPin, Calendar, Loader2 } from "lucide-react";
import api from "@/lib/api";

const tabs = ["Upcoming", "Drafts", "Saved", "Past"];

export default function Trips() {
  return (
    <ProtectedRoute>
      <TripsContent />
    </ProtectedRoute>
  );
}

function TripsContent() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/trips")
      .then(res => {
        setTrips(res.data.trips || res.data || []);
      })
      .catch(err => {
        console.error("Failed to fetch trips", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">My trips</h1>
            <p className="text-muted-foreground mt-1">Your planned escapes and saved favourites.</p>
          </div>
          <Link to="/trip-type" className="h-11 px-5 rounded-xl bg-warm-gradient text-white text-sm font-semibold shadow-cta inline-flex items-center gap-2">
            <Plus className="size-4" /> New trip
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-border">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={`px-4 h-11 text-sm font-semibold border-b-2 -mb-px transition ${
                i === 0 ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-20 text-center">
            <Loader2 className="size-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your trips...</p>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-2 gap-5">
            {trips.length > 0 ? trips.map((d) => (
              <Link to={`/results?planId=${d._id}`} key={d._id} className="group rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row">
                <div className="sm:w-56 aspect-[4/3] sm:aspect-auto relative overflow-hidden shrink-0 bg-secondary grid place-items-center">
                   <MapPin className="size-8 text-muted-foreground/30" />
                </div>
                <div className="p-5 flex-1">
                  <div className="text-[11px] font-semibold text-accent uppercase tracking-widest">{d.style || "Trip"}</div>
                  <div className="font-display font-bold text-xl mt-1">{d.city || d.destination}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="size-3" /> {d.city}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {d.days} days</span>
                    <span>·</span>
                    <span>₹{d.budget?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-warm-gradient" style={{ width: "100%" }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">Trip generated</div>
                </div>
              </Link>
            )) : (
              <Link to="/trip-type" className="rounded-3xl border-2 border-dashed border-border p-10 grid place-items-center text-muted-foreground hover:text-primary hover:border-primary transition w-full lg:col-span-2">
                <div className="text-center">
                  <Bookmark className="size-6 mx-auto" />
                  <div className="mt-2 font-semibold">No trips yet</div>
                  <div className="text-xs mt-1">Tap to start planning your first adventure</div>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
