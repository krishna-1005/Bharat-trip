import { YatraLayout } from "@/components/YatraLayout";
import { YatraCard } from "@/components/YatraCard";
import { yatras } from "@/lib/yatra-data";
import { Heart, Wind, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function YatraWishlist() {
  // Mock wishlist for now
  const wishlistedYatras = [yatras[0], yatras[1]];

  return (
    <YatraLayout>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-3 text-[#E67E22] mb-4">
          <Heart className="size-6 fill-current" />
          <h2 className="text-sm font-bold uppercase tracking-widest">My Collection</h2>
        </div>
        
        <h1 className="font-display text-5xl font-bold text-[#0E1A2B] mb-12">Sacred Wishlist</h1>

        {wishlistedYatras.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistedYatras.map((y, idx) => (
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
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-[#E6E8EC] shadow-soft">
            <div className="size-20 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto mb-6">
              <Heart className="size-10 text-[#E67E22] opacity-20" />
            </div>
            <h3 className="text-2xl font-display font-bold text-[#0E1A2B]">Your collection is empty</h3>
            <p className="text-[#6C768A] mt-2 mb-10 max-w-sm mx-auto">
              Save the yatras that resonate with your soul to plan them when the call comes.
            </p>
            <Link to="/yatra" className="inline-flex items-center gap-2 px-8 py-4 bg-[#14284B] text-white rounded-2xl font-bold shadow-lg shadow-navy/20 hover:scale-105 transition-transform">
              Discover Yatras <ArrowRight className="size-5" />
            </Link>
          </div>
        )}

        <div className="mt-24 p-12 rounded-[40px] bg-[#14284B] text-center relative overflow-hidden">
          <Wind className="absolute top-0 right-0 size-64 text-white/5 -mr-20 -mt-20" />
          <h2 className="font-display text-3xl font-bold text-white mb-4 italic">"The journey of a thousand miles begins with a single step."</h2>
          <p className="text-white/60">— Lao Tzu</p>
        </div>
      </div>
    </YatraLayout>
  );
}
