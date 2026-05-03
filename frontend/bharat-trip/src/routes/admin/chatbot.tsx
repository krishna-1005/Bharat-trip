import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  MapPin, 
  TrendingUp,
  BrainCircuit,
  Bot,
  Zap,
  Globe
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function AdminChatbotAnalyticsPage() {
  return (
    <AdminProtectedRoute>
      <AdminChatbotAnalytics />
    </AdminProtectedRoute>
  );
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

function AdminChatbotAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/chatbot-stats")
      .then(res => setData(res.data))
      .catch(err => console.error("Chatbot stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <Skeleton className="h-9 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </AdminShell>
    );
  }

  const s = data?.summary || {};
  const modelUsage = data?.modelUsage || [];
  const popularCities = data?.popularCities || [];
  const dailyQueries = data?.dailyQueries || [];
  const peakHours = data?.peakHours || [];
  const popularInterests = data?.popularInterests || [];

  return (
    <AdminShell>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Chatbot Intelligence</h1>
          <p className="text-muted-foreground mt-1">Analyzing AI performance and user travel interests.</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard 
            label="Total Queries" 
            value={s.totalQueries} 
            icon={MessageSquare} 
            description="Total interactions with AI"
            color="bg-primary"
          />
          <AnalyticsCard 
            label="Plans Generated" 
            value={s.totalPlansGenerated} 
            icon={Sparkles} 
            description="Full itineraries created"
            color="bg-purple-600"
          />
          <AnalyticsCard 
            label="Conversion Rate" 
            value={`${s.conversionRate}%`} 
            icon={TrendingUp} 
            description="Queries leading to plans"
            color="bg-emerald-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Model Usage Distribution */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center">
                <BrainCircuit className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">AI Provider Split</h3>
                <p className="text-xs text-muted-foreground">Gemini vs Fallback usage</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {modelUsage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-orange-500/10 text-orange-500 grid place-items-center">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Hottest Cities</h3>
                <p className="text-xs text-muted-foreground">Most requested via Chatbot</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularCities} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="_id" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours (NEW) */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-500 grid place-items-center">
                <Globe className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Peak Interaction Times</h3>
                <p className="text-xs text-muted-foreground">Activity by hour of day (UTC)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--indigo-500))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Interests (NEW) */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 grid place-items-center">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">User Travel Vibe</h3>
                <p className="text-xs text-muted-foreground">Most common interest tags</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularInterests}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {popularInterests.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Query Volume */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Zap className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Query Volume (Last 30 Days)</h3>
                <p className="text-xs text-muted-foreground">Chatbot activity over time</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyQueries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return d.getDate().toString();
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function AnalyticsCard({ label, value, icon: Icon, description, color }: any) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform`}>
        <Icon className="size-16" />
      </div>
      <div className="relative z-10">
        <div className={`size-10 rounded-xl ${color} text-white grid place-items-center mb-4`}>
          <Icon className="size-5" />
        </div>
        <div className="text-3xl font-display font-bold tracking-tight">{value}</div>
        <div className="text-sm font-bold mt-1">{label}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
