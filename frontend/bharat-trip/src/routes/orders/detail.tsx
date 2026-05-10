import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { 
  ChevronLeft, Loader2, CheckCircle2, Package, 
  MapPin, Clock, Truck, ShieldCheck, HelpCircle,
  Calendar, ShoppingBag, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
          <Loader2 className="size-12 text-[#FF6B00] animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-center p-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-black mb-4">Order Not Found</h2>
            <Link to="/orders" className="text-[#FF6B00] font-bold">Back to My Orders</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const statusSteps = [
    { id: "placed", label: "Order Placed", icon: Clock },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: Package },
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.id === order.status);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0F0F0F] text-white font-['Poppins'] pb-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => navigate("/orders")}
              className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black font-['Cinzel'] tracking-tight">Order <span className="text-[#FF6B00]">{order.orderId}</span></h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Manifested on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Status Timeline */}
              <div className="bg-[#1A1A1A] rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-lg font-black mb-10 font-['Cinzel']">Journey Status</h3>
                <div className="relative flex justify-between">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-white/5" />
                  <div className="absolute top-5 left-0 h-1 bg-[#FF6B00] transition-all duration-1000" style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }} />
                  
                  {statusSteps.map((step, i) => {
                    const isActive = i <= currentStatusIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                        <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive ? "bg-[#FF6B00] border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.5)]" : "bg-[#1A1A1A] border-white/10 text-white/20"
                        }`}>
                          <Icon className="size-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-[#FF6B00]" : "text-white/20"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#1A1A1A] rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-lg font-black mb-8 font-['Cinzel']">Sacred Items</h3>
                <div className="space-y-6">
                  {order.items.map((item: any) => (
                    <div key={item.itemId} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold">{item.name}</div>
                          <div className="text-white/40 text-[10px] uppercase font-black tracking-widest">Qty: {item.quantity} × ₹{item.price}</div>
                        </div>
                      </div>
                      <div className="font-black text-[#FFD700]">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-[#1A1A1A] rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-lg font-black mb-8 font-['Cinzel']">Delivery Destination</h3>
                <div className="flex items-start gap-6">
                  <div className="size-14 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] shrink-0">
                    <MapPin className="size-7" />
                  </div>
                  <div>
                    <div className="font-black text-xl mb-2">{order.deliveryAddress.name}</div>
                    <div className="text-white/60 leading-relaxed italic">{order.deliveryAddress.address}</div>
                    <div className="text-white/60 font-bold">{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</div>
                    <div className="mt-4 text-[#FFD700] font-black text-sm">{order.deliveryAddress.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-gradient-to-br from-[#FF6B00] to-[#E32636] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(255,107,0,0.3)]">
                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-white/20 pb-4">Financial Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-white/70 text-sm font-bold">
                    <span>Subtotal</span>
                    <span>₹{order.totalAmount - Math.round(order.totalAmount * 0.05) - 50}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm font-bold">
                    <span>Tax & Delivery</span>
                    <span>₹{Math.round(order.totalAmount * 0.05) + 50}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-black font-['Cinzel']">Paid Amount</span>
                  <span className="text-3xl font-black text-white">₹{order.totalAmount}</span>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                 <div className="flex items-center gap-4 text-sm text-white/60 font-bold">
                    <CreditCard className="size-5 text-[#FFD700]" /> {order.paymentStatus.toUpperCase()} via GTP Pay
                 </div>
                 <div className="flex items-center gap-4 text-sm text-white/60 font-bold">
                    <ShieldCheck className="size-5 text-emerald-500" /> Secure Package
                 </div>
                 <div className="flex items-center gap-4 text-sm text-white/60 font-bold">
                    <Truck className="size-5 text-blue-500" /> Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                 </div>
              </div>

              <button className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                <HelpCircle className="size-5" /> Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
