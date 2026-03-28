import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => (
  <section className="py-24">
    <div className="container">
      <motion.div
        className="hero-gradient rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(42_80%_55%/0.1),transparent_50%)]" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Tee Off for a <span className="text-gold-gradient">Good Cause?</span>
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-lg mx-auto mb-8">
            Join thousands of golfers who play, win, and give back every month.
          </p>
          <Button variant="gold" size="xl" asChild>
            <Link to="/signup">
              Join GolfGives Today <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
