import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FadeUp, StaggerGroup, StaggerItem, HoverLift, dur, ease } from "@/components/motion/primitives";
import {
  Sparkles, Users, Wallet, Star, ArrowRight, Plane,
} from "lucide-react";
import heroImg from "@/assets/hero-jaipur.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";
import rishikesh from "@/assets/dest-rishikesh.jpg";
import kerala from "@/assets/dest-kerala.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoTripo — Plan Smarter. Travel Better." },
      { name: "description", content: "AI-powered personalized travel planning across India. Itineraries, group polls, and budgets — built in minutes." },
      { property: "og:title", content: "GoTripo — Plan Smarter. Travel Better." },
      { property: "og:description", content: "AI-powered travel planning across India." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI Itinerary", desc: "A senior travel planner in your pocket. Day-by-day plans tuned to your style in seconds." },
  { icon: Users, title: "Group Polls", desc: "Decide destinations, dates and stays together. No more 47-message threads." },
  { icon: Wallet, title: "Budget Control", desc: "See exactly where every rupee goes — flights, stays, food, and experiences." },
];

const destinations = [
  { name: "Jaipur", img: jaipur, tag: "Heritage" },
  { name: "Goa", img: goa, tag: "Beaches" },
  { name: "Rishikesh", img: rishikesh, tag: "Spiritual" },
  { name: "Kerala Backwaters", img: kerala, tag: "Nature" },
];

const voices = [
  { name: "Ananya R.", role: "Solo traveller, Bengaluru", quote: "I planned a 7-day Himachal trip in 4 minutes. The AI even nailed the rest day after the trek." },
  { name: "Kabir & Maya", role: "Honeymoon, Kerala", quote: "Stunning suggestions, perfect pacing. It felt like a friend who actually lives in Munnar wrote it." },
  { name: "The Mehta family", role: "Group of 6, Rajasthan", quote: "Group polling saved our marriage. Probably." },
];

function Landing() {
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
                <HoverLift className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer shadow-card">
                  <motion.img
                    src={d.img}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    width={1024}
                    height={1024}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/10 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-semibold uppercase tracking-widest bg-white/90 text-foreground px-2.5 py-1 rounded-full">{d.tag}</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <div className="font-display font-bold text-2xl">{d.name}</div>
                    <div className="text-sm text-white/80 mt-1">From ₹14,200 · 4 days</div>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

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

      <footer className="border-t border-border py-10 text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-warm-gradient grid place-items-center text-white font-bold text-xs">G</div>
            © {new Date().getFullYear()} GoTripo. Made for the road.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
