import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Settings, Mail, MapPin, Wallet, Heart, Edit3, ChevronRight, Loader2, LogOut, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GoTripo" },
      { name: "description", content: "Your travel preferences, saved trips and settings." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  ),
});

const displayNameSchema = z.string().trim().min(1, "Name is required").max(80);
const bioSchema = z.string().trim().max(500, "Bio must be under 500 characters");

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    api.get("/profile")
      .then(res => {
        const u = res.data.user;
        setProfileData(u);
        setDisplayName(u.name || "");
        setBio(u.bio || "");
      })
      .catch(err => {
        toast.error("Could not load profile");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  const handleSave = async () => {
    const nameResult = displayNameSchema.safeParse(displayName);
    if (!nameResult.success) {
      toast.error(nameResult.error.issues[0].message);
      return;
    }
    const bioResult = bioSchema.safeParse(bio);
    if (!bioResult.success) {
      toast.error(bioResult.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/profile", { name: displayName, bio });
      setProfileData(res.data.user);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] grid place-items-center">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-hero-gradient text-white p-8 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="size-20 rounded-2xl bg-warm-gradient grid place-items-center text-3xl font-display font-bold shadow-cta">
              {initial}
            </div>
            <div className="flex-1 min-w-[220px]">
              {editing ? (
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  placeholder="Your name"
                  className="font-display font-bold text-3xl tracking-tight bg-white/15 rounded-xl px-3 py-1.5 outline-none border border-white/20 focus:border-white w-full max-w-md"
                />
              ) : (
                <h1 className="font-display font-bold text-3xl tracking-tight">
                  {profileData?.name || user?.email?.split("@")[0] || "Traveller"}
                </h1>
              )}
              <div className="text-white/70 text-sm mt-2 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> {user?.email}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> India</span>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-4 rounded-xl bg-white text-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(profileData?.name ?? "");
                    setBio(profileData?.bio ?? "");
                  }}
                  className="h-10 px-4 rounded-xl glass text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  <X className="size-4" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="h-10 px-4 rounded-xl glass text-sm font-semibold inline-flex items-center gap-1.5"
              >
                <Edit3 className="size-4" /> Edit
              </button>
            )}
          </div>
        </div>

        {(editing || profileData?.bio) && (
          <div className="mt-6 rounded-3xl bg-card border border-border p-6 shadow-soft">
            <div className="flex items-center gap-2 font-display font-bold text-lg">About</div>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="Tell other travellers about yourself..."
                rows={3}
                className="mt-3 w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-ring resize-none"
              />
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{profileData?.bio}</p>
            )}
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Stat label="Trips planned" v={profileData?.stats?.tripsPlanned?.toString() || "0"} />
          <Stat label="Upcoming" v={profileData?.stats?.upcoming?.toString() || "0"} />
          <Stat label="Completed" v={profileData?.stats?.completed?.toString() || "0"} />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-card border border-border p-6 shadow-soft">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Heart className="size-4 text-accent" /> Travel preferences
            </div>
            <div className="mt-5 space-y-4">
              <Pref label="Default budget" v={`₹${profileData?.preferences?.preferredBudget?.toLocaleString("en-IN") || "0"}`} />
              <Pref label="Interests" v={profileData?.preferences?.interests?.join(", ") || "None set"} />
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6 shadow-soft">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Wallet className="size-4 text-primary" /> Saved places
            </div>
            <div className="mt-5 space-y-3">
              {(profileData?.savedPlaces || []).length > 0 ? profileData.savedPlaces.map((p: any) => (
                <div key={p.name} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.tag}</div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground italic">No places saved yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display font-bold text-2xl">{v}</div>
    </div>
  );
}

function Pref({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm text-right max-w-[60%]">{v}</div>
    </div>
  );
}
