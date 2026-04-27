import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { MarketingNav } from "../components/MarketingNav";
import { useAuth } from "../components/AuthProvider";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Free Explorer",
    price: "₹0",
    description: "Perfect for casual weekenders and curious minds.",
    features: [
      "2 AI-generated plans per month",
      "Single city itineraries",
      "Standard PDF export",
      "Community access",
    ],
    buttonText: "Current Plan",
    premium: false,
  },
  {
    name: "Pro Traveler",
    price: "₹199",
    period: "/month",
    description: "Ideal for frequent travelers seeking more power.",
    features: [
      "10 AI-generated plans per month",
      "Multi-city route optimization",
      "Real-time collaboration",
      "Priority email support",
      "Ad-free experience",
    ],
    buttonText: "Get Pro",
    premium: true,
  },
  {
    name: "Elite Nomad",
    price: "₹499",
    period: "/month",
    description: "Unlimited power for global explorers.",
    features: [
      "Unlimited AI plan generation",
      "Everything in Pro",
      "24/7 Premium concierge support",
      "Offline maps & Hidden gems",
      "Early access to new AI models",
      "Custom itinerary branding",
    ],
    buttonText: "Go Elite",
    premium: true,
    highlight: true,
  },
];

export default function Pricing() {
  const { user } = useAuth();

  const content = (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="size-4" />
          <span>Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
          Unlock the full potential of <span className="bg-warm-gradient bg-clip-text text-transparent">GoTripo</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
          Choose the plan that fits your travel style. From casual weekenders to global explorers, we've got you covered.
        </p>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 border ${
                tier.highlight
                  ? "bg-surface border-primary shadow-pop scale-105 z-10"
                  : "bg-surface border-border hover:border-primary/50"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-warm-gradient text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-cta uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-display font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-left">
                    <div className="mt-0.5 size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  tier.highlight
                    ? "bg-warm-gradient text-white shadow-cta hover:opacity-95"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-4xl mx-auto bg-primary/5 rounded-3xl p-8 md:p-12 text-left border border-primary/10">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Why Go Pro?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Zap className="text-yellow-500 size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Real-time Sync</h4>
                    <p className="text-sm text-muted-foreground">Collaborate with friends in real-time as you build your itinerary.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Shield className="text-green-500 size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Premium Support</h4>
                    <p className="text-sm text-muted-foreground">Get help from our expert travel planners whenever you need it.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Crown className="text-purple-500 size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Exclusive Deals</h4>
                    <p className="text-sm text-muted-foreground">Access pro-only discounts on flights, hotels and activities.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="font-bold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-1">Can I cancel anytime?</p>
                  <p className="text-muted-foreground">Yes, you can cancel your subscription at any time from your settings.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Is there a student discount?</p>
                  <p className="text-muted-foreground">Yes! Contact us with your ID for a 50% discount on the Pro plan.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">What's the refund policy?</p>
                  <p className="text-muted-foreground">We offer a full 7-day money-back guarantee if you're not satisfied.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
