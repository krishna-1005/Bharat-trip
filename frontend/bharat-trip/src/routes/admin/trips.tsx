import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Map, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  User as UserIcon,
  Loader2,
  Trash2,
  ExternalLink,
  MapPin,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function AdminTripsPage() {
  return (
    <AdminProtectedRoute>
      <AdminTrips />
    </AdminProtectedRoute>
  );
}

function AdminTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/trips");
      setTrips(res.data);
    } catch (err) {
      console.error("Trips fetch error:", err);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await api.delete(`/admin/trips/${tripId}`);
      toast.success("Trip deleted successfully");
      fetchTrips();
    } catch (err) {
      toast.error("Failed to delete trip");
    }
  };

  if (loading && trips.length === 0) {
    return (
      <AdminShell>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Trip Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all user-generated itineraries.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search trips..." 
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
                  <th className="px-6 py-4">Trip Info</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-secondary/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                          {trip.image ? (
                            <img src={trip.image} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full grid place-items-center text-muted-foreground">
                              <Map className="size-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{trip.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3" />
                            {trip.destination} • {trip.days} Days
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-secondary grid place-items-center text-[10px] font-bold">
                          {trip.userId?.name?.[0] || "G"}
                        </div>
                        <div className="text-xs">
                          <div className="font-medium">{trip.userId?.name || "Guest"}</div>
                          <div className="text-muted-foreground truncate max-w-[120px]">{trip.userId?.email || "Anonymous"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        trip.isPublic 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-orange-500/10 text-orange-500"
                      }`}>
                        {trip.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`/trip-details/${trip._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <button 
                          onClick={() => deleteTrip(trip._id)}
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
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No trips found.
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
