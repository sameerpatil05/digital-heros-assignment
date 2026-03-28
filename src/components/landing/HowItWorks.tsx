import { motion } from "framer-motion";
import { UserPlus, BarChart3, Shuffle, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Subscribe",
    description: "Choose a monthly or yearly plan and join the GolfGives community.",
  },
  {
    icon: BarChart3,
    title: "Submit Scores",
    description: "Enter your latest Stableford scores — we keep your best 5 on record.",
  },
  {
    icon: Shuffle,
    title: "Monthly Draw",
    description: "Your scores are entered into our monthly prize draw automatically.",
  },
  {
    icon: Gift,
    title: "Win & Give",
    description: "Winners take home prizes while a portion goes to their chosen charity.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-secondary">
    <div className="container">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-sm font-semibold tracking-wider uppercase text-gold">How It Works</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-foreground">
          Four Simple Steps
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="relative text-center group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <step.icon className="w-7 h-7 text-accent-foreground" />
            </div>
            <div className="absolute top-8 left-1/2 w-full h-px bg-gold/20 hidden lg:block" style={{ display: i === steps.length - 1 ? 'none' : undefined }} />
            <span className="text-xs font-bold text-gold mb-2 block">STEP {i + 1}</span>
            <h3 className="font-display text-xl font-bold mb-2 text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
