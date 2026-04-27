import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Footer } from "@/components/Footer";
import { FadeUp, StaggerGroup, StaggerItem, HoverLift, dur, ease } from "@/components/motion/primitives";
import {
  Sparkles, Users, Wallet, Star, ArrowRight, Plane, X, MapPin, Clock, Calendar
} from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-jaipur.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";
import rishikesh from "@/assets/dest-rishikesh.jpg";
import kerala from "@/assets/dest-kerala.jpg";

const destinations = [
  { 
    name: "Jaipur", 
    img: jaipur, 
    tag: "Heritage", 
    days: 4,
    info: "Explore the pink city's majestic forts and vibrant palaces.",
    details: "Jaipur, the 'Pink City', is a treasure trove of heritage. Visit the iconic Hawa Mahal, the sprawling Amer Fort, and the opulent City Palace. Experience authentic Rajasthani culture through its bustling bazaars, traditional crafts, and royal cuisine that tells stories of a bygone era.",
    gradient: "bg-gradient-to-br from-orange-500 to-rose-600"
  },
  { 
    name: "Goa", 
    img: goa, 
    tag: "Beaches", 
    days: 4,
    info: "Relax on sun-kissed beaches and enjoy vibrant nightlife.",
    details: "Goa offers a perfect blend of relaxation and adventure. Beyond its world-famous beaches like Baga and Palolem, explore Portuguese-style churches in Old Goa, spice plantations, and hidden waterfalls. The unique 'Susegad' lifestyle ensures you leave completely refreshed and energized.",
    gradient: "bg-gradient-to-br from-blue-500 to-emerald-600"
  },
  { 
    name: "Rishikesh", 
    img: rishikesh, 
    tag: "Spiritual", 
    days: 4,
    info: "Find peace by the Ganges and experience the yoga capital.",
    details: "Nestled in the Himalayan foothills, Rishikesh is the spiritual heart of India. From the evening Ganga Aarti at Triveni Ghat to adrenaline-pumping white water rafting, it offers a dual experience of tranquility and thrill. It's the ultimate destination for yoga practitioners and nature seekers alike.",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-600"
  },
  { 
    name: "Kerala Backwaters", 
    img: kerala, 
    tag: "Nature", 
    days: 4,
    info: "Cruise through serene emerald waters on houseboats.",
    details: "Kerala's backwaters in Alleppey and Kumarakom offer an ethereal escape. Stay in traditional houseboats as you glide past coconut groves, paddy fields, and local villages. It's an intimate way to experience 'God's Own Country', accompanied by authentic Ayurvedic treatments and Malabari seafood.",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-700"
  },
];

const voices = [
  { name: "Ananya R.", role: "Solo traveller, Bengaluru", quote: "I planned a 7-day Himachal trip in 4 minutes. The AI even nailed the rest day after the trek." },
  { name: "Kabir & Maya", role: "Honeymoon, Kerala", quote: "Stunning suggestions, perfect pacing. It felt like a friend who actually lives in Munnar wrote it." },
  { name: "The Mehta family", role: "Group of 6, Rajasthan", quote: "Group polling saved our marriage. Probably." },
];

const features = [
  { icon: Sparkles, title: "AI Itinerary", desc: "A senior travel planner in your pocket. Day-by-day plans tuned to your style in seconds." },
  { icon: Users, title: "Group Polls", desc: "Decide destinations, dates and stays together. No more 47-message threads." },
  { icon: Wallet, title: "Budget Control", desc: "See exactly where every rupee goes — flights, stays, food, and experiences." },
];

