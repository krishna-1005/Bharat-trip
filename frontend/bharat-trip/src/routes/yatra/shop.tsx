import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { 
  ShoppingBag, ArrowLeft, Clock, Wrench, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function TripShopPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#090d16] text-foreground font-['Poppins'] flex flex-col items-center justify-center py-20 px-6">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-[40px] p-8 md:p-16 text-center shadow-xl overflow-hidden">
          
          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Maintenance Icon Group */}
            <div className="relative mb-10">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="size-24 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center"
              >
                <ShoppingBag className="size-12" />
              </motion.div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 shadow-lg flex items-center justify-center text-amber-500"
              >
                <Wrench className="size-5" />
              </motion.div>
            </div>

            {/* Badging */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              TEMPORARY MAINTENANCE
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-5xl font-black mb-6 font-['Cinzel'] tracking-tight text-slate-900 dark:text-white leading-tight">
              Upgrading The <br />
              <span className="text-amber-500">Traveler Catalog</span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10">
              We are currently stocktaking and uploading premium pilgrimage items, temple kits, and travel gear to the GoTripo shop. We'll be back online in a few hours!
            </p>

            {/* Time Estimate Box */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 flex items-center gap-4 text-left mb-12">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="size-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Downtime</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Approx. 2 hours remaining</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <Link 
                to="/yatra"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ArrowLeft className="size-4" /> Go Back to Yatra
              </Link>
              <Link 
                to="/"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-transparent"
              >
                Return Home <Sparkles className="size-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
