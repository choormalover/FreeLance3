import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import SubmitWork from "../../components/SubmitWork";
import API from "../../utils/api";

const FreelancerJobDetail = () => {
  const { id } = useParams();
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount:"", proposal:"", deliveryDays:"" });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await API.get(`/jobs/${id}`);
      setJob(data.job); setBids(data.bids);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleBid = async (e) => {
    e.preventDefault(); setBidLoading(true); setBidError("");
    try {
      await API.post(`/jobs/${id}/bid`, { ...bidForm, amount:parseFloat(bidForm.amount), deliveryDays:parseInt(bidForm.deliveryDays) });
      setBidSuccess(true); fetchJob();
    } catch (err) { setBidError(err.response?.data?.error||"Failed to place bid"); }
    finally { setBidLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div style={{ color: "var(--muted)" }}>Loading...</div>
    </div>
  );

  const isHiredFreelancer = job?.hiredFreelancer?._id?.toString()===user?.id?.toString() || job?.hiredFreelancer?.toString()===user?.id?.toString();
  const myBid = bids.find(b=>b.freelancer?._id?.toString()===user?.id?.toString());
  const progressPct = job?.paymentProgress||0;

  const statusBadge = (status) => {
    if (status === 'open') return { background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.25)" };
    return { background: "rgba(255,255,255,0.06)", color: "var(--ink)", border: "1px solid var(--border)" };
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <button onClick={()=>navigate("/freelancer/jobs")}
        className="mb-6 flex items-center gap-2 transition-colors"
        style={{ color: "var(--muted)" }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
        ← Back to Jobs
      </button>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Job Info */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-4">
              <span className="text-xs px-3 py-1 rounded-full" style={statusBadge(job.status)}>
                {job.status==='completed'?'🏆 Completed':job.status}
              </span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--ink)" }}>{job.title}</h1>
            <p className="leading-relaxed mb-6" style={{ color: "var(--muted)" }}>{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill=>(
                <span key={skill} className="text-sm px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)" }}>{skill}</span>
              ))}
            </div>
          </div>

          {/* Payment Progress */}
          {job.status!=='open' && job.milestones?.length>0 && (
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>📊 Payment Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "var(--muted)" }}>Your earnings released</span>
                  <span className="font-bold" style={{ color: "var(--ink)" }}>{progressPct}%</span>
                </div>
                <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-4 rounded-full transition-all duration-700" style={{ width:`${progressPct}%`, background: "rgba(255,255,255,0.85)" }}/>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {job.milestones.map((m,i)=>(
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{m.title}</span>
                      <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>({m.percentage}% = {(job.budget*m.percentage/100).toFixed(4)} MSTC)</span>
                    </div>
                    {m.released?<span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Paid to you</span>:<span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Pending</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Work */}
          {isHiredFreelancer && job.status==='in_progress' && (
            <SubmitWork jobId={id} milestones={job.milestones} onSubmitted={fetchJob} />
          )}

          {/* Bids list */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>Bids ({bids.length})</h2>
            {bids.length===0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>No bids yet. Be the first!</p> : (
              <div className="flex flex-col gap-3">
                {bids.map(bid=>{
                  const isMine = bid.freelancer?._id?.toString()===user?.id?.toString();
                  return (
                    <div key={bid._id} className="rounded-xl p-4"
                      style={{ background: isMine ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", border: isMine ? "1px solid rgba(255,255,255,0.3)" : "1px solid var(--border)" }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold" style={{ color: "var(--ink)" }}>{bid.amount} MSTC</span>
                        <span className="text-sm" style={{ color: "var(--muted)" }}>{bid.deliveryDays} days</span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>{bid.proposal}</p>
                      {isMine && <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>← Your bid</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>{job.budget} MSTC</div>
            <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>Budget</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}><span style={{ color: "var(--nav)" }}>Deadline: </span>{new Date(job.deadline).toLocaleDateString()}</div>
            <div className="text-sm mt-2" style={{ color: "var(--muted)" }}><span style={{ color: "var(--nav)" }}>Posted by: </span>{job.client?.walletAddress?.slice(0,10)}...</div>
          </div>

          {/* Bid form */}
          {!isHiredFreelancer && job.status==='open' && !myBid && (
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h3 className="font-semibold mb-4" style={{ color: "var(--ink)" }}>Place a Bid</h3>
              {bidSuccess ? (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>✅ Bid placed!</div>
              ) : (
                <form onSubmit={handleBid} className="flex flex-col gap-3">
                  <input placeholder="Your bid (MSTC)" type="number" step="0.001" value={bidForm.amount} onChange={e=>setBidForm({...bidForm,amount:e.target.value})} required
                    className="rg-input text-sm"/>
                  <input placeholder="Delivery days" type="number" value={bidForm.deliveryDays} onChange={e=>setBidForm({...bidForm,deliveryDays:e.target.value})} required
                    className="rg-input text-sm"/>
                  <textarea placeholder="Write your proposal..." value={bidForm.proposal} onChange={e=>setBidForm({...bidForm,proposal:e.target.value})} required rows={4}
                    className="rg-input text-sm resize-none"/>
                  {bidError && <p className="text-xs" style={{ color: "#ffb3b3" }}>{bidError}</p>}
                  <button type="submit" disabled={bidLoading} className="rg-pill py-2.5 text-sm">{bidLoading?"Submitting...":"Submit Bid"}</button>
                </form>
              )}
            </div>
          )}

          {myBid && (
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>Your Bid</h3>
              <div className="font-bold text-xl mb-1" style={{ color: "var(--ink)" }}>{myBid.amount} MSTC</div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>{myBid.deliveryDays} days delivery</div>
              <span className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block"
                style={{
                  background: myBid.status==="accepted"?"rgba(16,185,129,0.12)":myBid.status==="rejected"?"rgba(255,80,80,0.12)":"rgba(251,191,36,0.12)",
                  color: myBid.status==="accepted"?"#6ee7b7":myBid.status==="rejected"?"#ffb3b3":"#fbbf24",
                }}>{myBid.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerJobDetail;
