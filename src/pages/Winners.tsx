import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Trophy, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

const winners = [
  { month: "March 2026", name: "James McLeod", score: 42, prize: "£3,800", charity: "Cancer Research UK", charityAmount: "£380", tier: "5-Match" },
  { month: "February 2026", name: "Sarah Parker", score: 39, prize: "£4,100", charity: "MIND", charityAmount: "£410", tier: "5-Match" },
  { month: "January 2026", name: "No Winner", score: null, prize: "Rollover", charity: "-", charityAmount: "-", tier: "-" },
  { month: "December 2025", name: "Tom Hughes", score: 44, prize: "£3,200", charity: "Golf Foundation", charityAmount: "£320", tier: "4-Match" },
  { month: "November 2025", name: "Emily Chen", score: 37, prize: "£2,900", charity: "Children in Need", charityAmount: "£290", tier: "5-Match" },
];

const tierIcon = (tier: string) => {
  if (tier === "5-Match") return <Trophy className="w-5 h-5 text-gold" />;
  if (tier === "4-Match") return <Medal className="w-5 h-5 text-gold-light" />;
  return <Award className="w-5 h-5 text-muted-foreground" />;
};

const Winners = () => (
  <div className="min-h-screen bg-secondary">
    <Navbar />
    <div className="container pt-24 pb-16">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-sm font-semibold tracking-wider uppercase text-gold">Hall of Fame</span>
        <h1 className="font-display text-4xl font-bold text-foreground mt-3">Past Winners</h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Celebrating our winners and the charities that benefit from every draw.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-4">
        {winners.map((w, i) => (
          <motion.div
            key={w.month}
            className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-3 min-w-[140px]">
              {tierIcon(w.tier)}
              <div>
                <div className="font-bold text-foreground">{w.month}</div>
                <div className="text-xs text-muted-foreground">{w.tier}</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">{w.name}</div>
              {w.score && <div className="text-xs text-muted-foreground">Score: {w.score}</div>}
            </div>
            <div className="text-right">
              <div className="font-bold text-gold text-lg">{w.prize}</div>
              {w.charityAmount !== "-" && (
                <div className="text-xs text-muted-foreground">{w.charityAmount} to {w.charity}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Winners;
