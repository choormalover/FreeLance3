import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const StatCard = ({ icon, label, value, sub }) => (
  <div className="rounded-2xl p-5 transition-all duration-300"
    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
    <div className="text-2xl mb-3">{icon}</div>
    <div className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>{value}</div>
    <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
    {sub && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{sub}</div>}
  </div>
);

const FreelancerDashboard = () => {
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [zkProof, setZkProof] = useState(null);

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchData();
  }, [account]);

  const fetchData = async () => {
    try {
      const [bidsRes, skillsRes, zkRes] = await Promise.all([
        API.get("/jobs/my/bids"),
        API.get("/skills/my"),
        API.get("/zk/my-proof"),
      ]);
      const bids = bidsRes.data;
      const wonJobs = bids.filter(b => b.job?.status === "completed" || b.job?.status === "in_progress");
      const ethEarned = bids
        .filter(b => b.job?.status === "completed")
        .reduce((s, b) => s + (b.job?.budget * (b.job?.paymentProgress || 0) / 100), 0);
      setStats({
        totalBids: bids.length,
        jobsWon: wonJobs.length,
        activeJobs: bids.filter(b => b.job?.status === "in_progress").length,
        ethEarned: ethEarned.toFixed(4),
        winRate: bids.length > 0 ? Math.round((wonJobs.length / bids.length) * 100) : 0,
      });
      setRecentBids(bids.slice(0, 3));
      setVerifiedSkills(skillsRes.data.filter(s => s.status === "passed").slice(0, 5));
      setZkProof(zkRes.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>Freelancer Dashboard</p>
            <h1 className="text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Welcome back, {user?.username || "Freelancer"} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : user?.email}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full text-xs flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--ink)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            MST Testnet
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🎯" label="Bids Placed"  value={stats?.totalBids ?? 0} />
          <StatCard icon="🏆" label="Jobs Won"     value={stats?.jobsWon ?? 0} sub={`${stats?.winRate ?? 0}% win rate`} />
          <StatCard icon="⚡" label="In Progress"  value={stats?.activeJobs ?? 0} />
          <StatCard icon="💰" label="MSTC Earned"   value={`${stats?.ethEarned ?? 0}`} sub="from completed jobs" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ZK + Skills summary */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--ink)" }}>Your Web3 Identity</h2>

            {/* ZK level */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <span className="text-2xl">{zkProof?.proof?.verifiedEmoji || "◌"}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: zkProof?.proof?.verified ? zkProof.proof.verifiedColor : "var(--muted)" }}>
                  {zkProof?.proof?.verified ? `${zkProof.proof.verifiedLevel} Reputation` : "No ZK Reputation Yet"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>ZK Proof · Private score</p>
              </div>
              <button onClick={() => navigate("/freelancer/reputation")}
                className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "var(--ink)" }}>
                View →
              </button>
            </div>

            {/* Verified skills */}
            {verifiedSkills.length > 0 ? (
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                  Verified Skills ({verifiedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map(s => (
                    <span key={s.skill} className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: `${s.badgeColor || "#6ee7b7"}12`, color: s.badgeColor || "#6ee7b7", border: `1px solid ${s.badgeColor || "#6ee7b7"}25` }}>
                      {s.badgeEmoji} {s.skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>No verified skills yet</p>
                <button onClick={() => navigate("/freelancer/skill-verify")} className="rg-pill-outline text-xs px-3 py-1.5">
                  Get Verified →
                </button>
              </div>
            )}
          </div>

          {/* Recent bids + quick actions */}
          <div className="flex flex-col gap-4">
            {/* Recent bids */}
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>Recent Bids</h2>
                <button onClick={() => navigate("/freelancer/bids")} className="text-xs" style={{ color: "var(--muted)" }}>
                  View all →
                </button>
              </div>
              {recentBids.length === 0
                ? <p className="text-xs" style={{ color: "var(--muted)" }}>No bids placed yet</p>
                : recentBids.map(bid => (
                  <div key={bid._id} onClick={() => navigate(`/freelancer/job/${bid.job?._id}`)}
                    className="rounded-xl p-3 mb-2 cursor-pointer transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium truncate" style={{ color: "var(--ink)", maxWidth: "180px" }}>{bid.job?.title}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>{bid.amount} MSTC</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: bid.status === "accepted" ? "rgba(16,185,129,0.1)" : bid.status === "rejected" ? "rgba(255,80,80,0.1)" : "rgba(255,255,255,0.06)", color: bid.status === "accepted" ? "#6ee7b7" : bid.status === "rejected" ? "#ff9999" : "var(--muted)" }}>
                      {bid.status}
                    </span>
                  </div>
                ))
              }
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "💼", label: "Browse Jobs",     desc: "Find new work",              path: "/freelancer/jobs" },
                  { icon: "🎯", label: "Recommended",     desc: "Matched to your skills",     path: "/freelancer/recommended" },
                  { icon: "🤖", label: "Verify Skills",   desc: "Earn badges",                path: "/freelancer/skill-verify" },
                  { icon: "🛡️", label: "My Reputation",  desc: "View ZK proof",              path: "/freelancer/reputation" },
                ].map(a => (
                  <button key={a.label} onClick={() => navigate(a.path)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <span className="text-lg w-7 text-center">{a.icon}</span>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "var(--ink)" }}>{a.label}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
