import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, ChevronLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";

const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
        if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
            navigate("/admin");
        }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        toast.error("Unauthorized access attempt. This activity is being logged.");
        return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome, Administrator.");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (ADMIN_EMAILS.includes(result.user.email?.toLowerCase() || "")) {
          toast.success("Identity verified.");
          navigate("/admin");
      } else {
          toast.error("This account is not authorized for administrative access.");
          await auth.signOut();
      }
    } catch (err: any) {
      toast.error(err.message || "Google verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition">
          <ChevronLeft className="size-4" /> Exit to GoTripo
        </Link>
      </div>

      <div className="flex-1 grid place-items-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="size-16 rounded-2xl bg-primary grid place-items-center mx-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
              <ShieldCheck className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Admin Portal</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-[0.2em] font-medium">Restricted Access</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-10 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">Administrator Email</label>
              <div className="relative">
                <Mail className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gotripo.com"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-5 animate-spin" /> : <>Sign in to Dashboard <ArrowRight className="size-4" /></>}
            </button>

            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Security Check</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full h-12 bg-transparent border border-white/10 rounded-2xl text-sm font-semibold hover:bg-white/5 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Verify with Google Account
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/30 leading-relaxed">
            Unauthorized access to this portal is strictly prohibited and monitored.<br />
            System IP and metadata are recorded for each attempt.
          </p>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">GoTripo Admin Engine v1.2.0</p>
      </div>
    </div>
  );
}
