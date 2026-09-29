import { useState } from "react";
import API from "../utils/api";

const SubmitWork = ({ jobId, milestones, onSubmitted }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", message);
      formData.append("milestoneIndex", milestoneIndex);
      await API.post(`/submissions/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit work");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
      <div className="font-semibold mb-1" style={{ color: "#6ee7b7" }}>✅ Work submitted!</div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Waiting for client to review and release payment.</p>
    </div>
  );

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-semibold mb-4" style={{ color: "var(--ink)" }}>📤 Submit Your Work</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {milestones && milestones.length > 0 && (
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--muted)" }}>Submitting for Milestone</label>
            <select value={milestoneIndex} onChange={e => setMilestoneIndex(Number(e.target.value))} className="rg-input">
              {milestones.map((m, i) => (
                <option key={i} value={i}>{m.title} ({m.percentage}%)</option>
              ))}
            </select>
          </div>
        )}
        <div className="rounded-xl p-6 text-center cursor-pointer transition-colors"
          style={{ border: "2px dashed var(--border)" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          onClick={() => document.getElementById("fileInput").click()}>
          <input id="fileInput" type="file" onChange={e => setFile(e.target.files[0])} className="hidden"
            accept=".pdf,.zip,.png,.jpg,.jpeg,.txt,.doc,.docx"/>
          {file ? (
            <div>
              <div className="font-medium" style={{ color: "var(--ink)" }}>{file.name}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📁</div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>Click to upload your work file</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>PDF, ZIP, Images, Documents (max 10MB)</div>
            </div>
          )}
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Add a message (optional)..." rows={3}
          className="rg-input text-sm resize-none"/>
        {error && <p className="text-sm" style={{ color: "#ffb3b3" }}>{error}</p>}
        <button type="submit" disabled={loading || !file} className="rg-pill py-3">
          {loading ? "Uploading..." : "Submit Work"}
        </button>
      </form>
    </div>
  );
};

export default SubmitWork;
