import { YatraLayout } from "@/components/YatraLayout";
import { YatraCard } from "@/components/YatraCard";
import { YatraMaintenance } from "@/components/YatraMaintenance";
import { yatras } from "@/lib/yatra-data";
import { Search, Sparkles, Filter, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function YatraHub() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay was prevented:", error);
      });
    }
  }, []);

  const filteredYatras = yatras.filter(y => {
    const matchesSearch = y.title.toLowerCase().includes(search.toLowerCase()) || 
                         y.region.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || y.difficulty === filter || y.tag === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <YatraLayout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden min-h-[600px] flex items-center justify-center bg-[#0E1A2B]">
        {/* Cinematic Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-over-a-mountain-range-41483-large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Spiritual Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1A2B]/80 via-transparent to-background" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22] text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-orange-500/20"
          >
            <Sparkles className="size-3" />
            <span>Sacred Expeditions</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl"
          >
            Your spiritual journey <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4B740] to-[#E67E22]">starts here.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-white/90 leading-relaxed mb-12 font-medium drop-shadow-md"
          >
            Discover ancient trails, sacred temples, and soul-stirring landscapes. 
            A pilgrimage is not just a destination; it's a return to oneself.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E67E22] to-[#F4B740] rounded-[24px] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative flex items-center bg-background rounded-[24px] p-2.5 shadow-2xl border border-white/20">
              <div className="flex-1 flex items-center px-4">
                <Search className="size-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search temple, yatra, or state..."
                  className="w-full bg-transparent border-none focus:ring-0 text-foreground font-semibold px-3 py-4 text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all shadow-xl">
                Explore
              </button>
            </div>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            <Link to="/yatra/planner" className="px-10 py-4 rounded-2xl bg-[#E67E22] text-white font-bold text-base hover:scale-105 transition-all shadow-xl shadow-orange-500/30 flex items-center gap-3">
              <Sparkles className="size-5" /> Try AI Planner
            </Link>
            <Link to="/yatra/wishlist" className="px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold text-base hover:bg-white hover:text-[#0E1A2B] transition-all flex items-center gap-3">
              <Filter className="size-5" /> My Wishlist
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-primary rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden shadow-pop border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
          <Wind className="absolute top-6 left-6 size-12 text-white/5" />
          <item className="absolute bottom-6 right-6 size-12 text-white/5" />
          
          <div className="text-[#F4B740] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Spiritual Quote of the Day</div>
          <blockquote className="font-display text-2xl md:text-3xl text-white italic leading-snug">
            "The soul is not born, it does not die; it is not that having been, it will never be again. Unborn, eternal, permanent and primeval."
          </blockquote>
          <cite className="block mt-6 text-white/60 text-sm font-medium not-italic">— Bhagavad Gita</cite>
        </div>
      </section>

      {/* Listing Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="text-[#E67E22] text-xs font-bold uppercase tracking-widest mb-2">Discovery</div>
            <h2 className="font-display text-4xl font-bold text-foreground">Sacred Journeys</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {["All", "Easy", "Moderate", "Challenging", "Eternal City"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  filter === f 
                    ? "bg-[#E67E22] text-white border-[#E67E22] shadow-lg shadow-orange-500/20 scale-105" 
                    : "bg-card text-muted-foreground border-border hover:border-[#F4B740]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredYatras.map((y, idx) => (
            <motion.div
              key={y.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <YatraCard yatra={y} />
            </motion.div>
          ))}
        </div>

        {filteredYatras.length === 0 && (
          <div className="text-center py-20 bg-card/50 rounded-[40px] border border-dashed border-border">
            <div className="size-16 rounded-3xl bg-card border border-border flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Wind className="size-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">No sacred paths found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters to find other journeys.</p>
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-hero-gradient rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/mandala.png')] opacity-5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Can't find your path?</h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Tell us your spiritual preferences and we'll help you find a journey that resonates with your soul.
            </p>
            <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#F4B740] text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
              Connect with a Guide
            </button>
          </div>
        </div>
      </section>
    </YatraLayout>
  );
}
