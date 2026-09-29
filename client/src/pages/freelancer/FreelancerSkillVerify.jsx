import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const SKILL_DOMAINS = [
  { domain: "Frontend", icon: "🎨", skills: ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Redux", "WebGL"] },
  { domain: "Backend", icon: "⚙️", skills: ["Node.js", "Python", "Java", "Go", "Rust", "PHP", "Ruby on Rails", "Django", "FastAPI", "Spring Boot"] },
  { domain: "Database", icon: "🗄️", skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Cassandra", "Firebase", "Elasticsearch", "GraphQL", "Prisma", "SQLite"] },
  { domain: "Blockchain & Web3", icon: "⛓️", skills: ["Solidity", "Ethereum", "Web3.js", "Ethers.js", "Hardhat", "Smart Contracts", "DeFi", "NFT Development", "IPFS", "Polygon"] },
  { domain: "AI & Machine Learning", icon: "🤖", skills: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Scikit-learn", "Keras", "LLM Fine-tuning", "Reinforcement Learning"] },
  { domain: "Data Science", icon: "📊", skills: ["Data Analysis", "Pandas", "NumPy", "Data Visualization", "Matplotlib", "Power BI", "Tableau", "Statistics", "R Programming", "Apache Spark"] },
  { domain: "DevOps & Cloud", icon: "☁️", skills: ["Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "CI/CD", "Terraform", "Linux", "Nginx", "Jenkins"] },
  { domain: "Cybersecurity", icon: "🔐", skills: ["Ethical Hacking", "Penetration Testing", "Network Security", "Cryptography", "OWASP", "Reverse Engineering", "Malware Analysis", "Burp Suite", "Wireshark", "Zero Trust Security"] },
  { domain: "Mobile", icon: "📱", skills: ["React Native", "Flutter", "iOS Swift", "Android Kotlin", "Expo", "Firebase Mobile", "Mobile UI/UX", "App Store Deployment"] },
  { domain: "IoT & Embedded", icon: "🔌", skills: ["Arduino", "Raspberry Pi", "MQTT", "Embedded C", "ESP32", "Sensor Integration", "Edge Computing", "LoRaWAN", "Zigbee", "Industrial IoT"] },
  { domain: "Systems & Low Level", icon: "💻", skills: ["C Programming", "C++", "Operating Systems", "Computer Networks", "Compiler Design", "Assembly", "Memory Management", "Multithreading", "CUDA", "WebAssembly"] },
  { domain: "Design & UI/UX", icon: "✏️", skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems", "Accessibility", "Motion Design", "Adobe XD", "Wireframing"] },
];

const FreelancerSkillVerify = () => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDomain, setExpandedDomain] = useState(null);

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchMySkills();
  }, []);

  const fetchMySkills = async () => {
    try {
      const { data } = await API.get("/skills/my");
      setMySkills(data);
    } catch (err) { console.error(err); }
  };

  const handleRequestChallenge = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    try {
      const { data } = await API.post("/skills/challenge", { skill: selectedSkill });
      setChallenge(data.challenge);
      setStep("challenge");
      setAnswer("");
      setResult(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate challenge");
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return alert("Please write your answer");
    setLoading(true);
    try {
      const { data } = await API.post("/skills/submit", { skill: selectedSkill, answer });
      setResult(data);
      setStep("result");
      fetchMySkills();
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    } finally { setLoading(false); }
  };

  const verifiedSkills = mySkills.filter(s => s.status === "passed");

  const filteredDomains = SKILL_DOMAINS.map(d => ({
    ...d,
    skills: d.skills.filter(s =>
      s.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(d => d.skills.length > 0);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
            AI Powered · {SKILL_DOMAINS.reduce((a, d) => a + d.skills.length, 0)}+ Skills
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            Skill Verification
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Earn Bronze, Silver, or Gold badges based on your performance score.
          </p>
        </div>

        {/* Verified badges */}
        {verifiedSkills.length > 0 && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--card)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: "rgba(110,231,183,0.7)" }}>
              Your Verified Skills ({verifiedSkills.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {verifiedSkills.map(s => (
                <div key={s.skill} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: `${s.badgeColor || "#6ee7b7"}12`, border: `1px solid ${s.badgeColor || "#6ee7b7"}30` }}>
                  <span className="text-base">{s.badgeEmoji || "✓"}</span>
                  <span className="text-sm font-medium" style={{ color: s.badgeColor || "#6ee7b7" }}>
                    {s.skill}
                  </span>
                  {s.badgeLevel && (
                    <span className="text-xs" style={{ color: `${s.badgeColor}80` }}>
                      {s.badgeLevel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }}>

          {/* Left panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: "16px" }}>⌕</span>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search any skill or domain..."
                className="rg-input"
                style={{ paddingLeft: "44px" }}
              />
            </div>

            {/* Domain list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredDomains.map(domain => {
                const isOpen = expandedDomain === domain.domain || !!searchTerm;
                return (
                  <div key={domain.domain} style={{ borderRadius: "16px", overflow: "hidden", background: "var(--card)", border: "1px solid var(--border)" }}>
                    <button
                      onClick={() => setExpandedDomain(isOpen && !searchTerm ? null : domain.domain)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: "var(--ink)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "20px" }}>{domain.icon}</span>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>{domain.domain}</span>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", color: "var(--muted)" }}>
                          {domain.skills.length} skills
                        </span>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: "11px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: "0 20px 20px 20px" }}>
                        <div style={{ height: "1px", background: "var(--border)", marginBottom: "16px" }} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                          {domain.skills.map(skill => {
                            const verified = verifiedSkills.find(s => s.skill === skill);
                            const isSelected = selectedSkill === skill;
                            return (
                              <button
                                key={skill}
                                disabled={!!verified}
                                onClick={() => { setSelectedSkill(skill); setStep("select"); setChallenge(null); setResult(null); }}
                                style={{
                                  padding: "9px 18px", borderRadius: "12px", fontSize: "12px",
                                  fontWeight: isSelected ? "600" : "400",
                                  cursor: verified ? "not-allowed" : "pointer", transition: "all 0.2s ease",
                                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                                  background: verified ? `${verified.badgeColor || "#6ee7b7"}12`
                                    : isSelected ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.03)",
                                  border: verified ? `1.5px solid ${verified.badgeColor || "#6ee7b7"}35`
                                    : isSelected ? "1.5px solid rgba(255,255,255,0.4)"
                                    : "1.5px solid var(--border)",
                                  color: verified ? (verified.badgeColor || "#6ee7b7")
                                    : isSelected ? "var(--ink)" : "var(--muted)",
                                }}>
                                {verified ? `${verified.badgeEmoji || "✓"} ` : ""}{skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Start button */}
            {selectedSkill && step === "select" && (
              <button
                onClick={handleRequestChallenge}
                disabled={loading}
                className="rg-pill"
                style={{ width: "100%", padding: "16px", fontSize: "15px", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--pill-ink)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  <span>Generating challenge...</span></>
                ) : (
                  <><span style={{ fontSize: "18px" }}>🤖</span><span>Start {selectedSkill} Challenge</span></>
                )}
              </button>
            )}
          </div>

          {/* Right panel */}
          <div style={{ borderRadius: "20px", padding: "28px", background: "var(--card)", border: "1px solid var(--border)", minHeight: "500px" }}>

            {/* Empty state */}
            {step === "select" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🤖</div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "var(--ink)" }}>AI Challenge Engine</h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.7", maxWidth: "260px" }}>
                  Select a skill to get an AI-generated challenge. Earn Bronze, Silver or Gold based on your score.
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "24px" }}>
                  {["🥉 45+ = Bronze", "🥈 65+ = Silver", "🥇 85+ = Gold"].map(tag => (
                    <span key={tag} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge */}
            {step === "challenge" && challenge && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }}>🤖</div>
                  <div>
                    <h3 style={{ fontWeight: "700", color: "var(--ink)", margin: 0 }}>{selectedSkill} Challenge</h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, marginTop: "2px" }}>
                      AI-generated · 3 attempts · Score 45+ to pass
                    </p>
                  </div>
                </div>

                <div style={{ borderRadius: "12px", padding: "20px", marginBottom: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Challenge</p>
                  <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--ink)", margin: 0 }}>{challenge.question}</p>
                  {challenge.hint && (
                    <p style={{ fontSize: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", color: "var(--nav)", fontStyle: "italic" }}>
                      💡 {challenge.hint}
                    </p>
                  )}
                  {challenge.exampleInput && (
                    <p style={{ fontSize: "11px", marginTop: "8px", color: "var(--muted)" }}>
                      Example: {challenge.exampleInput} → {challenge.exampleOutput}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Your Answer</p>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Write your solution here..."
                    rows={9}
                    className="rg-input"
                    style={{ fontFamily: "monospace", lineHeight: "1.7", resize: "none" }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !answer.trim()}
                  className="rg-pill"
                  style={{ width: "100%", padding: "14px", opacity: !answer.trim() ? 0.45 : 1 }}>
                  {loading
                    ? <><span style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid var(--pill-ink)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", display: "inline-block" }} /><span>AI Evaluating...</span></>
                    : <><span>📤</span><span>Submit for AI Evaluation</span></>
                  }
                </button>
              </div>
            )}

            {/* Result */}
            {step === "result" && result && (
              <div>
                {/* Banner */}
                <div style={{
                  borderRadius: "16px", padding: "24px", marginBottom: "16px", textAlign: "center",
                  background: result.passed ? `${result.badge?.color || "#6ee7b7"}10` : "rgba(255,80,80,0.07)",
                  border: `1px solid ${result.passed ? `${result.badge?.color || "#6ee7b7"}35` : "rgba(255,80,80,0.25)"}`,
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>{result.passed ? (result.badge?.emoji || "✅") : "❌"}</div>
                  <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px", color: result.passed ? (result.badge?.color || "#6ee7b7") : "#ff9999", margin: "0 0 8px 0" }}>
                    {result.passed ? `${result.badge?.level || ""} ${selectedSkill} Badge!` : "Not Passed"}
                  </h3>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
                    <span style={{ fontSize: "13px", padding: "6px 14px", borderRadius: "20px", background: result.passed ? `${result.badge?.color || "#6ee7b7"}15` : "rgba(255,80,80,0.1)", color: result.passed ? (result.badge?.color || "#6ee7b7") : "#ff9999" }}>
                      Score: {result.score}/100
                    </span>
                    {result.passed && result.badge && (
                      <span style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "20px", background: `${result.badge.color}20`, color: result.badge.color, border: `1px solid ${result.badge.color}40` }}>
                        {result.badge.emoji} {result.badge.level} · ≥{result.badge.minScore} pts
                      </span>
                    )}
                    {!result.passed && result.attemptsLeft > 0 && (
                      <span style={{ fontSize: "12px", color: "rgba(255,153,153,0.5)", alignSelf: "center" }}>
                        {result.attemptsLeft} attempts left
                      </span>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                {result.passed && result.strengths && (
                  <div style={{ borderRadius: "12px", padding: "16px", marginBottom: "12px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(110,231,183,0.6)" }}>✅ Strengths</p>
                    <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--muted)", margin: 0 }}>{result.strengths}</p>
                  </div>
                )}

                {/* Improvements */}
                {!result.passed && result.improvements && (
                  <div style={{ borderRadius: "12px", padding: "16px", marginBottom: "12px", background: "rgba(255,80,80,0.04)", border: "1px solid rgba(255,80,80,0.12)" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,153,153,0.6)" }}>💡 Improve On</p>
                    <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--muted)", margin: 0 }}>{result.improvements}</p>
                  </div>
                )}

                {/* Feedback */}
                <div style={{ borderRadius: "12px", padding: "16px", marginBottom: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>AI Feedback</p>
                  <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--ink)", margin: 0 }}>{result.feedback}</p>
                </div>

                {/* Correct approach */}
                {result.correctApproach && (
                  <div style={{ borderRadius: "12px", padding: "16px", marginBottom: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Ideal Approach</p>
                    <p style={{ fontSize: "12px", lineHeight: "1.7", color: "var(--muted)", margin: 0 }}>{result.correctApproach}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  {!result.passed && result.attemptsLeft > 0 && (
                    <button onClick={() => { setStep("challenge"); setAnswer(""); setResult(null); }}
                      className="rg-pill-outline" style={{ flex: 1, padding: "12px", fontSize: "14px" }}>
                      Try Again
                    </button>
                  )}
                  <button onClick={() => { setStep("select"); setSelectedSkill(""); setChallenge(null); setResult(null); }}
                    className="rg-pill-outline" style={{ flex: 1, padding: "12px", fontSize: "14px" }}>
                    {result.passed ? "Verify Another Skill →" : "Choose Different Skill"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
};

export default FreelancerSkillVerify;
