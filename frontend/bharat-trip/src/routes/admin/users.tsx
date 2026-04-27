import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  User as UserIcon,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <AdminUsers />
    </AdminProtectedRoute>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Users fetch error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  if (loading && users.length === 0) {
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
            <h1 className="text-3xl font-display font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage all registered users and their permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users..." 
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
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-secondary/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                          {user.name?.[0] || <UserIcon className="size-5" />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            {user.name}
                            {user.role === "admin" && <Shield className="size-3 text-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="size-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                        user.role === "admin" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleRole(user._id, user.role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            user.role === "admin"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                      No users found matching your search.
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
