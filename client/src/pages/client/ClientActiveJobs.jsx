import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import EscrowABI from "../../utils/EscrowABI";
import SubmissionsList from "../../components/SubmissionsList";

const ClientActiveJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs/my/posted");
      setJobs(data.filter(j => j.status === 'in_progress' || j.status === 'completed'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAcceptWork = async (submissionId, milestoneIdx, job) => {
    if (!confirm("Accept this work and release milestone payment?")) return;
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const milestone = job.milestones[milestoneIdx];
      if (!milestone) { alert("Milestone not found"); return; }
      const status = await contract.getStatus();
      if (status[5]) { alert("Escrow was refunded."); return; }
      if (!status[3]) { alert("Please deposit funds first."); return; }
      const tx = await contract.releaseMilestone(milestone.percentage);
      await tx.wait();
      await API.post(`/jobs/${job._id}/milestone`, { milestoneIndex: milestoneIdx });
      fetchJobs();
      alert(`✅ Milestone ${milestoneIdx + 1} released! (${milestone.percentage}%)`);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>Client Portal</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>Active Jobs</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Track progress and release milestone payments</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>No active jobs</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Hire a freelancer to see jobs here</p>
            <button onClick={() => navigate("/client/my-jobs")} className="rg-pill">
              View Posted Jobs
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {jobs.map(job => (
            <div key={job._id} className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

              {/* Job header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg" style={{ color: "var(--ink)" }}>{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: job.status === 'completed' ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)" }}>
                      {job.status === 'completed' ? '🏆 Completed' : '⚡ In Progress'}
                    </span>
                  </div>
                  <button onClick={() => navigate(`/client/job/${job._id}`)} className="rg-pill-outline text-xs px-4 py-2">
                    Full Details →
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "var(--muted)" }}>Payment Released</span>
                    <span className="font-bold" style={{ color: "var(--ink)" }}>{job.paymentProgress || 0}% of {job.budget} MSTC</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${job.paymentProgress || 0}%`, background: "rgba(255,255,255,0.85)" }}/>
                  </div>
                </div>

                {/* Milestones */}
                {job.milestones?.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {job.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{m.title}</span>
                          <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>
                            {m.percentage}% = {(job.budget * m.percentage / 100).toFixed(4)} MSTC
                          </span>
                        </div>
                        {m.released
                          ? <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Released</span>
                          : <span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Awaiting submission</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggle submissions */}
                <button
                  onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                  {expandedJob === job._id ? "▲ Hide Submissions" : "▼ View & Accept Submissions"}
                </button>
              </div>

              {/* Submissions panel */}
              {expandedJob === job._id && (
                <div className="px-6 pb-6">
                  <SubmissionsList
                    jobId={job._id}
                    escrowAddress={job.escrowAddress}
                    milestones={job.milestones}
                    onApprove={(subId, milestoneIdx) => handleAcceptWork(subId, milestoneIdx, job)}
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

export default ClientActiveJobs;
