import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useState } from "react";
import api from "@/lib/api";
import { 
  Bell, 
  Send, 
  Mail, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Megaphone,
  Loader2,
  Globe,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  return (
    <AdminProtectedRoute>
      <AdminNotifications />
    </AdminProtectedRoute>
  );
}

function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    link: "",
    sendEmail: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    try {
      await api.post("/notifications/broadcast", formData);
      toast.success("Broadcast sent successfully!");
      setFormData({
        title: "",
        message: "",
        type: "info",
        link: "",
        sendEmail: false
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Announcements</h1>
          <p className="text-muted-foreground mt-1">Send global notifications and emails to all users.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Announcement Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. New Feature: Multi-City Planner is here!"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Message Content</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] resize-none"
                  placeholder="Describe the update in detail..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Notification Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["info", "success", "warning", "promo"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t})}
                        className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                          formData.type === t 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Action Link (Optional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="https://gotripo.com/explore"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-bold">Send Email Alert</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">To all subscribed users</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, sendEmail: !formData.sendEmail})}
                  className={`w-11 h-6 rounded-full transition-colors relative ${formData.sendEmail ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-1 size-4 rounded-full bg-white transition-all shadow-sm ${formData.sendEmail ? "left-6" : "left-1"}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                Dispatch Announcement
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Info className="size-5 text-primary" /> Preview
              </h3>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <NotificationIcon type={formData.type} />
                  <span className="font-bold text-sm">{formData.title || "Announcement Title"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formData.message || "Your message will appear here..."}
                </p>
                {formData.link && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      Learn more <ExternalLink className="size-2.5" />
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-primary/10 border border-primary/20 p-6 text-sm">
               <div className="flex gap-3">
                  <Megaphone className="size-5 text-primary shrink-0" />
                  <div>
                    <div className="font-bold text-primary">Dispatch Logic</div>
                    <p className="text-primary/70 mt-1 text-xs">
                      Announcements are stored as global notifications and will be shown to all users immediately upon their next login or refresh.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "success": return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "warning": return <AlertTriangle className="size-4 text-orange-500" />;
    case "promo": return <Megaphone className="size-4 text-purple-500" />;
    default: return <Bell className="size-4 text-blue-500" />;
  }
}
