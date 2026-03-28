import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface DrawWithResults {
  id: string;
  draw_date: string;
  winning_numbers: number[];
  prize_pool: number;
  jackpot_rollover: number;
  mode: string;
  winners: { display_name: string; matched_count: number; prize_amount: number }[];
}

const Winners = () => {
  const [draws, setDraws] = useState<DrawWithResults[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    const { data: drawsData } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "completed")
      .order("draw_date", { ascending: false })
      .limit(12);

    if (drawsData) {
      const withResults: DrawWithResults[] = [];
      for (const draw of drawsData) {
        const { data: results } = await supabase
          .from("draw_results")
          .select("matched_count, prize_amount, user_id")
          .eq("draw_id", draw.id)
          .gt("prize_amount", 0);

        const winners = [];
        if (results) {
          for (const r of results) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", r.user_id)
              .single();
            winners.push({
              display_name: profile?.display_name || "Anonymous",
              matched_count: r.matched_count,
              prize_amount: r.prize_amount,
            });
          }
        }

        withResults.push({
          id: draw.id,
          draw_date: draw.draw_date,
          winning_numbers: draw.winning_numbers || [],
          prize_pool: Number(draw.prize_pool),
          jackpot_rollover: Number(draw.jackpot_rollover),
          mode: draw.mode,
          winners,
        });
      }
      setDraws(withResults);
    }
    setLoading(false);
  };

  const tierIcon = (count: number) => {
    if (count === 5) return <Trophy className="w-5 h-5 text-gold" />;
    if (count === 4) return <Medal className="w-5 h-5 text-gold-light" />;
    return <Award className="w-5 h-5 text-muted-foreground" />;
  };

  return (
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

        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" /></div>
        ) : draws.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No draws yet. The first draw is coming soon!</div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {draws.map((draw, i) => (
              <motion.div
                key={draw.id}
                className="bg-card rounded-xl border border-border shadow-sm p-5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Trophy className="w-5 h-5 text-gold" />
                    <div>
                      <div className="font-bold text-foreground">
                        {new Date(draw.draw_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{draw.mode} mode</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1.5 mb-2">
                      {draw.winning_numbers.map(n => (
                        <span key={n} className="w-8 h-8 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">{n}</span>
                      ))}
                    </div>
                    {draw.winners.length > 0 ? (
                      <div className="space-y-1">
                        {draw.winners.map((w, wi) => (
                          <div key={wi} className="flex items-center gap-2 text-sm">
                            {tierIcon(w.matched_count)}
                            <span className="text-foreground font-medium">{w.display_name}</span>
                            <span className="text-muted-foreground">({w.matched_count}-match)</span>
                            <span className="text-gold font-bold">${w.prize_amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No winners — ${draw.jackpot_rollover.toLocaleString()} rolled over</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gold text-lg">${draw.prize_pool.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Prize Pool</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Winners;
