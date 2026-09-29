import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
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

const ClientDashboard = () => {
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    if (!account) navigate("/client/login");
    fetchData();
  }, [account]);

  const fetchData = async () => {
    try {
      const [jobsRes] = await Promise.all([API.get("/jobs/my/posted")]);
      const jobs = jobsRes.data;
      setRecentJobs(jobs.slice(0, 3));
      setStats({
        postedJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'in_progress').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        totalSpent: jobs.filter(j => j.status === 'completed').reduce((s, j) => s + j.budget, 0).toFixed(3),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>Client Dashboard</p>
            <h1 className="text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Welcome back, {user?.username || "Client"} 👋
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
          <StatCard icon="📝" label="Jobs Posted"  value={stats?.postedJobs ?? 0} />
          <StatCard icon="⚡" label="Active Jobs"  value={stats?.activeJobs ?? 0} />
          <StatCard icon="🏆" label="Completed"    value={stats?.completedJobs ?? 0} />
          <StatCard icon="💰" label="MSTC Spent"    value={`${stats?.totalSpent ?? 0}`} sub="on completed jobs" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>Recent Jobs</h2>
              <button onClick={() => navigate("/client/my-jobs")} className="text-xs transition-all"
                style={{ color: "var(--muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
                View all →
              </button>
            </div>
            {recentJobs.length === 0
              ? <p className="text-sm" style={{ color: "var(--muted)" }}>No jobs posted yet</p>
              : recentJobs.map(job => (
                <div key={job._id} onClick={() => navigate(`/client/job/${job._id}`)}
                  className="rounded-xl p-4 mb-3 cursor-pointer transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: "var(--ink)" }}>{job.title}</span>
                    <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>{job.budget} MSTC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: job.status === 'open' ? "rgba(16,185,129,0.12)" : job.status === 'in_progress' ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                               color: job.status === 'open' ? "#6ee7b7" : job.status === 'in_progress' ? "var(--ink)" : "var(--muted)" }}>
                      {job.status === 'completed' ? '🏆 Completed' : job.status}
                    </span>
                    {(job.status === 'in_progress' || job.status === 'completed') && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{job.paymentProgress || 0}% released</span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: "var(--ink)" }}>Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: "✦", label: "Post a New Job",        desc: "Find the perfect freelancer",             path: "/client/post-job" },
                { icon: "◈", label: "Manage Posted Jobs",     desc: "Edit, delete, view bids",                 path: "/client/my-jobs" },
                { icon: "◉", label: "Active Jobs",            desc: "Accept submissions & release payments",   path: "/client/active-jobs" },
                { icon: "⭐", label: "Top Freelancers",        desc: "Find best talent using skill graph",      path: "/client/top-freelancers" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: "rgba(255,255,255,0.08)", color: "var(--ink)" }}>{a.icon}</div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--ink)" }}>{a.label}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
