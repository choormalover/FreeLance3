import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientMyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await API.get("/jobs/my/posted"); setJobs(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    try { await API.delete(`/jobs/${id}`); fetchJobs(); }
    catch (err) { alert("Delete failed: " + (err.response?.data?.error || err.message)); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/jobs/${editJob._id}`, { ...editJob, skills: typeof editJob.skills==="string" ? editJob.skills.split(",").map(s=>s.trim()) : editJob.skills });
      setEditJob(null); fetchJobs();
    } catch (err) { alert("Edit failed: " + (err.response?.data?.error || err.message)); }
  };

  const statusStyle = (status) => {
    if (status === 'open') return { background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" };
    if (status === 'in_progress') return { background: "rgba(255,255,255,0.1)", color: "var(--ink)", border: "1px solid var(--border)" };
    if (status === 'completed') return { background: "rgba(255,255,255,0.06)", color: "var(--ink)", border: "1px solid var(--border)" };
    return { background: "rgba(255,255,255,0.04)", color: "var(--muted)", border: "1px solid var(--border)" };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>Posted Jobs</h1>
            <p className="mt-1" style={{ color: "var(--muted)" }}>{jobs.length} jobs</p>
          </div>
          <button onClick={()=>navigate("/client/post-job")} className="rg-pill">+ Post New Job</button>
        </div>
        {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
        <div className="flex flex-col gap-4">
          {jobs.map(job=>(
            <div key={job._id} className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg" style={{ color: "var(--ink)" }}>{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={statusStyle(job.status)}>
                      {job.status==='completed'?'🏆 Completed':job.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{job.description?.slice(0,100)}...</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={()=>navigate(`/client/job/${job._id}`)} className="rg-pill-outline text-sm px-3 py-1.5">View</button>
                  {job.status==='open' && <button onClick={()=>setEditJob({...job,skills:job.skills.join(", ")})} className="rg-pill text-sm px-3 py-1.5">Edit</button>}
                  {job.status==='open' && (
                    <button onClick={()=>handleDelete(job._id)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,120,120,0.3)", color: "#ffb3b3" }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {(job.status==='in_progress'||job.status==='completed') && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                    <span>Payment Progress</span><span>{job.paymentProgress||0}% released</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width:`${job.paymentProgress||0}%`, background: "rgba(255,255,255,0.85)" }}/>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-3 text-sm" style={{ color: "var(--muted)" }}>
                <span>💰 {job.budget} MSTC</span><span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        {editJob && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--ink)" }}>Edit Job</h2>
              <form onSubmit={handleEdit} className="flex flex-col gap-4">
                <input value={editJob.title} onChange={e=>setEditJob({...editJob,title:e.target.value})} className="rg-input"/>
                <textarea value={editJob.description} onChange={e=>setEditJob({...editJob,description:e.target.value})} rows={3} className="rg-input resize-none"/>
                <input value={editJob.skills} onChange={e=>setEditJob({...editJob,skills:e.target.value})} placeholder="Skills (comma separated)" className="rg-input"/>
                <div className="flex gap-3">
                  <button type="submit" className="rg-pill flex-1 py-2.5">Save</button>
                  <button type="button" onClick={()=>setEditJob(null)} className="rg-pill-outline flex-1 py-2.5">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientMyJobs;
