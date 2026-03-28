import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy, BarChart3, Heart, CreditCard, Plus,
  CheckCircle, ChevronRight, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_PLANS } from "@/lib/stripe";
import { toast } from "sonner";

interface Score {
  id: string;
  score: number;
  played_at: string;
}

const Dashboard = () => {
  const { user, subscription, refreshSubscription } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState("");
  const [loadingScores, setLoadingScores] = useState(true);
  const [addingScore, setAddingScore] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [charities, setCharities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchScores();
    fetchCharities();
    fetchUserCharity();
    // Check for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Subscription activated! Welcome aboard.");
      refreshSubscription();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from("scores")
      .select("id, score, played_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error && data) setScores(data);
    setLoadingScores(false);
  };

  const fetchCharities = async () => {
    const { data } = await supabase.from("charities").select("id, name").eq("is_active", true);
    if (data) setCharities(data);
  };

  const fetchUserCharity = async () => {
    const { data } = await supabase.from("user_charities").select("charity_id").maybeSingle();
    if (data) setSelectedCharity(data.charity_id);
  };

  const addScore = async () => {
    const score = parseInt(newScore);
    if (isNaN(score) || score < 1 || score > 45) return toast.error("Score must be between 1 and 45");
    setAddingScore(true);
    const { error } = await supabase.from("scores").insert({
      user_id: user!.id,
      score,
      played_at: new Date().toISOString().split("T")[0],
    });
    if (error) {
      toast.error("Failed to add score");
    } else {
      toast.success("Score added!");
      setNewScore("");
      fetchScores();
    }
    setAddingScore(false);
  };

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    const priceId = STRIPE_PLANS[plan].priceId;
    if (!priceId) return toast.error("This plan is not yet available");
    setCheckoutLoading(true);
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    setCheckoutLoading(false);
    if (error || !data?.url) {
      toast.error("Failed to start checkout");
    } else {
      window.open(data.url, "_blank");
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    const { data, error } = await supabase.functions.invoke("customer-portal");
    setPortalLoading(false);
    if (error || !data?.url) {
      toast.error("Failed to open subscription management");
    } else {
      window.open(data.url, "_blank");
    }
  };

  const selectCharity = async (charityId: string) => {
    const { error } = await supabase.from("user_charities").upsert({
      user_id: user!.id,
      charity_id: charityId,
      contribution_percentage: 10,
    }, { onConflict: "user_id" });
    if (error) {
      toast.error("Failed to update charity");
    } else {
      setSelectedCharity(charityId);
      toast.success("Charity updated!");
    }
  };

  const bestScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
  const charityName = charities.find(c => c.id === selectedCharity)?.name || "Not selected";

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user?.user_metadata?.display_name || user?.email}</p>
        </motion.div>

        {/* Subscription CTA if not subscribed */}
        {!subscription.subscribed && (
          <motion.div
            className="bg-primary rounded-2xl p-6 mb-8 text-primary-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-display text-2xl font-bold mb-2">Subscribe to Enter Draws</h2>
            <p className="text-primary-foreground/70 mb-4">Get access to monthly prize draws and support charity.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" onClick={() => handleCheckout("monthly")} disabled={checkoutLoading}>
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Monthly — ${STRIPE_PLANS.monthly.price}/mo`}
              </Button>
              {STRIPE_PLANS.yearly.priceId && (
                <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => handleCheckout("yearly")} disabled={checkoutLoading}>
                  Yearly — {STRIPE_PLANS.yearly.price}/yr (Save 17%)
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: CreditCard, label: "Subscription", value: subscription.subscribed ? "Active" : "Inactive", sub: subscription.subscribed ? `Ends ${new Date(subscription.subscriptionEnd!).toLocaleDateString()}` : "No active plan", color: subscription.subscribed ? "text-success" : "text-destructive" },
            { icon: BarChart3, label: "Best Score", value: bestScore ? String(bestScore) : "—", sub: `${scores.length}/5 scores entered`, color: "text-gold" },
            { icon: Trophy, label: "Scores", value: String(scores.length), sub: "Out of 5 max", color: "text-gold" },
            { icon: Heart, label: "Charity", value: charityName, sub: "10% contribution", color: "text-gold" },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scores */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="font-display text-xl font-bold text-foreground">Your Scores</h2>
                <p className="text-sm text-muted-foreground">Stableford format (1–45) — latest 5 kept</p>
              </div>

              {subscription.subscribed && (
                <div className="p-6 border-b border-border bg-secondary/50">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Score (1-45)" type="number" min={1} max={45} value={newScore} onChange={(e) => setNewScore(e.target.value)} className="sm:w-32" />
                    <Button variant="gold" onClick={addScore} disabled={addingScore}>
                      {addingScore ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Score</>}
                    </Button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-border">
                {loadingScores ? (
                  <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></div>
                ) : scores.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No scores yet. Add your first score above!</div>
                ) : (
                  scores.map((s, i) => (
                    <motion.div key={s.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-foreground">{s.score}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Score: {s.score}</div>
                          <div className="text-xs text-muted-foreground">{new Date(s.played_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                      </div>
                      {i === 0 && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold/10 text-gold">Latest</span>}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription management */}
            {subscription.subscribed && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Subscription</h3>
                <p className="text-sm text-muted-foreground mb-4">Active until {new Date(subscription.subscriptionEnd!).toLocaleDateString()}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage Subscription"}
                </Button>
              </div>
            )}

            {/* Charity selection */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Your Charity</h3>
              {charities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No charities available yet.</p>
              ) : (
                <div className="space-y-2">
                  {charities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectCharity(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCharity === c.id ? "bg-gold/10 text-gold font-medium border border-gold/20" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      <div className="flex items-center justify-between">
                        {c.name}
                        {selectedCharity === c.id && <CheckCircle className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
