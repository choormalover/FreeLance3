import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const iconMap = {
  bid_received: "🎯",
  hired: "🤝",
  payment_released: "💰",
  work_submitted: "📁",
  bid_rejected: "❌",
  job_deleted: "🗑️"
};

const FreelancerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data);
      await API.put("/notifications/read").catch(() => {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleClick = (n) => {
    if (!n.jobId) return;
    // Always navigate to freelancer job detail path
    navigate(`/freelancer/job/${n.jobId}`);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
            Freelancer Portal
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            Notifications
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Stay updated on your bids and payments
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>
              No notifications yet
            </h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              You'll be notified when clients hire you or release payments
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 max-w-2xl">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200"
              style={{
                background: n.read ? "var(--card)" : "rgba(255,255,255,0.05)",
                border: n.read ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.25)",
                cursor: n.jobId ? "pointer" : "default",
              }}
              onMouseEnter={e => { if (n.jobId) e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = n.read ? "var(--border)" : "rgba(255,255,255,0.25)"; }}>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
                {iconMap[n.type] || "🔔"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed" style={{ color: n.read ? "var(--muted)" : "var(--ink)" }}>
                  {n.message}
                </p>
                <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
                {n.jobId && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Click to view job →
                  </p>
                )}
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--ink)" }}/>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerNotifications;
