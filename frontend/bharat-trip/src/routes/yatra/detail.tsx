import { YatraLayout } from "@/components/YatraLayout";
import { yatras } from "@/lib/yatra-data";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Clock, Calendar, ShieldCheck, 
  Sparkles, History, Scroll, Route, Hotel, Utensils, 
  Info, CheckCircle2, Heart, Share2, Download
} from "lucide-react";
import { motion } from "framer-motion";

export default function YatraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const yatra = yatras.find(y => y.id === id);

  if (!yatra) {
    return (
      <YatraLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <h2 className="font-display text-3xl font-bold text-[#0E1A2B]">Yatra not found</h2>
          <p className="text-[#6C768A] mt-2 mb-8">The sacred path you are looking for has eluded us.</p>
          <Link to="/yatra" className="px-6 py-3 bg-[#14284B] text-white rounded-xl font-bold">
            Back to Hub
          </Link>
        </div>
      </YatraLayout>
    );
  }

  return (
    <YatraLayout>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img 
          src={yatra.img} 
          alt={yatra.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F5F0] via-[#0E1A2B]/40 to-transparent" />
        
        <div className="absolute top-8 left-6 md:left-10 z-20">
          <button 
            onClick={() => navigate("/yatra")}
            className="size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#0E1A2B] transition-all"
          >
            <ArrowLeft className="size-6" />
          </button>
        </div>

        <div className="absolute bottom-12 left-6 md:left-10 right-6 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E67E22] text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-lg shadow-orange-500/40"
          >
            <Sparkles className="size-3" />
            <span>Sacred Journey</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-[#0E1A2B] mb-6 leading-tight"
          >
            {yatra.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-6 md:gap-10"
          >
            <StatItem icon={<MapPin className="size-4" />} label="Location" value={yatra.region} />
            <StatItem icon={<Clock className="size-4" />} label="Duration" value={yatra.duration} />
            <StatItem icon={<ShieldCheck className="size-4" />} label="Difficulty" value={yatra.difficulty} />
            <StatItem icon={<Calendar className="size-4" />} label="Best Time" value={yatra.bestTime} />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Spiritual Insight */}
          <section>
            <div className="flex items-center gap-3 text-[#E67E22] mb-4">
              <Sparkles className="size-6" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Spiritual Insight</h2>
            </div>
            <div className="relative p-8 md:p-12 rounded-[32px] bg-white border border-[#E6E8EC] shadow-soft">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="size-24 text-[#E67E22]" />
              </div>
              <p className="font-display text-2xl md:text-3xl text-[#14284B] leading-relaxed italic">
                "{yatra.spiritualInsight}"
              </p>
            </div>
          </section>

          {/* Story & Mythology */}
          <section>
            <div className="flex items-center gap-3 text-[#E67E22] mb-6">
              <History className="size-6" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Mythology & History</h2>
            </div>
            <p className="text-lg text-[#6C768A] leading-relaxed">
              {yatra.story}
            </p>
          </section>

          {/* Ritual Guidance */}
          <section>
            <div className="flex items-center gap-3 text-[#E67E22] mb-6">
              <Scroll className="size-6" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Ritual Guidance</h2>
            </div>
            <div className="bg-[#14284B] rounded-[32px] p-8 md:p-12 text-white shadow-pop">
              <h3 className="font-display text-2xl font-bold mb-8 text-[#F4B740]">{yatra.ritualGuidance.title}</h3>
              <div className="space-y-6">
                {yatra.ritualGuidance.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-5">
                    <div className="size-8 rounded-full bg-[#E67E22] flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-orange-500/20">
                      {idx + 1}
                    </div>
                    <p className="text-white/80 font-medium pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Itinerary */}
          <section>
            <div className="flex items-center gap-3 text-[#E67E22] mb-8">
              <Route className="size-6" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Day-wise Path</h2>
            </div>
            <div className="space-y-4">
              {yatra.itinerary.map((item, idx) => (
                <div key={idx} className="group relative pl-12 pb-8 border-l-2 border-[#E6E8EC] last:border-0 last:pb-0">
                  <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-[#E6E8EC] group-hover:bg-[#E67E22] transition-colors" />
                  <div className="text-xs font-bold text-[#E67E22] uppercase tracking-wider mb-1">Day {item.day}</div>
                  <h4 className="font-display text-xl font-bold text-[#0E1A2B] mb-2">{item.title}</h4>
                  <p className="text-[#6C768A]">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Practical Info Grid */}
          <div className="grid md:grid-cols-2 gap-8 pt-8">
            <InfoCard icon={<Hotel />} title="Stays" content={yatra.stay} />
            <InfoCard icon={<Utensils />} title="Facilities" content={yatra.facilities.join(", ")} />
          </div>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Booking Card */}
          <div className="sticky top-24">
            <div className="bg-white rounded-[40px] p-8 shadow-pop border border-[#E6E8EC] overflow-hidden relative">
              <div className="absolute top-0 right-0 size-32 bg-[#F4B740] rounded-full blur-[80px] opacity-5 -mr-16 -mt-16" />
              
              <div className="text-center mb-8">
                <div className="text-[#6C768A] text-xs font-bold uppercase tracking-widest mb-1">Starting Price</div>
                <div className="text-4xl font-display font-bold text-[#0E1A2B]">{yatra.budget}</div>
                <div className="text-[#6C768A] text-xs mt-1">per person inclusive of darshan</div>
              </div>

              <div className="space-y-4 mb-8">
                <FeatureItem text="Certified Spiritual Guides" />
                <FeatureItem text="Priority Darshan Access" />
                <FeatureItem text="Safe & Sacred Stays" />
                <FeatureItem text="24/7 Support for Elderly" />
              </div>

              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#F4B740] text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-4">
                Plan This Yatra
              </button>
              
              <button className="w-full py-3 mb-4 rounded-xl border-2 border-[#ecfdf5] bg-[#f0fdf4] text-[#059669] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#dcfce7] transition-colors">
                <CheckCircle2 className="size-4" /> Mark as Completed
              </button>
              
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl border border-[#E6E8EC] text-[#0E1A2B] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F3F4F6] transition-colors">
                  <Heart className="size-4" /> Save
                </button>
                <button className="flex-1 py-3 rounded-xl border border-[#E6E8EC] text-[#0E1A2B] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F3F4F6] transition-colors">
                  <Share2 className="size-4" /> Share
                </button>
              </div>

              <button className="w-full mt-6 text-[#6C768A] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-[#0E1A2B] transition-colors">
                <Download className="size-4" /> Download Spiritual Guide PDF
              </button>
            </div>

            {/* Travel Tips */}
            <div className="mt-8 bg-[#FFF3E0] rounded-[32px] p-8 border border-[#F4B740]/20">
              <div className="flex items-center gap-2 text-[#E67E22] mb-4">
                <Info className="size-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Travel Tips</h3>
              </div>
              <ul className="space-y-3">
                {yatra.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-[#0E1A2B]/80 leading-relaxed">
                    <div className="size-1.5 rounded-full bg-[#E67E22] shrink-0 mt-2" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </YatraLayout>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{label}</div>
        <div className="text-white font-bold text-sm">{value}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="p-6 rounded-[24px] bg-white border border-[#E6E8EC] shadow-soft">
      <div className="flex items-center gap-3 text-[#E67E22] mb-4">
        <div className="size-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
      </div>
      <p className="text-sm text-[#6C768A] leading-relaxed">{content}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-[#0E1A2B]/80">
      <div className="size-5 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
        <CheckCircle2 className="size-3" />
      </div>
      {text}
    </div>
  );
}
