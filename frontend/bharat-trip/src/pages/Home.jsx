import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MinimalReviewSection from "../components/MinimalReviewSection";

const VoyageNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>
          Voyage
        </div>
        <div className="hidden md:flex items-center space-gap gap-8">
          <NavLink label="Home" active onClick={() => navigate('/')} />
          <NavLink label="Create Poll" onClick={() => navigate('/create-poll')} />
          <NavLink label="Planner" onClick={() => navigate('/planner')} />
          <NavLink label="Map" onClick={() => navigate('/results')} />
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-sm font-bold border-2 border-white/10">
            JD
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/60 hover:text-white'}`}
  >
    {label}
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-blue"
      />
    )}
  </button>
);

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-8 rounded-3xl group transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-2xl mb-6 group-hover:bg-accent-blue transition-colors duration-300 group-hover:text-white">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed">{desc}</p>
  </motion.div>
);

const StepItem = ({ number, label, icon }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center text-sm font-bold border-2 border-[#020617]">
        {number}
      </div>
    </div>
    <span className="text-sm font-semibold text-white/80">{label}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  const destinations = [
    { name: "Goa", tagline: "Tropical Paradise", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", tagline: "Mountain Highs", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tagline: "Nature's Own", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", tagline: "Royal Heritage", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    { name: "Ladakh", tagline: "Uncharted Realms", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Rishikesh", tagline: "Spiritual Peace", img: "https://images.unsplash.com/photo-1584126307041-659f77626966?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <div className="min-h-screen gradient-bg font-sans selection:bg-accent-blue/30 overflow-x-hidden">
      <VoyageNavbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
              Plan Trips Without <br />
              <span className="text-accent-blue">Confusion</span>
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed">
              Vote with friends, finalize decisions instantly, and follow a clear step-by-step trip plan. The luxury of precision in every journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => navigate('/planner')}
                className="w-full sm:w-auto px-10 py-5 bg-accent-blue hover:bg-accent-blue/90 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-accent-blue/20"
              >
                Start Planning →
              </button>
              <button 
                onClick={() => navigate('/create-poll')}
                className="w-full sm:w-auto px-10 py-5 border border-white/20 hover:bg-white/5 rounded-2xl font-bold text-lg transition-all"
              >
                Create Poll
              </button>
              <button 
                onClick={() => navigate('/results')}
                className="flex items-center gap-3 px-6 py-5 text-white/70 hover:text-white transition-all font-semibold"
              >
                <span className="w-10 h-10 rounded-xl glass flex items-center justify-center text-xl">📍</span>
                View Map
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-[12px] border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200" alt="Mockup" className="w-full h-full object-cover" />
            </div>
            
            {/* Poll Overlay Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -right-10 top-1/2 glass p-6 rounded-3xl shadow-2xl z-20 max-w-[280px]"
            >
              <h4 className="font-bold mb-4">Group Vote: Weekend in Goa</h4>
              <div className="w-full h-2 bg-white/10 rounded-full mb-3">
                <div className="h-full w-[73%] bg-accent-blue rounded-full"></div>
              </div>
              <p className="text-sm text-white/70">🏖️ Beach Resort (3 votes)</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ActionCard icon="🗳️" title="Create Poll" desc="Start a new group decision" onClick={() => navigate('/create-poll')} />
          <ActionCard icon="🤖" title="AI Planner" desc="Generate instant itineraries" onClick={() => navigate('/planner')} />
          <ActionCard icon="🗺️" title="Open Map" desc="Explore your current route" onClick={() => navigate('/results')} />
          <ActionCard icon="✨" title="Explore" desc="Find handpicked locations" onClick={() => navigate('/destinations')} />
        </div>
      </section>

      {/* Why Voyage */}
      <section className="py-32 container mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-20">Why use Voyage?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <WhyItem icon="💬" title="No long discussions" desc="Stop the endless chat chains and make clear choices." />
          <WhyItem icon="⚡" title="Instant decisions" desc="Finalize your group's choices in a matter of seconds." />
          <WhyItem icon="🧭" title="Clear trip guidance" desc="Every stop and activity perfectly timed and routed." />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard 
            icon="🗳️" 
            title="Voting" 
            desc="Simple polls for destinations and activities that take the stress out of group planning." 
          />
          <FeatureCard 
            icon="🤖" 
            title="AI Planner" 
            desc="Smart generation of detailed trip logic tailored to your group's unique preferences." 
          />
          <FeatureCard 
            icon="🗺️" 
            title="Guided Map" 
            desc="Interactive routes and real-time navigation that keeps everyone on the same page." 
          />
          <FeatureCard 
            icon="✨" 
            title="Smart Flow" 
            desc="Seamless transition from a wild idea to a finalized, followable plan." 
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-20">How it works</h2>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32">
          <StepItem number="1" label="Create poll" icon="✍️" />
          <div className="hidden lg:block w-20 h-0.5 bg-white/10"></div>
          <StepItem number="2" label="Friends vote" icon="👥" />
          <div className="hidden lg:block w-20 h-0.5 bg-white/10"></div>
          <StepItem number="3" label="Decision finalized" icon="✅" />
          <div className="hidden lg:block w-20 h-0.5 bg-white/10"></div>
          <StepItem number="4" label="Follow your trip" icon="🗺️" />
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16">Explore Popular Places in India</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {destinations.map((d, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] group cursor-pointer"
              onClick={() => navigate('/planner', { state: { city: d.name } })}
            >
              <img src={d.img} alt={d.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                <h3 className="text-2xl font-bold mb-2">{d.name}</h3>
                <p className="text-white/60 text-sm font-medium">{d.tagline}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 container mx-auto px-6">
        <div className="glass rounded-[3rem] p-16 lg:p-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none"></div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 relative z-10">Ready to plan your next trip?</h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Join thousands of travelers who make decisions without the chaos. Voyage is the luxury of precision in every journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/planner')}
              className="w-full sm:w-auto px-12 py-5 bg-accent-blue hover:bg-accent-blue/90 rounded-2xl font-bold text-lg transition-all"
            >
              Start Planning
            </button>
            <button 
              onClick={() => navigate('/create-poll')}
              className="w-full sm:w-auto px-12 py-5 glass border-white/20 hover:bg-white/10 rounded-2xl font-bold text-lg transition-all"
            >
              Create Poll
            </button>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="pb-20 text-center text-white/30 text-sm uppercase tracking-widest font-bold">
        Voyage &copy; 2026
      </div>

      <MinimalReviewSection />
    </div>
  );
};

const ActionCard = ({ icon, title, desc, onClick }) => (
  <motion.div 
    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.08)' }}
    onClick={onClick}
    className="glass p-8 rounded-[2rem] cursor-pointer transition-all duration-300"
  >
    <div className="text-4xl mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm text-white/50">{desc}</p>
  </motion.div>
);

const WhyItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-4xl mb-8 border-accent-blue/20 border-2">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-white/60 text-lg leading-relaxed">{desc}</p>
  </div>
);

export default Home;
