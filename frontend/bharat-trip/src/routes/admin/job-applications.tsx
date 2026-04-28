import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Briefcase, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminJobApplicationsPage() {
  return (
    <AdminProtectedRoute>
      <AdminJobApplications />
    </AdminProtectedRoute>
  );
}

function AdminJobApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/applications");
      setApplications(res.data);
    } catch (err) {
      console.error("Applications fetch error:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => 
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/applications/${id}/status`, { status });
      toast.success(`Application status updated to ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await api.delete(`/admin/applications/${id}`);
      toast.success("Application deleted");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted": return "bg-green-500/10 text-green-600";
      case "rejected": return "bg-red-500/10 text-red-600";
      case "reviewed": return "bg-blue-500/10 text-blue-600";
      default: return "bg-yellow-500/10 text-yellow-600";
    }
  };

  if (loading && applications.length === 0) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="rounded-3xl border border-border overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Job Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage incoming job applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search applications..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-[300px]"
              />
            </div>
            <button className="size-10 grid place-items-center rounded-xl bg-secondary hover:bg-secondary/80 transition border border-border">
              <Filter className="size-4" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-secondary/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                          {app.name?.[0] || <Briefcase className="size-5" />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            {app.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="size-3" />
                            {app.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{app.jobTitle}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{app.jobId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={app.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-secondary text-primary transition-colors"
                          title="View Resume"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                            <MoreVertical className="size-4" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-card border border-border rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden">
                            <button 
                              onClick={() => updateStatus(app._id, "reviewed")}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-secondary flex items-center gap-2"
                            >
                              <Clock className="size-3" /> Mark Reviewed
                            </button>
                            <button 
                              onClick={() => updateStatus(app._id, "shortlisted")}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-secondary flex items-center gap-2 text-green-600"
                            >
                              <CheckCircle2 className="size-3" /> Shortlist
                            </button>
                            <button 
                              onClick={() => updateStatus(app._id, "rejected")}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-secondary flex items-center gap-2 text-red-600"
                            >
                              <XCircle className="size-3" /> Reject
                            </button>
                            <div className="border-t border-border mt-1" />
                            <button 
                              onClick={() => deleteApplication(app._id)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-secondary flex items-center gap-2 text-destructive"
                            >
                              <Trash2 className="size-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note section for selected application could be added here if needed */}
        {filteredApplications.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
             {filteredApplications.filter(a => a.note).slice(0, 4).map(app => (
               <div key={app._id} className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="font-bold text-sm">{app.name}</div>
                    <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{app.jobTitle}</div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{app.note}"
                  </p>
               </div>
             ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
