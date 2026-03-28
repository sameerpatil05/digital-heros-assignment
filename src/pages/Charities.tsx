import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  total_received: number;
}

const Charities = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCharities();
    if (user) fetchUserCharity();
  }, [user]);

  const fetchCharities = async () => {
    const { data } = await supabase.from("charities").select("*").eq("is_active", true);
    if (data) setCharities(data);
    setLoading(false);
  };

  const fetchUserCharity = async () => {
    const { data } = await supabase.from("user_charities").select("charity_id").maybeSingle();
    if (data) setSelectedCharity(data.charity_id);
  };

  const selectCharity = async (charityId: string) => {
    if (!user) return toast.error("Please sign in to select a charity");
    const { error } = await supabase.from("user_charities").upsert({
      user_id: user.id,
      charity_id: charityId,
      contribution_percentage: 10,
    }, { onConflict: "user_id" });
    if (error) {
      toast.error("Failed to select charity");
    } else {
      setSelectedCharity(charityId);
      toast.success("Charity selected!");
    }
  };

  const categoryEmojis: Record<string, string> = {
    Health: "🎗️",
    Golf: "⛳",
    "Mental Health": "🧠",
    Children: "🧸",
  };

  return (
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

        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" /></div>
        ) : charities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No charities available yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((c, i) => (
              <motion.div
                key={c.id}
                className={`bg-card rounded-xl border shadow-sm overflow-hidden group hover:shadow-lg transition-all ${selectedCharity === c.id ? "border-gold" : "border-border"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{categoryEmojis[c.category || ""] || "💚"}</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">{c.category}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{c.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Heart className="w-4 h-4 text-gold" />
                      <span className="font-bold text-gold">${c.total_received.toLocaleString()}</span>
                      <span className="text-muted-foreground">raised</span>
                    </div>
                    {c.website_url && (
                      <a href={c.website_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                      </a>
                    )}
                  </div>
                  {user && (
                    <Button
                      variant={selectedCharity === c.id ? "gold" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => selectCharity(c.id)}
                    >
                      {selectedCharity === c.id ? <><CheckCircle className="w-4 h-4" /> Selected</> : "Select This Charity"}
                    </Button>
                  )}
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

export default Charities;
