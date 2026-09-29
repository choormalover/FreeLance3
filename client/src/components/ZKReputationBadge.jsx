import { useState, useEffect } from "react";
import API from "../utils/api";

const ZKReputationBadge = ({ freelancerId, size = "normal" }) => {
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!freelancerId) { setLoading(false); setErrored(true); return; }
    setLoading(true);
    setErrored(false);
    API.get(`/zk/proof/${freelancerId}`)
      .then(({ data }) => setProof(data))
      .catch(err => { console.error("ZK proof error:", err); setErrored(true); })
      .finally(() => setLoading(false));
  }, [freelancerId]);

  if (loading) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ minHeight: "44px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
      <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" style={{ color: "var(--muted)" }}/>
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        Loading proof...
      </span>
    </div>
  );

  if (errored || !proof) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", minHeight: "44px" }}>
      <span style={{ fontSize: "14px", color: "var(--muted)" }}>◌</span>
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        Reputation proof unavailable
      </span>
    </div>
  );

  const isSmall = size === "small";
  const noData = proof.publicStatement === "No reputation data yet";

  return (
    <div className="relative">
      <button onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer w-full text-left"
        style={{
          background: proof.verified ? `${proof.verifiedColor || "#6ee7b7"}12`
            : noData ? "rgba(255,255,255,0.03)" : "rgba(245,158,11,0.06)",
          border: proof.verified ? `1px solid ${proof.verifiedColor || "#6ee7b7"}35`
            : noData ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.2)",
        }}>

        <span className="text-base flex-shrink-0">
          {proof.verified ? (proof.verifiedEmoji || "🛡️") : noData ? "◌" : "⚠️"}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold leading-tight"
              style={{ color: proof.verified ? (proof.verifiedColor || "#6ee7b7") : noData ? "var(--muted)" : "#fbbf24" }}>
              {proof.verified ? `ZK ${proof.level || "Verified"}` : noData ? "No Reputation" : "Unverified"}
            </p>
            {proof.verified && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: `${proof.verifiedColor || "#6ee7b7"}20`, color: proof.verifiedColor || "#6ee7b7", fontSize: "9px" }}>
                VERIFIED
              </span>
            )}
          </div>
          {!isSmall && (
            <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: "var(--muted)", fontSize: "10px" }}>
              {proof.publicStatement}
            </p>
          )}
        </div>
        <span style={{ color: "var(--muted)", fontSize: "10px" }}>ⓘ</span>
      </button>

      {showDetails && (
        <div className="absolute left-0 top-full mt-2 z-50 rounded-2xl p-5 shadow-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)", backdropFilter: "blur(20px)", minWidth: "300px" }}>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>ZK Proof Details</p>
            <button onClick={() => setShowDetails(false)} style={{ color: "var(--muted)" }}>✕</button>
          </div>

          {proof.verified && (
            <div className="rounded-xl p-3 mb-4 text-center"
              style={{ background: `${proof.verifiedColor || "#6ee7b7"}10`, border: `1px solid ${proof.verifiedColor || "#6ee7b7"}30` }}>
              <span className="text-2xl">{proof.verifiedEmoji || "🛡️"}</span>
              <p className="text-sm font-bold mt-1" style={{ color: proof.verifiedColor || "#6ee7b7" }}>
                {proof.level || "Verified"} Freelancer
              </p>
              <p className="text-xs mt-0.5" style={{ color: `${proof.verifiedColor || "#6ee7b7"}80` }}>
                {proof.publicStatement}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-xs" style={{ color: "var(--muted)" }}>Verification</span>
              <span className="text-xs font-semibold" style={{ color: proof.verified ? (proof.verifiedColor || "#6ee7b7") : "#fbbf24" }}>
                {proof.verified ? `✓ ${proof.level || "Verified"}` : "✗ Not Verified"}
              </span>
            </div>
            {proof.verifiedAt && (
              <div className="flex justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs" style={{ color: "var(--muted)" }}>Updated</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(proof.verifiedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {proof.proofHash && (
              <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Proof Hash</p>
                <p className="text-xs font-mono break-all" style={{ color: "var(--muted)", fontSize: "9px" }}>
                  {proof.proofHash}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
            🔒 Actual reputation score is never stored or revealed. Only this cryptographic proof is public.
          </p>
        </div>
      )}
    </div>
  );
};

export default ZKReputationBadge;
