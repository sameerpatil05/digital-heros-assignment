import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Trophy, Heart, Settings, BarChart3, Shield,
  ChevronRight, Search, CheckCircle, XCircle, Clock,
  Menu, X
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "draws", label: "Draws", icon: Trophy },
  { id: "charities", label: "Charities", icon: Heart },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

const mockUsers = [
  { id: 1, name: "James McLeod", email: "james@example.com", plan: "Monthly", status: "Active", scores: 5 },
  { id: 2, name: "Sarah Parker", email: "sarah@example.com", plan: "Yearly", status: "Active", scores: 4 },
  { id: 3, name: "Tom Hughes", email: "tom@example.com", plan: "Monthly", status: "Cancelled", scores: 3 },
  { id: 4, name: "Emily Chen", email: "emily@example.com", plan: "Yearly", status: "Active", scores: 5 },
];

const pendingVerifications = [
  { id: 1, user: "James McLeod", month: "March 2026", prize: "£3,800", status: "pending" },
  { id: 2, user: "Sarah Parker", month: "February 2026", prize: "£4,100", status: "approved" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 hero-gradient text-primary-foreground transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Golf<span className="text-gold">Gives</span>
            </span>
          </Link>
          <p className="text-xs text-primary-foreground/40 mt-2">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-gold/20 text-gold font-medium"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
        </header>

        <div className="p-6">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: "2,412", change: "+12%" },
                  { label: "Active Subs", value: "1,847", change: "+8%" },
                  { label: "Monthly Revenue", value: "£18,450", change: "+15%" },
                  { label: "Charity Donated", value: "£48,200", change: "+22%" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-success font-medium mt-1">{s.change} this month</div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gold" />
                      <span className="text-sm text-foreground">1 winner verification pending</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("verification")}>
                      Review <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-gold" />
                      <span className="text-sm text-foreground">April draw ready to execute</span>
                    </div>
                    <Button variant="gold" size="sm">
                      Run Draw
                    </Button>
                  </div>
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
                        <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Scores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                        <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-4 font-medium text-foreground">{u.name}</td>
                          <td className="p-4 text-muted-foreground">{u.email}</td>
                          <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">{u.plan}</span></td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{u.scores}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "verification" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                {pendingVerifications.map((v) => (
                  <div key={v.id} className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{v.user}</div>
                      <div className="text-sm text-muted-foreground">{v.month} — {v.prize}</div>
                    </div>
                    {v.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button variant="gold" size="sm"><CheckCircle className="w-4 h-4" /> Approve</Button>
                        <Button variant="outline" size="sm"><XCircle className="w-4 h-4" /> Reject</Button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Approved</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === "draws" || activeTab === "charities" || activeTab === "settings") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm">This section will be available once the backend is connected.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
