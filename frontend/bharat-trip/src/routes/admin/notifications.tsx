import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
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
  ExternalLink,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus
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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    link: "",
    targetPage: "all",
    isActive: true
  });
  const [showForm, setShowForm] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/admin/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Fetch announcements error:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    try {
      await api.post("/admin/announcements", formData);
      toast.success("Announcement created successfully!");
      setFormData({
        title: "",
        content: "",
        type: "info",
        link: "",
        targetPage: "all",
        isActive: true
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/announcements/${id}`, { isActive: !currentStatus });
      toast.success("Status updated");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success("Deleted successfully");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Announcements & Banners</h1>
            <p className="text-muted-foreground mt-1">Manage global site banners and promotional content.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          >
            {showForm ? "Cancel" : <><Plus className="size-4" /> Create New</>}
          </button>
        </div>

        {showForm && (
          <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Banner Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Monsoon Sale: Get 20% off on all plans!"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Banner Content</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                    placeholder="Short and catchy description..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Orange)</option>
                      <option value="promotion">Promotion (Purple)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Target Page</label>
                    <select 
                      value={formData.targetPage}
                      onChange={(e) => setFormData({...formData, targetPage: e.target.value})}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="all">All Pages</option>
                      <option value="home">Homepage</option>
                      <option value="explore">Explore</option>
                      <option value="planner">Planner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Link (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="/explore"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  Publish Announcement
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="size-5 text-primary" /> Live Preview
                </h3>
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  formData.type === 'promotion' ? "bg-purple-500/10 border-purple-500/20" :
                  formData.type === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                  formData.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20" :
                  "bg-blue-500/10 border-blue-500/20"
                }`}>
                  <div className="flex items-center gap-2">
                    <NotificationIcon type={formData.type} />
                    <span className="font-bold text-sm">{formData.title || "Announcement Title"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.content || "Your message will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Announcement</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {announcements.map((ann) => (
                <tr key={ann._id} className="hover:bg-secondary/20 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl grid place-items-center ${
                        ann.type === 'promotion' ? "bg-purple-500/10 text-purple-500" :
                        ann.type === 'warning' ? "bg-orange-500/10 text-orange-500" :
                        ann.type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        <NotificationIcon type={ann.type} />
                      </div>
                      <div>
                        <div className="font-bold">{ann.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[300px]">{ann.content}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className="text-xs font-medium">{ann.targetPage}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(ann._id, ann.isActive)}
                      className={`flex items-center gap-2 text-xs font-bold ${ann.isActive ? "text-emerald-500" : "text-muted-foreground"}`}
                    >
                      {ann.isActive ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                      {ann.isActive ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteAnnouncement(ann._id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No announcements created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "success": return <CheckCircle2 className="size-4" />;
    case "warning": return <AlertTriangle className="size-4" />;
    case "promotion": return <Megaphone className="size-4" />;
    default: return <Info className="size-4" />;
  }
}
