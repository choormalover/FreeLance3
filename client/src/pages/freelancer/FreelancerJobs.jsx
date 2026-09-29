import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await API.get("/jobs"); setJobs(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>Browse</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>Available Jobs</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{filtered.length} open positions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted)" }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or skill..."
            className="rg-input" style={{ paddingLeft: "40px" }}/>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span className="text-sm">Loading jobs...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((job) => (
            <div key={job._id} onClick={() => navigate(`/freelancer/job/${job._id}`)}
              className="rounded-2xl p-6 cursor-pointer transition-all duration-300"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)" }}>
                  ● Open
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: "var(--ink)" }}>{job.title}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--muted)" }}>{job.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {job.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)" }}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div>
                  <div className="font-bold text-lg" style={{ color: "var(--ink)" }}>{job.budget} MSTC</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Budget</div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: "var(--muted)" }}>{new Date(job.deadline).toLocaleDateString()}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Deadline</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerJobs;
