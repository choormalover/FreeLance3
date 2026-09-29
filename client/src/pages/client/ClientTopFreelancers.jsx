import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientTopFreelancers = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("");
  const [searched, setSearched] = useState(false);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchRankings(); }, []);

  const fetchRankings = async (skills = "") => {
    setLoading(true);
    try {
      const query = skills ? `?skills=${encodeURIComponent(skills)}` : "";
      const { data } = await API.get(`/ranking/freelancers${query}`);
      setRankings(data.rankings || []);
      setSearched(!!skills);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRankings(skillFilter);
  };

  const getMedalStyle = (i) => {
    if (i === 0) return { bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.3)", color: "#FFD700", medal: "🥇" };
    if (i === 1) return { bg: "rgba(192,192,192,0.08)", border: "rgba(192,192,192,0.25)", color: "#C0C0C0", medal: "🥈" };
    if (i === 2) return { bg: "rgba(205,127,50,0.08)", border: "rgba(205,127,50,0.25)", color: "#CD7F32", medal: "🥉" };
    return { bg: "var(--card)", border: "var(--border)", color: "var(--ink)", medal: null };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
            Skill Graph · PageRank Algorithm · Novelty 3
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            Top Freelancers
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Ranked by verified skills, ZK reputation and activity using PageRank algorithm.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)", fontSize: "16px" }}>⌕</span>
            <input
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              placeholder="Filter by skills e.g. React, Solidity, Python"
              className="rg-input"
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <button type="submit" className="rg-pill">
            Find Best Match
          </button>
          {searched && (
            <button type="button" onClick={() => { setSkillFilter(""); fetchRankings(""); }} className="rg-pill-outline">
              Clear
            </button>
          )}
        </form>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm">Computing rankings...</span>
          </div>
        )}

        {!loading && rankings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>No freelancers found</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Try different skill filters or check back later</p>
          </div>
        )}

        {/* How scoring works */}
        {!loading && rankings.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { label: "Verified Skills", pts: "40 pts", color: "var(--ink)" },
              { label: "ZK Reputation", pts: "30 pts", color: "#6ee7b7" },
              { label: "Activity", pts: "20 pts", color: "var(--nav)" },
              { label: "PageRank", pts: "10 pts", color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.pts}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rankings */}
        <div className="flex flex-col gap-4">
          {rankings.map((item, i) => {
            const colors = getMedalStyle(i);
            return (
              <div key={item.freelancer._id} className="rounded-2xl p-6 transition-all duration-200"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>

                <div className="flex items-start gap-5">

                  {/* Rank badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: colors.medal ? `${colors.color}15` : "rgba(255,255,255,0.06)", border: colors.medal ? `1px solid ${colors.color}30` : "1px solid var(--border)" }}>
                    {colors.medal
                      ? <span className="text-2xl">{colors.medal}</span>
                      : <span className="text-lg font-bold" style={{ color: colors.color }}>#{i+1}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold" style={{ color: "var(--ink)" }}>
                        {item.freelancer.username || item.freelancer.walletAddress?.slice(0, 12) + "..."}
                      </h3>

                      {/* ZK badge — show even if not verified */}
                      {item.zkProof && item.zkProof.verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${item.zkProof.color}15`, color: item.zkProof.color, border: `1px solid ${item.zkProof.color}30` }}>
                          {item.zkProof.emoji} {item.zkProof.level}
                        </span>
                      )}
                      {(!item.zkProof || !item.zkProof.verified) && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          ◌ No ZK Reputation
                        </span>
                      )}
                    </div>

                    {/* Wallet */}
                    <p className="text-xs font-mono mb-3" style={{ color: "var(--muted)" }}>
                      {item.freelancer.walletAddress?.slice(0, 16)}...
                    </p>

                    {/* Verified skill badges */}
                    {item.verifiedSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.verifiedSkills.map(s => (
                          <span key={s.skill} className="text-xs px-2.5 py-1 rounded-lg"
                            style={{ background: `${s.badgeColor || "#6ee7b7"}12`, color: s.badgeColor || "#6ee7b7", border: `1px solid ${s.badgeColor || "#6ee7b7"}25` }}>
                            {s.badgeEmoji || "✓"} {s.skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                        No verified skills yet
                      </p>
                    )}

                    {/* Matched skills highlight */}
                    {item.matchedSkills?.length > 0 && (
                      <p className="text-xs mb-2" style={{ color: "#6ee7b7" }}>
                        ✓ Matches {item.matchedSkills.length} of your required skills: {item.matchedSkills.join(", ")}
                      </p>
                    )}

                    <div className="flex gap-4 text-xs flex-wrap" style={{ color: "var(--muted)" }}>
                      <span>✅ {item.jobsCompleted} jobs completed</span>
                      <span>📋 {item.bidCount} bids placed</span>
                      <span>📊 PageRank: {item.pageRank}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.color }}>
                      {item.scores.totalScore}
                    </div>
                    <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>Total Score</div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "var(--muted)" }}>Skills</span>
                        <span style={{ color: "var(--ink)" }}>+{item.scores.matchScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "var(--muted)" }}>ZK Rep</span>
                        <span style={{ color: "var(--ink)" }}>+{item.scores.zkScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "var(--muted)" }}>Activity</span>
                        <span style={{ color: "var(--ink)" }}>+{item.scores.activityScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "var(--muted)" }}>PageRank</span>
                        <span style={{ color: "var(--ink)" }}>+{item.scores.prScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(item.scores.totalScore, 100)}%`, background: colors.color }}/>
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

export default ClientTopFreelancers;
