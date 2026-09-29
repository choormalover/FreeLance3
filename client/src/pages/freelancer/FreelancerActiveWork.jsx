import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import SubmitWork from "../../components/SubmitWork";
import API from "../../utils/api";

const FreelancerActiveWork = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchBids(); }, []);

  const fetchBids = async () => {
    try {
      const { data } = await API.get("/jobs/my/bids");
      setBids(data.filter(b => b.job?.status === 'in_progress' || b.job?.status === 'completed'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>Freelancer Portal</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>Active Work</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Submit work and track your payment progress</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {!loading && bids.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔨</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>No active work</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Win a bid to see your active work here</p>
            <button onClick={() => navigate("/freelancer/jobs")} className="rg-pill">
              Browse Jobs
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {bids.map(bid => (
            <div key={bid._id} className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg" style={{ color: "var(--ink)" }}>{bid.job?.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: bid.job?.status === 'completed' ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)" }}>
                      {bid.job?.status === 'completed' ? '🏆 Completed' : '⚡ In Progress'}
                    </span>
                  </div>
                  <button onClick={() => navigate(`/freelancer/job/${bid.job?._id}`)} className="rg-pill-outline text-xs px-4 py-2">
                    Full Details →
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "var(--muted)" }}>Payment Received</span>
                    <span className="font-bold" style={{ color: "var(--ink)" }}>{bid.job?.paymentProgress || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${bid.job?.paymentProgress || 0}%`, background: "rgba(255,255,255,0.85)" }}/>
                  </div>
                </div>

                {/* Milestones */}
                {bid.job?.milestones?.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {bid.job.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{m.title}</span>
                          <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>
                            {m.percentage}% = {(bid.job.budget * m.percentage / 100).toFixed(4)} MSTC
                          </span>
                        </div>
                        {m.released
                          ? <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Paid to you</span>
                          : <span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Pending</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 text-sm" style={{ color: "var(--muted)" }}>
                  <span>💰 Your bid: {bid.amount} MSTC</span>
                  <span>📅 {bid.deliveryDays} days delivery</span>
                </div>

                {/* Submit work toggle */}
                {bid.job?.status === 'in_progress' && (
                  <button
                    onClick={() => setExpandedJob(expandedJob === bid._id ? null : bid._id)}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                    {expandedJob === bid._id ? "▲ Hide Submit Form" : "📤 Submit Work"}
                  </button>
                )}
              </div>

              {/* Submit work panel */}
              {expandedJob === bid._id && bid.job?.status === 'in_progress' && (
                <div className="px-6 pb-6">
                  <SubmitWork
                    jobId={bid.job?._id}
                    milestones={bid.job?.milestones}
                    onSubmitted={() => { setExpandedJob(null); fetchBids(); }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerActiveWork;
