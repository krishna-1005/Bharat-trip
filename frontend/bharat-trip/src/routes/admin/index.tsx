import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Users, 
  Map, 
  Sparkles, 
  MessageSquare, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  UserCheck,
  MousePointer2,
  Loader2,
  RefreshCw,
  Globe,
  Mail,
  Send,
  Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcastDigest = async () => {
    if (!confirm("Are you sure you want to broadcast the Weekly Travel Digest to ALL eligible users?")) return;
    
    setBroadcasting(true);
    try {
      const res = await api.post("/admin/broadcast-digest");
      toast.success(`Broadcast successful! Sent to ${res.data.count} users.`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Broadcast failed");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await api.post("/admin/test-email");
      toast.success(res.data.message);
    } catch (err: any) {
      const errorData = err.response?.data;
      toast.error(
        <div className="space-y-1">
          <p className="font-bold">{errorData?.error || "Test failed"}</p>
          <p className="text-[10px] opacity-80">{errorData?.details || "Unknown error"}</p>
          <p className="text-[10px] font-bold text-accent">{errorData?.hint}</p>
        </div>,
        { duration: 10000 }
      );
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  const s = stats?.summary || {};
  const chartData = stats?.growthChart || [];

  const chartConfig = {
    plans: {
      label: "Plans Generated",
      color: "hsl(var(--primary))",
    },
    users: {
      label: "New Users",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">System Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time performance and user engagement metrics.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-border text-foreground font-bold text-sm transition-all disabled:opacity-70"
            >
              {testingEmail ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {testingEmail ? "Testing..." : "Test Email Config"}
            </button>
            <button 
              onClick={handleBroadcastDigest}
              disabled={broadcasting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70"
            >
              {broadcasting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {broadcasting ? "Broadcasting..." : "Broadcast Weekly Digest"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Visitors" 
            value={s.totalUniqueVisitors} 
            icon={Globe} 
            trend="+15%" 
            color="bg-blue-600" 
          />
          <StatCard 
            label="Today's Traffic" 
            value={s.todayUniqueVisitors} 
            icon={Activity} 
            trend="Real-time" 
            color="bg-orange-500" 
          />
          <StatCard 
            label="Plans Generated" 
            value={s.totalPlansGenerated} 
            icon={Sparkles} 
            trend="+24%" 
            color="bg-purple-500" 
          />
          <StatCard 
            label="User Conversion" 
            value={s.totalConversions} 
            icon={TrendingUp} 
            trend="+8%" 
            color="bg-indigo-500" 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Activity Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="font-display font-bold text-lg">Growth & Engagement</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Last 7 Days <ArrowUpRight className="size-3" />
                  </div>
               </div>
               <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-plans)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-plans)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(str) => {
                          const d = new Date(str);
                          return d.toLocaleDateString("en-IN", { weekday: 'short' });
                        }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="plans" 
                        stroke="var(--color-plans)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPlans)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="var(--color-users)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                      />
                    </AreaChart>
                  </ChartContainer>
               </div>
            </div>

            {/* Product Insights Panel */}
            <div className="space-y-6">

              {/* Top Trending Destinations */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="font-display font-bold text-lg">Trending Destinations</div>
                  <Map className="size-4 text-primary" />
                </div>
                <div className="p-6 space-y-3">
                  {(() => {
                    const destinations = stats?.productInsights?.topDestinations || [];
                    const maxCount = destinations.length > 0 ? destinations[0].count : 1;
                    if (destinations.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-6">No destination data yet</p>;
                    }
                    return destinations.map((d: any, i: number) => {
                      const pct = Math.round((d.count / maxCount) * 100);
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div key={d._id} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm w-6 text-center font-bold">
                                {i < 3 ? medals[i] : <span className="text-muted-foreground text-xs">#{i + 1}</span>}
                              </span>
                              <span className="text-sm font-semibold group-hover:text-primary transition-colors">{d._id}</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground tabular-nums">{d.count} plans</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden ml-8">
                            <div
                              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Feature Engagement Breakdown */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg">Feature Engagement Breakdown</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Which features and actions are most utilized by users</p>
                  </div>
                  <Activity className="size-5 text-indigo-500" />
                </div>
                <div className="p-6 space-y-4">
                  {(() => {
                    const actions = stats?.productInsights?.topActions || [];
                    const totalCount = actions.reduce((sum: number, a: any) => sum + a.count, 0) || 1;
                    if (actions.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-6">No action log data yet</p>;
                    }

                    const actionMap: Record<string, { label: string; icon: any; color: string; desc: string }> = {
                      generate_plan: { label: "AI Plan Generator", icon: Sparkles, color: "from-purple-500 to-indigo-500", desc: "Users generating personalized itineraries" },
                      chatbot_plan_generated: { label: "Chatbot Plan Creation", icon: Sparkles, color: "from-blue-500 to-indigo-500", desc: "Itineraries generated via conversational chat" },
                      chatbot_query: { label: "Chatbot Interactions", icon: MessageSquare, color: "from-teal-500 to-cyan-500", desc: "User chats with the travel assistant" },
                      login: { label: "User Authentications", icon: UserCheck, color: "from-emerald-500 to-green-500", desc: "Successful user sign-ins" },
                      site_access: { label: "Platform Visits", icon: MousePointer2, color: "from-amber-500 to-orange-500", desc: "General visits and page navigations" },
                    };

                    return actions.map((act: any) => {
                      const mapping = actionMap[act._id] || {
                        label: act._id.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        icon: Activity,
                        color: "from-slate-500 to-slate-600",
                        desc: "Other logged system action"
                      };
                      const Icon = mapping.icon;
                      const pct = Math.round((act.count / totalCount) * 100);

                      return (
                        <div key={act._id} className="group flex flex-col space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-secondary/80">
                                <Icon className="size-3.5 text-foreground/80" />
                              </div>
                              <div className="text-left">
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {mapping.label}
                                </span>
                                <p className="text-[10px] text-muted-foreground/80 leading-none mt-0.5">{mapping.desc}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold tabular-nums text-foreground">{act.count.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-1.5 font-medium">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${mapping.color} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Peak Hours + Recent Reviews side by side row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Peak Usage Hours */}
                <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-border">
                    <div className="font-display font-bold text-sm">Peak Usage Hours</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">When your users are most active</p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-6 gap-1">
                      {(() => {
                        const hours = stats?.productInsights?.peakHours || [];
                        const maxH = Math.max(...hours.map((h: any) => h.count), 1);
                        // Fill 24 hours
                        return Array.from({ length: 24 }, (_, i) => {
                          const entry = hours.find((h: any) => h._id === i);
                          const count = entry?.count || 0;
                          const intensity = count / maxH;
                          const bg = intensity > 0.75 ? "bg-emerald-500" 
                                   : intensity > 0.5 ? "bg-emerald-400" 
                                   : intensity > 0.25 ? "bg-emerald-300 dark:bg-emerald-700" 
                                   : intensity > 0 ? "bg-emerald-200 dark:bg-emerald-800" 
                                   : "bg-secondary";
                          return (
                            <div key={i} className="flex flex-col items-center gap-1" title={`${i}:00 — ${count} events`}>
                              <div className={`w-full aspect-square rounded-lg ${bg} transition-colors hover:ring-2 hover:ring-primary/30 cursor-default`} />
                              {(i % 6 === 0) && <span className="text-[8px] text-muted-foreground font-bold">{i}h</span>}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 justify-center">
                      <span className="text-[9px] text-muted-foreground font-bold">Low</span>
                      {["bg-secondary", "bg-emerald-200 dark:bg-emerald-800", "bg-emerald-300 dark:bg-emerald-700", "bg-emerald-400", "bg-emerald-500"].map((c, i) => (
                        <div key={i} className={`size-3 rounded ${c}`} />
                      ))}
                      <span className="text-[9px] text-muted-foreground font-bold">High</span>
                    </div>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-border">
                    <div className="font-display font-bold text-sm">Recent Reviews</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">User sentiment & feedback</p>
                  </div>
                  <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin">
                    {stats?.recentReviews?.length > 0 ? stats.recentReviews.map((r: any, i: number) => (
                      <div key={i} className="p-3 rounded-2xl bg-secondary/30 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate max-w-[120px]">{r.userName || "Anonymous"}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, j) => (
                              <Star
                                key={j}
                                className={`size-3 ${j < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{r.comment}</p>
                        <span className="text-[9px] text-muted-foreground/60 font-medium">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-6">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Popular Interests Tags */}
              {stats?.productInsights?.topInterests?.length > 0 && (
                <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm">Popular Interests</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">What travelers care about most</p>
                    </div>
                    <Sparkles className="size-4 text-accent" />
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {stats.productInsights.topInterests.map((interest: any, i: number) => {
                      const colors = [
                        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
                        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
                        "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60",
                        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
                      ];
                      return (
                        <span
                          key={interest._id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${colors[i % colors.length]}`}
                        >
                          {interest._id}
                          <span className="text-[9px] opacity-70 font-mono">{interest.count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
             <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4">Retention Breakdown</h3>
                <div className="space-y-4">
                   <TrafficItem label="Returning Users" value={s.returningUsersCount} icon={UserCheck} color="text-emerald-500" />
                   <TrafficItem label="Returning Guests" value={s.returningGuestsCount} icon={RefreshCw} color="text-amber-500" />
                   <TrafficItem label="Guest Sessions" value={s.guestCount} icon={MousePointer2} color="text-orange-500" />
                   <TrafficItem label="Registered Users" value={s.totalRegisteredUsers} icon={Users} color="text-blue-500" />
                   <TrafficItem label="Monthly Active" value={s.mauCount} icon={Activity} color="text-purple-500" />
                </div>
             </div>

             <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4">Newest Users</h3>
                <div className="space-y-4">
                   {stats?.recentRegisteredUsers?.map((user: any) => (
                     <div key={user._id} className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-secondary grid place-items-center font-bold text-sm">
                           {user.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-bold truncate text-sm">{user.name}</div>
                           <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(user.createdAt).toLocaleDateString()}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className={`size-12 rounded-2xl ${color} text-white grid place-items-center shadow-lg`}>
          <Icon className="size-6" />
        </div>
        <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
          {trend}
        </div>
      </div>
      <div className="mt-5">
        <div className="text-2xl font-display font-bold tracking-tight">{value?.toLocaleString() || 0}</div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
}

function TrafficItem({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
       <div className="flex items-center gap-3">
          <Icon className={`size-4 ${color}`} />
          <span className="text-sm font-medium">{label}</span>
       </div>
       <span className="font-bold">{value || 0}</span>
    </div>
  );
}
