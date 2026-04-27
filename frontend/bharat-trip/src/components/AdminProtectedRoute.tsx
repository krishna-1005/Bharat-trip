import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import api from "@/lib/api";

const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/admin/login");
      return;
    }

    const isEmailAuthorized = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");
    
    if (!isEmailAuthorized) {
      setAuthorized(false);
      return;
    }

    // Verify with backend to ensure role is updated and token is valid for admin routes
    api.get("/admin/whoami")
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));

  }, [user, authLoading, navigate]);

  if (authLoading || authorized === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground font-display">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="size-20 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto">
            <ShieldAlert className="size-10" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              Your account ({user?.email}) does not have administrative privileges. 
              Please contact the system owner if you believe this is an error.
            </p>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg"
          >
            Return to GoTripo
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
