import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchBids(); }, []);

  const fetchBids = async () => {
    try { const { data } = await API.get("/jobs/my/bids"); setBids(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const statusStyle = (status) => {
    if (status === "accepted") return { background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" };
    if (status === "rejected") return { background: "rgba(255,80,80,0.12)", color: "#ffb3b3", border: "1px solid rgba(255,120,120,0.3)" };
    return { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>My Bids</h1>
        <p className="mb-8" style={{ color: "var(--muted)" }}>Track your proposals and payment progress</p>
        {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
        {!loading && bids.length===0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>No bids yet</h3>
            <button onClick={()=>navigate("/freelancer/jobs")} className="rg-pill">Browse Jobs</button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {bids.map(bid=>(
            <div key={bid._id} className="rounded-2xl p-6 cursor-pointer transition-all"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              onClick={()=>navigate(`/freelancer/job/${bid.job?._id}`)}>
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-lg" style={{ color: "var(--ink)" }}>{bid.job?.title}</h3>
                <span className="text-xs px-3 py-1 rounded-full" style={statusStyle(bid.status)}>{bid.status}</span>
              </div>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--muted)" }}>{bid.proposal}</p>
              {(bid.job?.status==='in_progress'||bid.job?.status==='completed') && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                    <span>Payment Progress</span><span>{bid.job?.paymentProgress||0}% received</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width:`${bid.job?.paymentProgress||0}%`, background: "rgba(255,255,255,0.85)" }}/>
                  </div>
                </div>
              )}
              <div className="flex gap-6 text-sm">
                <div><span style={{ color: "var(--muted)" }}>Your Bid: </span><span className="font-bold" style={{ color: "var(--ink)" }}>{bid.amount} MSTC</span></div>
                <div><span style={{ color: "var(--muted)" }}>Delivery: </span><span style={{ color: "var(--ink)" }}>{bid.deliveryDays} days</span></div>
                {bid.job?.status==='completed' && <span className="font-semibold" style={{ color: "#6ee7b7" }}>🏆 Completed</span>}
              </div>
              {bid.status==='rejected' && (
                <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,120,120,0.3)" }}>
                  <p className="text-xs" style={{ color: "#ffb3b3" }}>Bid rejected. Click to view job and submit a new bid.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerBids;
