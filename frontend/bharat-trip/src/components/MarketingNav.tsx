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
              <Link
                to="/dashboard"
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-white/10"
              >
                Dashboard <ArrowRight className="size-4 inline" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm px-4 py-2">
                  Log in
                </Link>

                <Link
                  to="/auth?mode=signup"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-warm-gradient"
                >
                  <Sparkles className="size-4 inline" /> Get started
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
        <div className="md:hidden mt-2 glass rounded-2xl p-4 text-white space-y-2">
          <a href="#features" className="block py-2">Features</a>
          <a href="#destinations" className="block py-2">Destinations</a>
          {!user ? (
            <>
              <Link to="/auth" className="block py-2">Log in</Link>
              <Link to="/auth?mode=signup" className="block py-2 font-semibold">Get started</Link>
            </>
          ) : (
            <Link to="/dashboard" className="block py-2 font-semibold">Dashboard</Link>
          )}
        </div>
      )}
    </header>
  );
}