function DestinationCard({ d, onShowDetails }: { d: any, onShowDetails: (d: any) => void }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative aspect-[3/4] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          scale: isFlipped ? 1.05 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        }}
        style={{ 
          width: "100%", 
          height: "100%", 
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={d.img}
            alt={d.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest bg-white text-foreground px-2.5 py-1 rounded-full">{d.tag}</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="font-display font-bold text-2xl">{d.name}</div>
            <div className="text-sm text-white/80 mt-1">From ₹14,200 · {d.days} days</div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden ${d.gradient} p-8 flex flex-col items-center justify-center text-center shadow-cta border-4 border-white/20`}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          <div className="size-14 rounded-2xl bg-white/20 grid place-items-center mb-4 backdrop-blur-sm">
             <Plane className="size-7 text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-3">{d.name}</h3>
          <p className="text-white/90 text-sm leading-relaxed font-medium">
            {d.info}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(d);
            }}
            className="mt-8 px-5 py-2 rounded-xl bg-white text-foreground text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
             Explore Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Landing() {
  const [selectedDest, setSelectedDest] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-accent uppercase tracking-widest">Why GoTripo</div>
          <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">
            The travel agent that fits in your pocket.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Three quiet superpowers that make every trip feel handcrafted.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-pop hover:-translate-y-1 transition-all">
              <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center group-hover:bg-warm-gradient group-hover:text-white transition">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display font-bold text-xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-accent uppercase tracking-widest">Popular in India</div>
              <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
                Destinations travellers love
              </h2>
            </div>
            <Link to="/explore" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              Explore all <ArrowRight className="size-4" />
            </Link>
          </FadeUp>

          <StaggerGroup gap={0.07} className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d) => (
              <StaggerItem key={d.name}>
                <DestinationCard d={d} onShowDetails={setSelectedDest} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedDest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDest(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-card rounded-[40px] overflow-hidden shadow-2xl border border-border"
            >
              <button 
                onClick={() => setSelectedDest(null)}
                className="absolute top-6 right-6 z-10 size-12 rounded-full bg-black/20 hover:bg-black/40 text-white grid place-items-center transition-colors backdrop-blur-md"
              >
                <X className="size-6" />
              </button>

              <div className="grid lg:grid-cols-2">
                <div className="h-64 lg:h-[500px] relative">
                  <img src={selectedDest.img} alt="" className="size-full object-cover" />
                  <div className={`absolute inset-0 ${selectedDest.gradient} opacity-20`} />
                  <div className="absolute bottom-8 left-8">
                     <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20">
                        {selectedDest.tag}
                     </span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
                    {selectedDest.name}
                  </h2>
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                       <MapPin className="size-4 text-primary" /> India
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                       <Clock className="size-4 text-primary" /> {selectedDest.days} Days Trip
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                       <Calendar className="size-4 text-primary" /> Best: Oct - Mar
                    </div>
                  </div>
                  <p className="text-foreground/80 text-lg leading-relaxed italic mb-8 border-l-4 border-primary pl-6">
                    "{selectedDest.details}"
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      to={`/planner-single?dest=${encodeURIComponent(selectedDest.name)}&days=${selectedDest.days}`}
                      className="flex-1 h-14 rounded-2xl bg-warm-gradient text-white font-bold flex items-center justify-center gap-2 shadow-cta hover:opacity-95 transition"
                    >
                      Plan this trip <ArrowRight className="size-4" />
                    </Link>
                    <button className="flex-1 h-14 rounded-2xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition">
                      Save destination
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TESTIMONIALS */}
      <section id="voices" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <FadeUp className="max-w-2xl">
          <div className="text-sm font-semibold text-accent uppercase tracking-widest">Voices of explorers</div>
          <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">Stories from the road</h2>
        </FadeUp>
        <StaggerGroup gap={0.09} className="mt-12 grid md:grid-cols-3 gap-5">
          {voices.map((v) => (
            <StaggerItem key={v.name}>
              <HoverLift className="rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex text-accent">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="size-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground text-lg leading-relaxed">"{v.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary-soft text-primary grid place-items-center font-bold text-sm">{v.name[0]}</div>
                  <div>
                    <div className="font-semibold text-sm">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.role}</div>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-10 pb-24">
        <FadeUp className="max-w-7xl mx-auto rounded-3xl bg-hero-gradient text-white p-10 md:p-16 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative max-w-2xl">
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">Your next trip is one prompt away.</h2>
            <p className="mt-4 text-white/80 text-lg">Start free. Plan in minutes. Travel like you finally have time.</p>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: dur.xs, ease }} className="inline-block mt-8">
              <Link to="/trip-type" className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-warm-gradient font-semibold shadow-cta">
                <Plane className="size-4" /> Plan my trip
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
