import { AppShell } from "../components/AppShell";
import { MarketingNav } from "../components/MarketingNav";
import { useAuth } from "../components/AuthProvider";
import { Footer } from "../components/Footer";
import { Compass, Users, Heart, Sparkles } from "lucide-react";

export default function About() {
  const { user } = useAuth();

  const content = (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Compass className="size-4" />
          <span>Our Story</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">
          We're on a mission to make <br />
          <span className="bg-warm-gradient bg-clip-text text-transparent">travel effortless</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
          GoTripo was born out of a simple frustration: planning a trip should be as exciting as the trip itself, not a chore of spreadsheets and endless tabs.
        </p>
      </section>

      {/* Philosophy */}
      <section className="bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="size-6" />
              </div>
              <h3 className="text-2xl font-bold">Traveller First</h3>
              <p className="text-muted-foreground">Everything we build starts with the traveller's experience. If it doesn't make your trip better, we don't build it.</p>
            </div>
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-2xl font-bold">AI for Good</h3>
              <p className="text-muted-foreground">We use artificial intelligence to handle the heavy lifting of logistics, so you can focus on the magic of exploration.</p>
            </div>
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="size-6" />
              </div>
              <h3 className="text-2xl font-bold">Collaborative by Design</h3>
              <p className="text-muted-foreground">Travel is better together. Our platform is built from the ground up to make group planning seamless and fun.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-display font-bold mb-6">From a weekend hack to a global platform</h2>
            <div className="space-y-6 text-muted-foreground text-lg">
              <p>
                In 2024, a group of travel-obsessed engineers and designers sat down to solve their own problem: how to plan a multi-city trek through the Himalayas without losing their minds.
              </p>
              <p>
                What started as a simple script to optimize routes quickly grew into GoTripo. Today, we're proud to help thousands of explorers discover new horizons every day, from the narrow alleys of Tokyo to the sun-drenched beaches of Goa.
              </p>
            </div>
          </div>
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" 
              alt="Team collaborating" 
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
          </div>
        </div>
      </section>
      
      {!user && <Footer />}
    </div>
  );

  if (user) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <>
      <MarketingNav />
      {content}
    </>
  );
}
