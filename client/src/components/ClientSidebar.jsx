import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useState, useEffect } from "react";
import API from "../utils/api";

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect, user } = useWallet();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get("/notifications").then(({ data }) => setUnread(data.filter(n => !n.read).length)).catch(() => {});
  }, [location.pathname]);

  const items = [
    { icon: "⬡",  label: "Dashboard",        path: "/client/dashboard" },
    { icon: "✦",  label: "Post a Job",        path: "/client/post-job" },
    { icon: "◈",  label: "Posted Jobs",       path: "/client/my-jobs" },
    { icon: "◉",  label: "Active Jobs",       path: "/client/active-jobs" },
    { icon: "⭐", label: "Top Freelancers",   path: "/client/top-freelancers" },
    { icon: "◌",  label: "Profile",           path: "/client/profile" },
  ];

  const handleDisconnect = () => { disconnect(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 flex flex-col py-8 px-4 min-h-screen"
      style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}>

      <div className="px-2 mb-8 cursor-pointer" onClick={() => navigate("/client/dashboard")}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)" }}>⛓</div>
          <span className="text-lg font-bold" style={{ color: "var(--ink)" }}>FreeLance3</span>
        </div>
        <div className="ml-9 text-xs tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          Client Portal
        </div>
      </div>

      <div className="mx-2 mb-6 px-3 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
        <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Signed in as</div>
        <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{user?.username || user?.email || "Client"}</div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative"
            style={isActive(item.path) ? {
              background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--ink)"
            } : { border: "1px solid transparent", color: "var(--muted)" }}>
            {isActive(item.path) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "var(--ink)" }} />}
            <span className="text-base w-5 flex-shrink-0 text-center" style={{ color: isActive(item.path) ? "var(--ink)" : "var(--muted)" }}>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <button onClick={() => navigate("/client/notifications")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative"
          style={isActive("/client/notifications") ? {
            background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--ink)"
          } : { border: "1px solid transparent", color: "var(--muted)" }}>
          <span className="text-base w-5 text-center" style={{ color: isActive("/client/notifications") ? "var(--ink)" : "var(--muted)" }}>◎</span>
          <span className="text-sm font-medium flex-1">Notifications</span>
          {unread > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "var(--pill)", color: "var(--pill-ink)", fontSize: "10px" }}>{unread}</span>}
        </button>
      </nav>

      <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <button onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff8080"; e.currentTarget.style.background = "rgba(255,80,80,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}>
          <span className="text-base w-5 text-center">⊗</span>
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
