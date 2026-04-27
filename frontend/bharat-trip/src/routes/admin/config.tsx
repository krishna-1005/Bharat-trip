import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Settings, 
  Save, 
  Loader2,
  AlertCircle,
  Database,
  Image as ImageIcon,
  Plus,
  X,
  Radio,
  ToggleLeft
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminConfigPage() {
  return (
    <AdminProtectedRoute>
      <AdminConfig />
    </AdminProtectedRoute>
  );
}

function AdminConfig() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/config");
      setConfigs(res.data);
    } catch (err) {
      console.error("Config fetch error:", err);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const updateConfig = async (key: string, value: any) => {
    try {
      setSaving(key);
      await api.post("/admin/config", { key, value });
      toast.success(`${key} updated successfully`);
      fetchConfigs();
    } catch (err) {
      toast.error(`Failed to update ${key}`);
    } finally {
      setSaving(null);
    }
  };

  const getConfigValue = (key: string) => {
    return configs.find(c => c.key === key)?.value;
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div className="flex gap-4">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
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
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1">Global settings and dynamic content control.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Homepage Images */}
          <ConfigSection 
            title="Homepage Carousel" 
            description="Manage the background images for the landing page hero section."
            icon={ImageIcon}
          >
            <ImageConfig 
              images={getConfigValue("homepage_images") || []} 
              onSave={(val) => updateConfig("homepage_images", val)}
              isSaving={saving === "homepage_images"}
            />
          </ConfigSection>

          {/* Maintenance Mode */}
          <ConfigSection 
            title="System Status" 
            description="Control site access and global maintenance alerts."
            icon={Radio}
          >
            <div className="space-y-6">
              <ToggleControl 
                label="Maintenance Mode"
                description="When enabled, only admins can access the site."
                active={getConfigValue("maintenance_mode") === "true"}
                onToggle={(val) => updateConfig("maintenance_mode", val.toString())}
                isSaving={saving === "maintenance_mode"}
              />
              <ToggleControl 
                label="Allow New Registrations"
                description="Enable or disable new user signups."
                active={getConfigValue("allow_signup") !== "false"}
                onToggle={(val) => updateConfig("allow_signup", val.toString())}
                isSaving={saving === "allow_signup"}
              />
            </div>
          </ConfigSection>

          {/* Feature Flags */}
          <ConfigSection 
            title="Feature Management" 
            description="Toggle advanced features and experimental tools."
            icon={ToggleLeft}
          >
             <div className="space-y-6">
              <ToggleControl 
                label="AI Planner (GPT-4o)"
                description="Use the high-intelligence planning engine."
                active={getConfigValue("use_gpt4") === "true"}
                onToggle={(val) => updateConfig("use_gpt4", val.toString())}
                isSaving={saving === "use_gpt4"}
              />
              <ToggleControl 
                label="Multi-City Planning"
                description="Allow users to plan trips across multiple destinations."
                active={getConfigValue("enable_multicity") === "true"}
                onToggle={(val) => updateConfig("enable_multicity", val.toString())}
                isSaving={saving === "enable_multicity"}
              />
            </div>
          </ConfigSection>

          <div className="rounded-3xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center bg-secondary/10">
            <AlertCircle className="size-8 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-bold">Advanced Settings</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
              More configuration options are available via the database management console.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function ConfigSection({ title, description, icon: Icon, children }: any) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 mb-8">
        <div className="size-10 rounded-xl bg-secondary grid place-items-center text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ImageConfig({ images, onSave, isSaving }: any) {
  const [localImages, setLocalImages] = useState<string[]>(images);

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) setLocalImages([...localImages, url]);
  };

  const removeImage = (index: number) => {
    setLocalImages(localImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {localImages.map((img, i) => (
          <div key={i} className="group relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
            <img src={img} alt="" className="size-full object-cover" />
            <button 
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 size-6 rounded-lg bg-destructive text-white grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-md"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button 
          onClick={addImage}
          className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition grid place-items-center text-muted-foreground hover:text-primary group"
        >
          <div className="flex flex-col items-center gap-1">
            <Plus className="size-6 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
          </div>
        </button>
      </div>
      <button 
        onClick={() => onSave(localImages)}
        disabled={isSaving}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save Carousel
      </button>
    </div>
  );
}

function ToggleControl({ label, description, active, onToggle, isSaving }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
      <div className="flex-1 min-w-0 pr-4">
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <button 
        onClick={() => onToggle(!active)}
        disabled={isSaving}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          active ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
