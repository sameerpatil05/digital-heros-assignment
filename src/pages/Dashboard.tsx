import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy, BarChart3, Heart, CreditCard, Plus, Trash2,
  CheckCircle, XCircle, Clock, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const mockScores = [
  { id: 1, score: 38, date: "2026-03-15", course: "St Andrews" },
  { id: 2, score: 34, date: "2026-03-01", course: "Royal Troon" },
  { id: 3, score: 41, date: "2026-02-18", course: "Carnoustie" },
  { id: 4, score: 29, date: "2026-02-05", course: "Gleneagles" },
  { id: 5, score: 36, date: "2026-01-20", course: "Turnberry" },
];

const Dashboard = () => {
  const [scores, setScores] = useState(mockScores);
  const [newScore, setNewScore] = useState("");
  const [newCourse, setNewCourse] = useState("");

  const addScore = () => {
    const score = parseInt(newScore);
    if (score < 1 || score > 45 || !newCourse.trim()) return;
    const updated = [
      { id: Date.now(), score, date: new Date().toISOString().split("T")[0], course: newCourse },
      ...scores,
    ].slice(0, 5);
    setScores(updated);
    setNewScore("");
    setNewCourse("");
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, Player</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: CreditCard, label: "Subscription", value: "Active", sub: "Monthly — £9.99/mo", color: "text-success" },
            { icon: BarChart3, label: "Best Score", value: "41", sub: "Carnoustie, Feb 18", color: "text-gold" },
            { icon: Trophy, label: "Draws Entered", value: "3", sub: "Next draw: Apr 1", color: "text-gold" },
            { icon: Heart, label: "Charity", value: "Cancer Research", sub: "10% contribution", color: "text-gold" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
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

              {/* Add score */}
              <div className="p-6 border-b border-border bg-secondary/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Score (1-45)"
                    type="number"
                    min={1}
                    max={45}
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    className="sm:w-32"
                  />
                  <Input
                    placeholder="Course name"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="gold" onClick={addScore}>
                    <Plus className="w-4 h-4" /> Add Score
                  </Button>
                </div>
              </div>

              {/* Score list */}
              <div className="divide-y divide-border">
                {scores.map((s, i) => (
                  <motion.div
                    key={s.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">{s.score}</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{s.course}</div>
                        <div className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                    {i === 0 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold/10 text-gold">Latest</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Draw status */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">April Draw</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-bold text-gold">£4,250</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-bold text-foreground">428</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Status</span>
                  <span className="flex items-center gap-1 font-medium text-success">
                    <CheckCircle className="w-3.5 h-3.5" /> Entered
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Draw Date</span>
                  <span className="font-medium text-foreground">1 Apr 2026</span>
                </div>
              </div>
            </div>

            {/* Recent draws */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Results</h3>
              <div className="space-y-3">
                {[
                  { month: "March 2026", winner: "J. McLeod", amount: "£3,800" },
                  { month: "February 2026", winner: "S. Parker", amount: "£4,100" },
                  { month: "January 2026", winner: "Rollover", amount: "£3,500" },
                ].map((d) => (
                  <div key={d.month} className="flex items-center justify-between text-sm group cursor-pointer">
                    <div>
                      <div className="font-medium text-foreground">{d.month}</div>
                      <div className="text-xs text-muted-foreground">{d.winner}</div>
                    </div>
                    <div className="flex items-center gap-1 text-gold font-bold">
                      {d.amount}
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
