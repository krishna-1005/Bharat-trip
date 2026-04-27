import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <Logo className="scale-90 origin-left" />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              GoTripo is your AI-powered travel companion, making trip planning effortless, collaborative, and tailored to your unique style.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Instagram className="size-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Twitter className="size-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Facebook className="size-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Youtube className="size-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/explore" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Explore Destinations</Link></li>
              <li><Link to="/trip-type" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">AI Trip Planner</Link></li>
              <li><Link to="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Pricing & Pro</Link></li>
              <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Key Features</a></li>
              <li><Link to="/collaborate" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Group Planning</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/settings" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Account Settings</Link></li>
              <li><a href="mailto:support@gotripo.tech" className="text-slate-600 dark:text-slate-400 hover:text-primary transition flex items-center gap-2">
                <Mail className="size-4" /> gotripo081@gmail.com
              </a></li>
              <li><a href="tel:+1234567890" className="text-slate-600 dark:text-slate-400 hover:text-primary transition flex items-center gap-2">
                <Phone className="size-4" /> +91 6361890349
              </a></li>
              <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <MapPin className="size-4 shrink-0 mt-0.5" /> 
                <span>123 Tech Park, Indiranagar,<br />Bengaluru, KA 560038</span>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#voices" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">User Stories</a></li>
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Our Story</Link></li>
              <li><Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Terms of Service</Link></li>
              <li><Link to="/careers" className="text-slate-600 dark:text-slate-400 hover:text-primary transition">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} GoTripo. All rights reserved. Made for explorers everywhere.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition">Terms</Link>
            <Link to="/cookies" className="hover:text-primary transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
