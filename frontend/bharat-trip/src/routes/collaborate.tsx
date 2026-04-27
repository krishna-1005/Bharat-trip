import { useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Polls } from "@/components/Polls";
import { Send, Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { auth } from "@/firebase";
import { toast } from "sonner";

const COLORS = [
  "bg-warm-gradient",
  "bg-primary",
  "bg-success",
  "bg-accent",
  "bg-foreground",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500"
];

interface Message {
  userName: string;
  text: string;
  createdAt: string;
  userId: string;
}

export default function Collaborate() {
  return (
    <ProtectedRoute>
      <Collab />
    </ProtectedRoute>
  );
}

function Collab() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId") || "default-trip";
  const [trip, setTrip] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  const joinTrip = async () => {
    if (!user || !tripId || tripId === "default-trip") return;
    try {
      await api.post(`/trips/${tripId}/join`, {
        userId: user.uid,
        userName: user.displayName || "Traveller"
      });
      fetchTrip(); // Refresh trip to see new members
    } catch (err) {
      console.error("Failed to join trip", err);
    }
  };

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data);
    } catch (err) {
      console.error("Failed to fetch trip", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/group-chat/${tripId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    fetchTrip();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [tripId]);

  useEffect(() => {
    if (user && tripId) {
      joinTrip();
    }
  }, [user, tripId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const res = await api.post("/group-chat/send", {
        tripId,
        userId: user.uid,
        userName: user.displayName || "Traveller",
        text: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              {trip?.title || "March Group Trip"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {trip?.destination ? `Exploring ${trip.destination}` : "5 travellers deciding together"} · live
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {trip?.members?.map((member: any, i: number) => (
                <div 
                  key={member.userId} 
                  className={`size-10 rounded-full ${COLORS[i % COLORS.length]} text-white grid place-items-center font-bold text-sm border-2 border-background`} 
                  title={member.userName}
                >
                  {member.userName[0]}
                </div>
              ))}
              <button 
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast.success("Collaboration link copied! Share it with your crew.");
                }}
                className="size-10 rounded-full bg-warm-gradient text-white grid place-items-center border-2 border-background hover:scale-110 shadow-sm transition-all group relative ml-2"
                title="Invite Crew"
              >
                <Plus className="size-5 transition-transform" />
                <span className="absolute -bottom-10 right-0 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold">
                  Invite Crew
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Polls Section */}
          <div className="space-y-8">
            <Polls tripId={tripId} />
          </div>

          {/* Chat */}
          <div className="rounded-3xl bg-card border border-border shadow-soft flex flex-col h-[600px] sticky top-6">
            <div className="p-5 border-b border-border bg-secondary/20">
              <div className="font-display font-bold text-lg">Crew chat</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="size-2 rounded-full bg-success animate-pulse"></span>
                {messages.length > 0 ? `${new Set(messages.map(m => m.userId)).size} active members` : "5 online now"}
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="text-center py-10 opacity-50 space-y-2">
                  <p className="text-sm">No messages yet.</p>
                  <p className="text-xs italic">"Let's poll it. GoTripo will pull together both itineraries either way."</p>
                </div>
              )}
              {messages.map((m, i) => {
                const isMe = m.userId === user?.uid;
                return (
                  <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`size-8 rounded-full ${isMe ? 'bg-warm-gradient' : 'bg-primary-soft text-primary'} grid place-items-center text-xs font-bold shrink-0`}>
                      {m.userName[0]}
                    </div>
                    <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
                      <div className="text-xs text-muted-foreground">
                        <b className="text-foreground">{isMe ? 'You' : m.userName}</b> · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`mt-1 rounded-2xl px-4 py-2.5 text-sm w-fit shadow-sm inline-block ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-sm' 
                          : 'bg-secondary text-foreground rounded-tl-sm'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border flex items-center gap-2">
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Message the crew…" 
                className="flex-1 h-12 px-4 rounded-xl bg-secondary border border-transparent focus:bg-surface focus:border-ring outline-none text-sm transition-all" 
              />
              <button 
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="size-12 rounded-xl bg-warm-gradient text-white grid place-items-center shadow-cta hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
