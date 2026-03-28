import { Trophy, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Golf<span className="text-gold">Gives</span>
            </span>
          </Link>
          <p className="text-sm text-primary-foreground/60 leading-relaxed">
            Play golf, win prizes, and make a difference for charities that matter.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold">Platform</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="/#how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</a></li>
            <li><a href="/#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a></li>
            <li><Link to="/charities" className="hover:text-primary-foreground transition-colors">Charities</Link></li>
            <li><Link to="/winners" className="hover:text-primary-foreground transition-colors">Past Winners</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold">Support</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold">Connect</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Twitter</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Facebook</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} GolfGives. All rights reserved.
        </p>
        <p className="text-xs text-primary-foreground/40 flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-gold" /> for charity
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
