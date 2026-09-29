import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerRecommendations = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await API.get("/recommendations/jobs");
      setJobs(data.jobs || []);
      setVerifiedCount(data.verifiedCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return { bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.3)", text: "#FFD700" };
    if (score >= 60) return { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)", text: "#6ee7b7" };
    if (score >= 40) return { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.18)", text: "var(--nav)" };
    return { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", text: "var(--muted)" };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
            AI Powered · Skill-Based Matching
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            Recommended Jobs
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Jobs ranked by how well they match your {verifiedCount} verified skill{verifiedCount !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* No skills banner */}
        {verifiedCount === 0 && !loading && (
          <div className="rounded-2xl p-6 mb-8 flex items-center gap-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="text-4xl">🎓</div>
            <div className="flex-1">
              <h3 className="font-bold mb-1" style={{ color: "var(--ink)" }}>
                Verify skills for better matches
              </h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Your verified skill badges are used to rank jobs by compatibility. The more you verify, the better the matches.
              </p>
            </div>
            <button onClick={() => navigate("/freelancer/skill-verify")} className="rg-pill text-sm px-5 py-2.5 flex-shrink-0">
              Verify Skills →
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm">Finding best matches...</span>
          </div>
        )}

        {/* Job list */}
        <div className="flex flex-col gap-4">
          {jobs.map((job, i) => {
            const colors = getMatchColor(job.matchScore);
            return (
              <div key={job._id}
                onClick={() => navigate(`/freelancer/job/${job._id}`)}
                className="rounded-2xl p-6 cursor-pointer transition-all duration-200 relative overflow-hidden"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>

                {/* Rank badge */}
                {i < 3 && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: i === 0 ? "rgba(255,215,0,0.2)" : i === 1 ? "rgba(192,192,192,0.2)" : "rgba(205,127,50,0.2)", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Match score circle */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: `${colors.text}12`, border: `1px solid ${colors.text}30` }}>
                    <span className="text-lg font-bold" style={{ color: colors.text, lineHeight: 1 }}>
                      {job.matchScore}
                    </span>
                    <span className="text-xs" style={{ color: `${colors.text}70`, fontSize: "9px" }}>match</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-base" style={{ color: "var(--ink)" }}>
                        {job.title}
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${colors.text}15`, color: colors.text, border: `1px solid ${colors.text}30`, flexShrink: 0 }}>
                        {job.recommendation}
                      </span>
                    </div>

                    <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--muted)" }}>
                      {job.description}
                    </p>

                    {/* Skill match breakdown */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills?.map(skill => {
                        const isMatched = job.matchedSkills?.includes(skill.toLowerCase());
                        const isGold = job.goldMatches?.includes(skill.toLowerCase());
                        return (
                          <span key={skill} className="text-xs px-2.5 py-1 rounded-lg"
                            style={{
                              background: isGold ? "rgba(255,215,0,0.12)"
                                : isMatched ? "rgba(16,185,129,0.1)"
                                : "rgba(255,255,255,0.04)",
                              color: isGold ? "#FFD700"
                                : isMatched ? "#6ee7b7"
                                : "var(--muted)",
                              border: isGold ? "1px solid rgba(255,215,0,0.25)"
                                : isMatched ? "1px solid rgba(16,185,129,0.2)"
                                : "1px solid var(--border)",
                            }}>
                            {isGold ? "🥇 " : isMatched ? "✓ " : ""}{skill}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 text-sm" style={{ color: "var(--muted)" }}>
                      <span>💰 {job.budget} MSTC</span>
                      <span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
                      {job.matchedSkills?.length > 0 && (
                        <span style={{ color: "#6ee7b7" }}>
                          ✓ {job.matchedSkills.length}/{job.skills?.length} skills match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default FreelancerRecommendations;
