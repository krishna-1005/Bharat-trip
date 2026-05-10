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

export default function DivineShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Using the correct orderable items endpoint
        const res = await api.get("/yatra-kit/items/orderable");
        setItems(res.data);
        
        const uniqueCategories = ["All", ...new Set(res.data.map((item: any) => item.category))] as string[];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to fetch shop items:", err);
        // Fallback sample data if API fails or is empty
        const fallbackItems = [
          { _id: "1", name: "Ganga Jal (Sacred Water)", price: 150, category: "Puja Items", description: "Pure water from the Ganges", imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200" },
          { _id: "2", name: "Comfortable Cotton Kurta", price: 850, category: "Clothing", description: "Breathable cotton for pilgrimages", imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=200" },
          { _id: "3", name: "Copper Lota", price: 450, category: "Puja Items", description: "Handcrafted copper vessel", imageUrl: "https://images.unsplash.com/photo-1614091907162-c104958ce99e?auto=format&fit=crop&q=80&w=200" },
          { _id: "4", name: "Herbal Sunscreen", price: 299, category: "Essentials", description: "Natural protection from mountain sun", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=200" },
          { _id: "5", name: "Insulated Water Bottle", price: 599, category: "Essentials", description: "Keeps water cool for 24 hours", imageUrl: "https://images.unsplash.com/photo-1602143307185-8ca415853967?auto=format&fit=crop&q=80&w=200" },
          { _id: "6", name: "Prayer Beads (Rudraksha)", price: 1200, category: "Sacred", description: "Original 5-mukhi Rudraksha mala", imageUrl: "https://images.unsplash.com/photo-1596450514735-397268d0d979?auto=format&fit=crop&q=80&w=200" },
          { _id: "7", name: "Walking Shoes (Comfortable)", price: 2499, category: "Essentials", description: "Durable shoes for long temple walks", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200" },
          { _id: "8", name: "Portable Power Bank", price: 1599, category: "Electronics", description: "High capacity for travel charging", imageUrl: "https://images.unsplash.com/photo-1609592424089-9890636886e5?auto=format&fit=crop&q=80&w=200" },
          { _id: "9", name: "Spiritual Shawl", price: 650, category: "Clothing", description: "Lightweight shawl for temple visits", imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=200" },
          { _id: "10", name: "Travel Medicine Kit", price: 450, category: "Health", description: "Basic first aid and travel meds", imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=200" }
        ];
        setItems(fallbackItems);
        setCategories(["All", "Puja Items", "Clothing", "Essentials", "Sacred", "Electronics", "Health"]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    // Improved search: split query into keywords and check if any keyword matches
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    const matchesSearch = query === "" || 
                          keywords.some(k => item.name.toLowerCase().includes(k)) || 
                          keywords.some(k => item.description?.toLowerCase().includes(k)) ||
                          item.name.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemQuantityInCart = (itemId: string) => {
    return cart?.items.find(i => i.itemId === itemId)?.quantity || 0;
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      itemId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1
    });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0A0A0A] font-['Poppins'] pb-32">
        {/* Zepto-style Header Section */}
        <div className="bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 sticky top-16 z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                  <ShoppingBag className="size-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight dark:text-white">Divine Essentials</h1>
                  <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest">Everything for your Yatra</p>
                </div>
              </div>

              <div className="relative flex-1 max-w-xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-[#FF6B00] transition-colors" />
                <input 
                  type="text"
                  placeholder="Search for 'Kurta', 'Ganga Jal', 'Rudraksha'..."
                  value={query}
                  onChange={(e) => setSearchParams({ q: e.target.value })}
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-[#FF6B00] outline-none font-medium text-sm transition-all"
                />
              </div>
            </div>

            {/* Categories Scroll */}
            <div className="flex items-center gap-3 overflow-x-auto py-6 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                    activeCategory === cat 
                    ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" 
                    : "bg-transparent border-gray-100 dark:border-white/10 text-gray-500 hover:border-[#FF6B00]/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="size-16 text-[#FF6B00] animate-spin" />
              <p className="font-bold text-gray-400">Loading your sacred catalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-[#121212] rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/5">
              <div className="size-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="size-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black mb-2 dark:text-white">No items found</h3>
              <p className="text-gray-400 font-medium mb-8">We couldn't find "{query}" in our catalog.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {filteredItems.map((item, idx) => {
                const quantity = getItemQuantityInCart(item._id);
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white dark:bg-[#121212] rounded-[2.5rem] overflow-hidden border border-transparent hover:border-[#FF6B00]/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-2"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-white/5">
                      <img 
                        src={item.imageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400"} 
                        alt={item.name}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-[#FF6B00] shadow-sm">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-sm leading-tight dark:text-white line-clamp-2">{item.name}</h3>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Price</span>
                          <span className="text-lg font-black text-[#1A1A1A] dark:text-white">₹{item.price}</span>
                        </div>

                        <AnimatePresence mode="wait">
                          {quantity > 0 ? (
                            <motion.div 
                              key="counter"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-4 bg-[#FF6B00] text-white p-1 rounded-2xl shadow-lg shadow-[#FF6B00]/30"
                            >
                              <button 
                                onClick={() => updateQuantity(item._id, quantity - 1)}
                                className="size-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="font-black text-sm w-4 text-center">{quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item._id, quantity + 1)}
                                className="size-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                              >
                                <Plus className="size-4" />
                              </button>
                            </motion.div>
                          ) : (
                            <motion.button 
                              key="add"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={() => handleAddToCart(item)}
                              className="size-12 rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm active:scale-90 group/add"
                            >
                              <Plus className="size-6 group-hover/add:rotate-90 transition-transform" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating View Cart (Zepto Style) */}
        {cart && cart.items.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
            <Link 
              to="/cart"
              className="w-full h-16 bg-[#FF6B00] text-white rounded-[2rem] shadow-[0_20px_40px_rgba(255,107,0,0.4)] flex items-center justify-between px-8 group active:scale-95 transition-all overflow-hidden border-2 border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Items in cart</div>
                  <div className="font-black text-sm leading-none">{cart.items.length} Items • ₹{cart.totalAmount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-sm">
                View Cart <ChevronRight className="size-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
