import { Link } from "react-router-dom";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-4 inset-x-4 lg:inset-x-8 z-50">
      <div className="max-w-7xl mx-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between text-white shadow-2xl">

        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-xl bg-warm-gradient grid place-items-center font-bold shadow-cta group-hover:scale-110 transition-transform">
            G
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            GoTripo
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/80">
          <a href="#features">Features</a>
          <a href="#destinations">Destinations</a>
          <a href="#voices">Stories</a>
          <Link to="/explore">Explore</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle className="!bg-white/10 !border-white/20 text-white hover:!bg-white/20" />

          {!loading &&
            (user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="size-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-sm hover:bg-white/20 transition shadow-sm"
                  title="My Profile"
                >
                  {(user.displayName as string | undefined)?.charAt(0) || user.email?.charAt(0).toUpperCase() || "P"}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition flex items-center gap-2"
                >
                  Dashboard <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm px-4 py-2 hover:text-white transition">
                  Log in
                </Link>

                <Link
                  to="/auth?mode=signup"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-warm-gradient shadow-cta hover:opacity-95 transition"
                >
                  <Sparkles className="size-4 inline mr-1" /> Get started
                </Link>
              </>
            ))}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 text-white space-y-1 shadow-2xl animate-in fade-in zoom-in duration-200">
          <a href="#features" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 transition">Features</a>
          <a href="#destinations" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 transition">Destinations</a>
          {!user ? (
            <div className="pt-2 space-y-2">
              <Link to="/auth" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 transition">Log in</Link>
              <Link to="/auth?mode=signup" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl bg-warm-gradient font-bold text-center">Get started</Link>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 transition font-semibold border-b border-white/5">My Profile</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold text-center">Dashboard</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
