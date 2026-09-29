import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientPostJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:"", description:"", skills:"", budget:"", deadline:"" });
  const [milestones, setMilestones] = useState([{ title:"Initial delivery", percentage:50 },{ title:"Final delivery", percentage:50 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalPct = milestones.reduce((s,m) => s + Number(m.percentage), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPct !== 100) return setError("Milestone percentages must add up to 100%");
    setLoading(true); setError("");
    try {
      await API.post("/jobs", { ...form, skills: form.skills.split(",").map(s=>s.trim()), budget: parseFloat(form.budget), milestones });
      navigate("/client/my-jobs");
    } catch (err) { setError(err.response?.data?.error || "Failed to post job"); }
    finally { setLoading(false); }
  };

  const updateMilestone = (i, field, val) => {
    const u = [...milestones]; u[i][field] = field==="percentage" ? Number(val) : val; setMilestones(u);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>Post a Job</h1>
        <p className="mb-8" style={{ color: "var(--muted)" }}>Fill in the details and define payment milestones</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Job Title</label>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Build a DeFi Dashboard" required
              className="rg-input"/>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the project..." required rows={4}
              className="rg-input resize-none"/>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Required Skills</label>
            <input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="React, Solidity, Node.js" required
              className="rg-input"/>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Separate with commas</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Budget (MSTC)</label>
              <input type="number" step="0.001" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="0.05" required
                className="rg-input"/>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} required
                className="rg-input"/>
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Payment Milestones</h3>
              <button type="button" onClick={()=>setMilestones([...milestones,{title:"Milestone",percentage:0}])}
                className="text-xs transition-colors" style={{ color: "var(--muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>+ Add</button>
            </div>
            {milestones.map((m,i)=>(
              <div key={i} className="flex gap-3 mb-3 items-center">
                <input value={m.title} onChange={e=>updateMilestone(i,"title",e.target.value)} placeholder="Milestone title"
                  className="rg-input flex-1 text-sm" style={{ padding: "8px 12px" }}/>
                <input type="number" value={m.percentage} onChange={e=>updateMilestone(i,"percentage",e.target.value)} placeholder="%" min="1" max="100"
                  className="rg-input w-20 text-sm" style={{ padding: "8px 12px" }}/>
                <span className="text-sm" style={{ color: "var(--muted)" }}>%</span>
                {milestones.length > 1 && <button type="button" onClick={()=>setMilestones(milestones.filter((_,j)=>j!==i))} className="text-sm px-2" style={{ color: "#ff8080" }}>✕</button>}
              </div>
            ))}
            <div className="text-xs mt-2" style={{ color: totalPct===100 ? "#6ee7b7" : "#ff8080" }}>Total: {totalPct}% {totalPct===100?"✅":"(must be 100%)"}</div>
          </div>
          {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,120,120,0.3)", color: "#ffb3b3" }}>{error}</div>}
          <button type="submit" disabled={loading} className="rg-pill w-full py-3">
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPostJob;
