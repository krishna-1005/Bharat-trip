import { useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Polls } from "@/components/Polls";
import { Send, Plus } from "lucide-react";

const people = [
  { name: "Aarav", color: "bg-warm-gradient" },
  { name: "Maya", color: "bg-primary" },
  { name: "Kabir", color: "bg-success" },
  { name: "Priya", color: "bg-accent" },
  { name: "Vivek", color: "bg-foreground" },
];

const messages = [
  { who: "Maya", text: "I'm voting Goa, the weather's perfect in March 🌴", time: "10:42" },
  { who: "Kabir", text: "Rishikesh has the rafting season open then though.", time: "10:43" },
  { who: "Aarav", text: "Let's poll it. GoTripo will pull together both itineraries either way.", time: "10:45" },
];

export default function Collaborate() {
  return (
    <ProtectedRoute>
      <Collab />
    </ProtectedRoute>
  );
}

function Collab() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">March Group Trip</h1>
            <p className="text-muted-foreground mt-1">5 travellers deciding together · live</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {people.map((p) => (
                <div key={p.name} className={`size-10 rounded-full ${p.color} text-white grid place-items-center font-bold text-sm border-2 border-background`} title={p.name}>
                  {p.name[0]}
                </div>
              ))}
              <button className="size-10 rounded-full bg-secondary text-muted-foreground grid place-items-center border-2 border-background hover:text-primary">
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Polls Section */}
          <div className="space-y-8">
            <Polls tripId={tripId || ""} />
          </div>

          {/* Chat */}
          <div className="rounded-3xl bg-card border border-border shadow-soft flex flex-col h-[600px] sticky top-6">
            <div className="p-5 border-b border-border bg-secondary/20">
              <div className="font-display font-bold text-lg">Crew chat</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="size-2 rounded-full bg-success animate-pulse"></span>
                5 online now
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-bold shrink-0">{m.who[0]}</div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground"><b className="text-foreground">{m.who}</b> · {m.time}</div>
                    <div className="mt-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm w-fit shadow-sm">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex items-center gap-2">
              <input placeholder="Message the crew…" className="flex-1 h-12 px-4 rounded-xl bg-secondary border border-transparent focus:bg-surface focus:border-ring outline-none text-sm transition-all" />
              <button className="size-12 rounded-xl bg-warm-gradient text-white grid place-items-center shadow-cta hover:opacity-90 transition-opacity">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
