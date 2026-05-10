import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { 
  Package, ChevronRight, Loader2, ShoppingBag, 
  CheckCircle2, Clock, Truck, Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "confirmed": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "shipped": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "delivered": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
          <Loader2 className="size-12 text-[#FF6B00] animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0F0F0F] text-white font-['Poppins'] pb-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="text-3xl font-black font-['Cinzel'] tracking-tight mb-2">My <span className="text-[#FF6B00]">Sacred Orders</span></h1>
            <p className="text-white/40 text-sm italic">Track your spiritual essentials</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-[3rem] p-20 text-center border border-white/5">
              <div className="size-40 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10">
                <Package className="size-20 text-white/20" />
              </div>
              <h3 className="text-2xl font-black mb-4">No orders yet</h3>
              <p className="text-white/40 mb-10 max-w-md mx-auto">
                You haven't placed any orders for yatra kits yet.
              </p>
              <Link 
                to="/yatra"
                className="inline-flex items-center gap-3 px-10 py-4 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#E32636] transition-all"
              >
                Explore Yatras <ChevronRight className="size-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={order._id}
                  className="bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-white/5 hover:border-[#FF6B00]/30 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                      <div className="size-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <ShoppingBag className="size-10 text-[#FF6B00]" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">{order.orderId}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <h4 className="text-xl font-black">{order.items.length} Items for Journey</h4>
                        <div className="flex items-center gap-4 text-white/40 text-xs font-bold">
                          <span className="flex items-center gap-2"><Calendar className="size-4" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-2 text-white font-black text-sm">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Item Previews */}
                      <div className="hidden md:flex -space-x-4">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="size-12 rounded-full border-2 border-[#1A1A1A] overflow-hidden bg-white/10">
                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="size-12 rounded-full border-2 border-[#1A1A1A] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      <Link 
                        to={`/orders/${order.orderId}`}
                        className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all flex items-center gap-2"
                      >
                        Details <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
