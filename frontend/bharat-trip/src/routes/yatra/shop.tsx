import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { 
  Search, ShoppingCart, Plus, Minus, Package, 
  ArrowRight, Loader2, Filter, ShoppingBag, 
  ChevronRight, Sparkles, Star, Tag, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function TripShopPage() {
  return (
    <AppShell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0A] font-['Poppins'] px-6 text-center">
        <div className="size-32 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <Package className="size-16 text-amber-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight dark:text-white mb-4 font-['Cinzel']">
          Store Under <span className="text-amber-500">Maintenance</span>
        </h1>
        <p className="text-gray-500 dark:text-white/60 max-w-md mx-auto leading-relaxed mb-10">
          We're updating our travel catalog with premium gear and exclusive essentials. 
          The store will be back online shortly with a brand new collection!
        </p>
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
        >
          Back to Dashboard <ArrowRight className="size-5" />
        </Link>
      </div>
    </AppShell>
  );
}
