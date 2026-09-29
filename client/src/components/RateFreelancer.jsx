import { useState } from "react";
import API from "../utils/api";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const RateFreelancer = ({ jobId, freelancerId, onRated }) => {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) return alert("Please select a rating");
    setLoading(true);
    try {
      await API.post("/zk/rate", { jobId, freelancerId, score, review });
      setDone(true);
      if (onRated) onRated();
    } catch (err) {
      alert(err.response?.data?.error || "Rating failed");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="rounded-2xl p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="text-4xl mb-3">🛡️</div>
      <h3 className="font-bold mb-1" style={{ color: "var(--ink)" }}>
        Rating Submitted
      </h3>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        The freelancer's ZK reputation proof has been updated. Your exact rating is never revealed.
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
          ⭐
        </div>
        <div>
          <h3 className="font-bold" style={{ color: "var(--ink)" }}>
            Rate This Freelancer
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Your rating is private — only a ZK proof is published
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-2">
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          Your Rating
        </p>
        <div className="flex items-center gap-3">
          {[1,2,3,4,5].map(star => (
            <button key={star}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-all duration-150"
              style={{ transform: (hover || score) >= star ? "scale(1.3)" : "scale(1)", fontSize: "28px" }}>
              <span style={{ color: (hover || score) >= star ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>★</span>
            </button>
          ))}
          {(hover || score) > 0 && (
            <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>
              {LABELS[hover || score]}
            </span>
          )}
        </div>
      </div>

      {/* Score bar visual */}
      {score > 0 && (
        <div className="mb-5 mt-3">
          <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${score * 20}%`, background: "#fbbf24" }} />
          </div>
        </div>
      )}

      {/* Review */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          Review (Optional)
        </p>
        <textarea value={review} onChange={e => setReview(e.target.value)}
          placeholder="Describe your experience working with this freelancer..."
          rows={3}
          className="rg-input text-sm resize-none" style={{ lineHeight: "1.6" }}/>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--nav)", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>🔒</span>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Your exact rating is <strong style={{ color: "var(--ink)" }}>never shown</strong> to other clients.
          Only a cryptographic ZK proof verifying whether the freelancer meets a quality threshold is published publicly.
        </p>
      </div>

      <button onClick={handleSubmit} disabled={loading || score === 0} className="rg-pill w-full py-3.5" style={{ opacity: score === 0 ? 0.35 : 1 }}>
        {loading ? (
          <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Updating ZK Proof...</span></>
        ) : (
          <><span>🛡️</span><span>Submit & Update ZK Proof</span></>
        )}
      </button>
    </div>
  );
};

export default RateFreelancer;
