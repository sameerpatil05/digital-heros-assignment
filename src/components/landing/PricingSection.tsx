import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Monthly",
    price: "£9.99",
    period: "/month",
    features: [
      "Enter monthly prize draws",
      "Track up to 5 Stableford scores",
      "Choose your charity",
      "Member dashboard",
      "Draw history & results",
    ],
    popular: false,
    cta: "Start Monthly",
  },
  {
    name: "Yearly",
    price: "£89.99",
    period: "/year",
    features: [
      "Everything in Monthly",
      "Save £30 per year",
      "Priority support",
      "Early access to features",
      "Exclusive yearly bonus draw",
    ],
    popular: true,
    cta: "Start Yearly — Save 25%",
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24">
    <div className="container">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-sm font-semibold tracking-wider uppercase text-gold">Pricing</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-foreground">
          Simple, Transparent Plans
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Every subscription fuels the prize pool and supports charity. No hidden fees.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`relative rounded-2xl p-8 ${
              plan.popular
                ? "bg-primary text-primary-foreground shadow-2xl scale-[1.02]"
                : "bg-card border border-border shadow-lg"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gold-gradient text-xs font-bold text-accent-foreground flex items-center gap-1">
                <Star className="w-3 h-3" /> Most Popular
              </div>
            )}

            <h3 className="font-display text-2xl font-bold mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className={`text-sm ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {plan.period}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-gold" : "text-success"}`} />
                  <span className={plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "gold" : "outline"}
              size="lg"
              className="w-full"
              asChild
            >
              <Link to="/signup">{plan.cta}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
