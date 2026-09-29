import { useEffect, useState } from "react";
import { ethers } from "ethers";
import API from "../utils/api";
import EscrowABI from "../utils/EscrowABI";

const SubmissionsList = ({ jobId, escrowAddress, onApprove, milestones }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escrowBalance, setEscrowBalance] = useState("0");

  useEffect(() => {
    fetchSubmissions();
    if (escrowAddress) checkEscrowBalance();
  }, [jobId]);

  const fetchSubmissions = async () => {
    try {
      const { data } = await API.get(`/submissions/${jobId}`);
      setSubmissions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const checkEscrowBalance = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(escrowAddress, EscrowABI, provider);
      const balance = await contract.getBalance();
      setEscrowBalance(ethers.formatEther(balance));
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await API.get(`/submissions/download/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error("Download failed:", err); }
  };

  // Loading state — visible skeleton, not blank
  if (loading) return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)", minHeight: "100px" }}>
      <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
        <span className="text-sm">Loading submissions...</span>
      </div>
    </div>
  );

  // No submissions — informative placeholder, not blank
  if (submissions.length === 0) return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
        <span className="text-xl">📭</span>
        <span className="text-sm">No work submissions yet</span>
      </div>
    </div>
  );

  const grouped = {};
  submissions.forEach(sub => {
    const key = sub.milestoneIndex !== null && sub.milestoneIndex !== undefined ? sub.milestoneIndex : "general";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  });

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: "var(--ink)" }}>📬 Work Submissions</h3>
        {escrowAddress && (
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.03)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            Escrow balance: {escrowBalance} MSTC
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([milestoneKey, subs]) => {
          const milestoneIdx = milestoneKey !== "general" ? parseInt(milestoneKey) : null;
          const milestone = milestoneIdx !== null && milestones ? milestones[milestoneIdx] : null;
          const isMilestoneReleased = milestone?.released;

          return (
            <div key={milestoneKey}>
              {milestone && (
                <div className="flex items-center justify-between px-4 py-2 rounded-xl mb-3"
                  style={{
                    background: isMilestoneReleased ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isMilestoneReleased ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                  }}>
                  <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                    Milestone {milestoneIdx + 1}: {milestone.title}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: isMilestoneReleased ? "#6ee7b7" : "#fbbf24" }}>
                    {isMilestoneReleased ? "✅ Released" : `⏳ ${milestone.percentage}% pending`}
                  </span>
                </div>
              )}

              {subs.map(sub => (
                <div key={sub._id} className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: sub.status === "approved" ? "rgba(16,185,129,0.12)" : sub.status === "rejected" ? "rgba(255,80,80,0.1)" : "rgba(251,191,36,0.1)",
                        color: sub.status === "approved" ? "#6ee7b7" : sub.status === "rejected" ? "#ff9999" : "#fbbf24",
                        border: "1px solid currentColor",
                      }}>
                      {sub.status}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {sub.message && <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{sub.message}</p>}

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => handleDownload(sub._id, sub.fileName)} className="rg-pill-outline text-sm px-4 py-2">
                      📥 Download {sub.fileName}
                    </button>

                    {sub.status === "submitted" && !isMilestoneReleased && onApprove && (
                      <button onClick={() => onApprove(sub._id, milestoneIdx)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}>
                        ✅ Accept & Release {milestone ? `${milestone.percentage}%` : ""}
                      </button>
                    )}

                    {isMilestoneReleased && sub.status === "submitted" && (
                      <span className="text-xs font-medium" style={{ color: "#6ee7b7" }}>✅ Payment released</span>
                    )}
                  </div>

                  <p className="text-xs mt-2 font-mono" style={{ color: "var(--muted)" }}>
                    By: {sub.freelancer?.walletAddress?.slice(0, 10)}...
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionsList;
