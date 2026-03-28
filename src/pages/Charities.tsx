import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const charities = [
  { id: 1, name: "Cancer Research UK", category: "Health", description: "Funding groundbreaking research to beat cancer.", logo: "🎗️", raised: "£12,400" },
  { id: 2, name: "The R&A Foundation", category: "Golf", description: "Growing golf and making it accessible for everyone.", logo: "⛳", raised: "£8,900" },
  { id: 3, name: "MIND", category: "Mental Health", description: "Supporting mental health and wellbeing across the UK.", logo: "🧠", raised: "£7,200" },
  { id: 4, name: "Children in Need", category: "Children", description: "Helping disadvantaged children across the UK.", logo: "🧸", raised: "£6,800" },
  { id: 5, name: "British Heart Foundation", category: "Health", description: "Fighting heart and circulatory diseases.", logo: "❤️", raised: "£5,500" },
  { id: 6, name: "Golf Foundation", category: "Golf", description: "Introducing young people to golf and its values.", logo: "🏌️", raised: "£4,100" },
];

const Charities = () => (
  <div className="min-h-screen bg-secondary">
    <Navbar />
    <div className="container pt-24 pb-16">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-sm font-semibold tracking-wider uppercase text-gold">Our Partners</span>
        <h1 className="font-display text-4xl font-bold text-foreground mt-3">Charities We Support</h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          A portion of every subscription goes directly to these incredible organisations. You choose where your contribution goes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((c, i) => (
          <motion.div
            key={c.id}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{c.logo}</span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">{c.category}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{c.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-4 h-4 text-gold" />
                  <span className="font-bold text-gold">{c.raised}</span>
                  <span className="text-muted-foreground">raised</span>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Charities;
