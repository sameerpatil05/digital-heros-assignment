import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Trophy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-golf.jpg";

const stats = [
  { icon: Users, value: "2,400+", label: "Active Members" },
  { icon: Trophy, value: "£125K", label: "Prizes Awarded" },
  { icon: Heart, value: "£48K", label: "Raised for Charity" },
];

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img
        src={heroImage}
        alt="Golf course at golden hour"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-gradient opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
    </div>

    <div className="container relative z-10 pt-24 pb-16">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" /> Monthly Prize Draws Live
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Play Golf.{" "}
          <span className="text-gold-gradient">Win Big.</span>
          <br />
          Give Back.
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-primary-foreground/70 max-w-xl mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Join the UK's premier golf subscription where your scores enter monthly
          prize draws — and a portion of every subscription supports charities you choose.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Button variant="gold" size="xl" asChild>
            <Link to="/signup">
              Start Playing <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline-gold" size="xl" asChild>
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="text-xl font-bold text-primary-foreground">{s.value}</div>
                <div className="text-xs text-primary-foreground/50">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
