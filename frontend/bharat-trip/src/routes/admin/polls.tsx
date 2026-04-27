import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  BarChart3, 
  Search, 
  Trash2, 
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trophy
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminPollsPage() {
  return (
    <AdminProtectedRoute>
      <AdminPolls />
    </AdminProtectedRoute>
  );
}

function AdminPolls() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await api.get("/polls/list");
      setPolls(res.data);
    } catch (err) {
      console.error("Polls fetch error:", err);
      toast.error("Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const filteredPolls = polls.filter(p => 
    p.tripName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.pollId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deletePoll = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;
    try {
      await api.delete(`/admin/polls/${pollId}`);
      toast.success("Poll deleted successfully");
      fetchPolls();
    } catch (err) {
      toast.error("Failed to delete poll");
    }
  };

  if (loading && polls.length === 0) {
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
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 w-48">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-8 rounded-lg" />
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
            <h1 className="text-3xl font-display font-bold tracking-tight">Poll Management</h1>
            <p className="text-muted-foreground mt-1">Track active collaborations and group decision making.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search polls..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-[300px]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Poll Details</th>
                  <th className="px-6 py-4">Options & Votes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPolls.length > 0 ? filteredPolls.map((poll) => {
                  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                  return (
                    <tr key={poll._id} className="hover:bg-secondary/20 transition">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {poll.tripName}
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-mono text-muted-foreground uppercase">{poll.pollId}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Users className="size-3" />
                            {poll.voters?.length || 0} / {poll.totalMembers || "?"} Voted
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2 max-w-[200px]">
                          {poll.options.slice(0, 2).map((opt: any, i: number) => {
                            const percent = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                            return (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="truncate">{opt.name}</span>
                                  <span>{opt.votes}</span>
                                </div>
                                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                          {poll.options.length > 2 && (
                            <div className="text-[10px] text-muted-foreground font-medium">+{poll.options.length - 2} more options</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {poll.isClosed ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase w-fit">
                              <CheckCircle2 className="size-3" />
                              Closed
                            </span>
                            {poll.winner && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                <Trophy className="size-3" />
                                {poll.winner}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase w-fit">
                            <Clock className="size-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(poll.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                            onClick={() => deletePoll(poll.pollId)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                            <MoreVertical className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No polls found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
