import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Trophy, Heart, Settings, BarChart3, Shield,
  ChevronRight, Search, CheckCircle, XCircle, Clock,
  Menu, Loader2, Play, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "draws", label: "Draws", icon: Trophy },
  { id: "charities", label: "Charities", icon: Heart },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Draw states
  const [drawMode, setDrawMode] = useState<"random" | "algorithm">("random");
  const [drawLoading, setDrawLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // New charity form
  const [newCharity, setNewCharity] = useState({ name: "", description: "", category: "", website_url: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [profilesRes, subsRes, verificationsRes, charitiesRes, settingsRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("subscriptions").select("*"),
      supabase.from("winner_verifications").select("*, draw_results(matched_count, prize_amount)"),
      supabase.from("charities").select("*"),
      supabase.from("app_settings").select("*"),
    ]);

    if (profilesRes.data) setUsers(profilesRes.data);
    if (subsRes.data) setSubscriptions(subsRes.data);
    if (verificationsRes.data) setVerifications(verificationsRes.data);
    if (charitiesRes.data) setCharities(charitiesRes.data);
    if (settingsRes.data) {
      const map: Record<string, any> = {};
      for (const s of settingsRes.data) map[s.key] = s.value;
      setSettings(map);
      if (map.draw_config?.mode) setDrawMode(map.draw_config.mode);
    }
    setLoading(false);
  };

  const handleRunDraw = async (simulate = false) => {
    setDrawLoading(true);
    const { data, error } = await supabase.functions.invoke("execute-draw", {
      body: { mode: drawMode, simulate },
    });
    setDrawLoading(false);
    if (error) {
      toast.error("Draw failed: " + (error.message || "Unknown error"));
    } else if (simulate) {
      setSimulationResult(data);
      toast.success("Simulation complete!");
    } else {
      setSimulationResult(null);
      toast.success("Draw executed successfully!");
      loadData();
    }
  };

  const handleVerification = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("winner_verifications")
      .update({ status, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Update failed");
    } else {
      toast.success(`Verification ${status}`);
      loadData();
    }
  };

  const handleAddCharity = async () => {
    if (!newCharity.name) return toast.error("Name is required");
    const { error } = await supabase.from("charities").insert(newCharity);
    if (error) {
      toast.error("Failed to add charity");
    } else {
      toast.success("Charity added!");
      setNewCharity({ name: "", description: "", category: "", website_url: "" });
      loadData();
    }
  };

  const handleUpdateSettings = async (key: string, value: any) => {
    const { error } = await supabase.from("app_settings").update({ value }).eq("key", key);
    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success("Settings updated!");
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const activeSubCount = subscriptions.filter(s => s.status === "active").length;
  const totalRevenue = subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + (s.plan === "yearly" ? 100 : 10), 0);

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 hero-gradient text-primary-foreground transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Golf<span className="text-gold">Gives</span></span>
          </Link>
          <p className="text-xs text-primary-foreground/40 mt-2">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id ? "bg-gold/20 text-gold font-medium" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
          ) : (
            <>
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "Total Users", value: users.length.toLocaleString() },
                      { label: "Active Subs", value: activeSubCount.toLocaleString() },
                      { label: "Monthly Revenue", value: `$${totalRevenue.toLocaleString()}` },
                      { label: "Jackpot Rollover", value: `$${settings.jackpot?.current_rollover || 0}` },
                    ].map((s) => (
                      <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
                        <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Pending Actions</h3>
                    <div className="space-y-3">
                      {verifications.filter(v => v.status === "pending").length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gold" />
                            <span className="text-sm text-foreground">{verifications.filter(v => v.status === "pending").length} winner verification(s) pending</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("verification")}>
                            Review <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-4">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">User ID</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Subscription</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {users.filter(u => (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((u) => {
                            const sub = subscriptions.find(s => s.user_id === u.user_id);
                            return (
                              <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="p-4 font-medium text-foreground">{u.display_name || "—"}</td>
                                <td className="p-4 text-muted-foreground text-xs font-mono">{u.user_id?.slice(0, 8)}...</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub?.status === "active" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                                    {sub?.status || "None"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "draws" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Execute Draw</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Mode</label>
                        <select
                          value={drawMode}
                          onChange={(e) => setDrawMode(e.target.value as "random" | "algorithm")}
                          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        >
                          <option value="random">Random</option>
                          <option value="algorithm">Algorithm (Score-weighted)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => handleRunDraw(true)} disabled={drawLoading}>
                        {drawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Eye className="w-4 h-4" /> Simulate</>}
                      </Button>
                      <Button variant="gold" onClick={() => handleRunDraw(false)} disabled={drawLoading}>
                        {drawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Run Draw</>}
                      </Button>
                    </div>
                  </div>

                  {simulationResult && (
                    <div className="bg-card rounded-xl border border-gold/30 p-6 shadow-sm">
                      <h3 className="font-display text-lg font-bold text-foreground mb-4">Simulation Result</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Winning Numbers</div>
                          <div className="flex gap-1 mt-1">
                            {simulationResult.winning_numbers?.map((n: number) => (
                              <span key={n} className="w-8 h-8 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">{n}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Prize Pool</div>
                          <div className="text-lg font-bold text-gold">${simulationResult.prize_pool?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                          <div className="text-lg font-bold text-foreground">{simulationResult.total_participants}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Winners</div>
                          <div className="text-lg font-bold text-foreground">{simulationResult.results?.length || 0}</div>
                        </div>
                      </div>
                      {simulationResult.results?.length > 0 && (
                        <div className="space-y-2">
                          {simulationResult.results.map((r: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm p-2 rounded bg-secondary">
                              <span className="text-foreground">{r.user_id.slice(0, 8)}... — {r.matched_count}-match</span>
                              <span className="font-bold text-gold">${r.prize_amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {simulationResult.new_rollover > 0 && (
                        <div className="mt-3 text-sm text-muted-foreground">Jackpot rollover: ${simulationResult.new_rollover.toLocaleString()}</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "charities" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Add Charity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <Input placeholder="Name" value={newCharity.name} onChange={(e) => setNewCharity(p => ({ ...p, name: e.target.value }))} />
                      <Input placeholder="Category" value={newCharity.category} onChange={(e) => setNewCharity(p => ({ ...p, category: e.target.value }))} />
                      <Input placeholder="Website URL" value={newCharity.website_url} onChange={(e) => setNewCharity(p => ({ ...p, website_url: e.target.value }))} />
                      <Input placeholder="Description" value={newCharity.description} onChange={(e) => setNewCharity(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <Button variant="gold" onClick={handleAddCharity}>Add Charity</Button>
                  </div>
                  <div className="space-y-3">
                    {charities.map(c => (
                      <div key={c.id} className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.category} — ${Number(c.total_received).toLocaleString()} raised</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "verification" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {verifications.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">No verifications yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {verifications.map((v) => (
                        <div key={v.id} className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">User: {v.user_id?.slice(0, 8)}...</div>
                            <div className="text-sm text-muted-foreground">
                              Prize: ${Number(v.draw_results?.prize_amount || 0).toLocaleString()} — {v.draw_results?.matched_count || 0}-match
                            </div>
                          </div>
                          {v.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button variant="gold" size="sm" onClick={() => handleVerification(v.id, "approved")}>
                                <CheckCircle className="w-4 h-4" /> Approve
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleVerification(v.id, "rejected")}>
                                <XCircle className="w-4 h-4" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {v.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="space-y-6 max-w-xl">
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <h3 className="font-display text-lg font-bold text-foreground mb-4">Pricing</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Monthly Price (cents)</label>
                          <Input
                            type="number"
                            value={settings.pricing?.monthly || 1000}
                            onChange={(e) => setSettings(p => ({ ...p, pricing: { ...p.pricing, monthly: parseInt(e.target.value) } }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Yearly Price (cents)</label>
                          <Input
                            type="number"
                            value={settings.pricing?.yearly || 10000}
                            onChange={(e) => setSettings(p => ({ ...p, pricing: { ...p.pricing, yearly: parseInt(e.target.value) } }))}
                          />
                        </div>
                        <Button variant="gold" onClick={() => handleUpdateSettings("pricing", settings.pricing)}>Save Pricing</Button>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <h3 className="font-display text-lg font-bold text-foreground mb-4">Draw Configuration</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Default Mode</label>
                          <select
                            value={settings.draw_config?.mode || "random"}
                            onChange={(e) => setSettings(p => ({ ...p, draw_config: { ...p.draw_config, mode: e.target.value } }))}
                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                          >
                            <option value="random">Random</option>
                            <option value="algorithm">Algorithm</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">5-match %</label>
                            <Input type="number" value={settings.draw_config?.five_match_pct || 40}
                              onChange={(e) => setSettings(p => ({ ...p, draw_config: { ...p.draw_config, five_match_pct: parseInt(e.target.value) } }))} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">4-match %</label>
                            <Input type="number" value={settings.draw_config?.four_match_pct || 35}
                              onChange={(e) => setSettings(p => ({ ...p, draw_config: { ...p.draw_config, four_match_pct: parseInt(e.target.value) } }))} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">3-match %</label>
                            <Input type="number" value={settings.draw_config?.three_match_pct || 25}
                              onChange={(e) => setSettings(p => ({ ...p, draw_config: { ...p.draw_config, three_match_pct: parseInt(e.target.value) } }))} />
                          </div>
                        </div>
                        <Button variant="gold" onClick={() => handleUpdateSettings("draw_config", settings.draw_config)}>Save Draw Config</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
