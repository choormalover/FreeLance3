import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWallet } from "../../context/WalletContext";
import { BrandMark } from "../RoleGate";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4";

const onAppearEnd = (e) => e.currentTarget.classList.add("is-in");

const SparkleIcon = () => (
  <svg className="vp-badge-star" width="18" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
  </svg>
);

const StatIconWorkflow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="vpf-gradA" x1="3" y1="2" x2="14" y2="22">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
        <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
      </linearGradient>
      <linearGradient id="vpf-gradB" x1="3" y1="2" x2="14" y2="22">
        <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
      </linearGradient>
    </defs>
    <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#vpf-gradA)" />
    <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#vpf-gradB)" />
    <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
  </svg>
);

const StatIconDownload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
    <path d="M12 7.1v7.4" stroke="#111" strokeWidth="1.85" strokeLinecap="round" />
    <path d="M8.15 12.35L12 16.2l3.85-3.85" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const StatIconAvatars = () => (
  <svg className="vp-stat-icon-wide" width="38" height="21" viewBox="0 0 40 22" aria-hidden="true">
    <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
    <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
    <path d="M6.6 8.4 L8.8 6.2 L8.8 9.8 Z" fill="#f4f4f4" />
    <path d="M13.8 8.4 L11.6 6.2 L11.6 9.8 Z" fill="#f4f4f4" />
    <circle cx="8.7" cy="11.8" r="0.7" fill="#1a1a1a" />
    <circle cx="11.7" cy="11.8" r="0.7" fill="#1a1a1a" />

    <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
    <circle cx="17.7" cy="10.2" r="1.7" fill="#111" />
    <circle cx="22.7" cy="10.2" r="1.7" fill="#111" />
    <ellipse cx="20.2" cy="13" rx="1.1" ry="0.8" fill="#ccc" />
    <path d="M17 15.5 Q20.2 18 23.4 15.5" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round" />

    <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
    <text x="30.2" y="15.1" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12.5" fill="#fff" textAnchor="middle">e</text>
  </svg>
);

const FreelancerLogin = () => {
  const { connectWallet, loading, account, user } = useWallet();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const rootRef = useRef(null);

  useEffect(() => {
    if (account && user?.role === "freelancer") navigate("/freelancer/dashboard");
    if (account && user?.role === "client") setError("This wallet is registered as a Client. Please switch wallet.");
  }, [account, user]);

  const handleConnect = async () => {
    setError("");
    const result = await connectWallet("freelancer");
    if (result?.success) navigate("/freelancer/dashboard");
    else if (result?.wrongPortal) setError(`This wallet is a ${result.correctRole}. Please switch to your freelancer wallet.`);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/platform/stats`)
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    const onResize = () => { if (window.innerWidth >= 901) setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const els = rootRef.current ? rootRef.current.querySelectorAll(".vp-appear, .vp-hero-photo") : [];
        els.forEach((el) => {
          const anims = el.getAnimations ? el.getAnimations() : [];
          const active = anims.some((a) => a.playState === "running" || a.playState === "finished");
          if (!active) el.classList.add("is-in");
        });
      });
    });
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2); };
  }, []);

  return (
    <div className={`vp-stage${isOpen ? " is-open" : ""}`} ref={rootRef}>
      <div className="vp-grain" aria-hidden="true" />

      <div className="vp-hero-photo is-in">
        <video autoPlay muted loop playsInline preload="auto" aria-hidden="true">
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="vp-page">
        <div className="vp-menu-backdrop" onClick={closeMenu} />

        <header className="vp-header">
          <a href="/" className="vp-logo vp-appear vp-appear--scale" style={{ "--d": "0.08s" }} onAnimationEnd={onAppearEnd}
            onClick={(e) => { e.preventDefault(); navigate("/"); }} aria-label="FreeLance3 — home">
            <BrandMark />
            <span>FreeLance<span className="vp-logo-suffix">3</span></span>
          </a>

          <nav className="vp-nav" id="site-nav" aria-label="Primary">
            <a href="#" className="vp-nav-link vp-appear vp-appear--scale" style={{ "--d": "0.16s" }} onAnimationEnd={onAppearEnd}
              onClick={(e) => { e.preventDefault(); closeMenu(); navigate("/client/login"); }}>
              Switch Portal
            </a>
          </nav>

          <button className="vp-burger vp-appear vp-appear--scale" style={{ "--d": "0.34s" }} onAnimationEnd={onAppearEnd}
            aria-controls="site-nav" aria-expanded={isOpen} aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </header>

        <main className="vp-hero" id="top">
          <div className="vp-hero-copy">
            <div className="vp-badge vp-appear vp-appear--pop" style={{ "--d": "0.22s" }} onAnimationEnd={onAppearEnd}>
              <SparkleIcon />
              <span>Freelancer Portal</span>
            </div>

            <h1 className="vp-h1">
              <span className="vp-headline-line vp-appear vp-appear--mask" style={{ "--d": "0.42s" }} onAnimationEnd={onAppearEnd}>
                Find <em>work</em> you actually
              </span>
              <span className="vp-headline-line vp-appear vp-appear--mask" style={{ "--d": "0.62s" }} onAnimationEnd={onAppearEnd}>
                enjoy doing.
              </span>
            </h1>

            <p className="vp-lede vp-appear vp-appear--soft vp-appear--lede" style={{ "--d": "0.82s" }} onAnimationEnd={onAppearEnd}>
              Browse open jobs, get AI-verified on your skills, and get paid directly to your wallet in MSTC.
            </p>

            <div className="vp-hero-actions">
              <button className="vp-btn vp-btn-solid vp-appear vp-appear--btn" style={{ "--d": "0.96s" }} onAnimationEnd={onAppearEnd}
                onClick={handleConnect} disabled={loading}>
                {loading ? "Connecting..." : "Connect Freelancer Wallet"}
              </button>
              <button className="vp-btn vp-btn-ghost vp-appear vp-appear--side" style={{ "--d": "1.10s" }} onAnimationEnd={onAppearEnd}
                onClick={() => navigate("/client/login")}>
                I&apos;m a Client instead →
              </button>
            </div>

            <div className="vp-fineprint">
              {error && <p className="vp-error">⚠ {error}</p>}
              <p className="vp-fineprint-title">🔑 Using multiple wallets?</p>
              <ol>
                <li><span>1.</span> Open BridgeKey extension</li>
                <li><span>2.</span> Click account name at top</li>
                <li><span>3.</span> Switch to your Freelancer wallet</li>
                <li><span>4.</span> Click Connect above</li>
              </ol>
            </div>
          </div>
        </main>

        <footer className="vp-stats">
          <div className="vp-stat vp-appear vp-appear--stat" style={{ "--d": "1.12s" }} onAnimationEnd={onAppearEnd}>
            <StatIconWorkflow />
            <span>{statsLoading ? "—" : stats?.totalJobs ?? 0} jobs posted</span>
          </div>
          <div className="vp-stat vp-appear vp-appear--stat" style={{ "--d": "1.28s" }} onAnimationEnd={onAppearEnd}>
            <StatIconDownload />
            <span>0% platform commission</span>
          </div>
          <div className="vp-stat vp-appear vp-appear--stat" style={{ "--d": "1.44s" }} onAnimationEnd={onAppearEnd}>
            <StatIconAvatars />
            <span>{statsLoading ? "—" : stats?.totalFreelancers ?? 0} freelancers onboarded</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Instrument+Serif:ital@1&display=swap');

        html, body { background: #000000 !important; color: #ffffff; }
        html, body { background: #000000; color: #ffffff; }

        .vp-stage {
          --bg: #000000;
          --text: #ffffff;
          --muted: #9a9a9a;
          --stat: #d8d8d8;
          --border: rgba(255,255,255,0.16);
          --border-soft: rgba(255,255,255,0.12);

          --logo: 15.5px;
          --logo-mark: 22px;
          --nav: 14px;
          --nav-h: 40px;
          --btn: 13.5px;
          --btn-h: 40px;
          --hero-btn-h: 42px;
          --h1: 48px;
          --lede: 15.5px;
          --badge: 12.5px;
          --stat-size: 13.5px;
          --header-y: 22px;
          --header-x: 40px;
          --stats-x: 72px;
          --stats-y: 36px;
          --hero-gap: 85px;
          --copy-max: 860px;
          --lede-max: 470px;

          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
          position: relative;
        }
        .vp-stage, .vp-stage *, .vp-stage *::before, .vp-stage *::after { box-sizing: border-box; }
        .vp-stage a { color: inherit; text-decoration: none; }
        .vp-stage button { font-family: inherit; }

        .vp-grain {
          position: fixed; inset: 0; z-index: 100; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .vp-hero-photo { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: #000; }
        .vp-hero-photo video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

        .vp-page { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
        @supports (height: 100dvh) { .vp-page { min-height: 100dvh; } }
        @media (min-width: 901px) {
          html, body { height: 100%; overflow: hidden; }
          .vp-page { height: 100vh; overflow: hidden; }
          @supports (height: 100dvh) { .vp-page { height: 100dvh; } }
        }

        .vp-menu-backdrop {
          display: block; position: fixed; inset: 0; z-index: 40; background: rgba(8,8,8,0.42);
          opacity: 0; visibility: hidden; transition: opacity .28s ease, visibility .28s ease;
        }
        .vp-stage.is-open .vp-menu-backdrop { opacity: 1; visibility: visible; -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); }

        .vp-header {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
          padding: var(--header-y) var(--header-x) 10px; position: relative; z-index: 50;
        }
        .vp-logo {
          display: inline-flex; align-items: center; gap: 9px; justify-self: start;
          font-size: var(--logo); font-weight: 600; letter-spacing: -0.03em; color: #fff; cursor: pointer;
        }
        .vp-logo .rg-brand-svg { height: var(--logo-mark); width: calc(var(--logo-mark) * 0.65); display: block; }
        .vp-logo-suffix { font-weight: 400; }

        .vp-nav { display: flex; align-items: center; gap: 8px; justify-self: center; }
        .vp-nav-link {
          height: var(--nav-h); padding: 0 18px; border-radius: 7px; overflow: hidden; position: relative;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid rgba(198,198,198,0.55);
          background: linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%);
          color: #f3f3f3; font-size: var(--nav); font-weight: 400; letter-spacing: -0.01em; white-space: nowrap;
          cursor: pointer; transition: background .35s ease, border-color .35s ease, box-shadow .35s ease;
        }
        .vp-nav-link::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%);
          transform: translateX(-120%); transition: transform .6s ease;
        }
        .vp-nav-link:hover::before { transform: translateX(120%); }
        .vp-nav-link:hover {
          border-color: rgba(235,235,235,0.9);
          background: linear-gradient(105deg, #111 0%, #3a3a3a 45%, #6a6a6a 100%);
          box-shadow: 0 0 18px rgba(200,210,230,0.18);
        }

        .vp-burger {
          display: none; width: 42px; height: 42px; border-radius: 6px; border: 1px solid var(--border);
          background: rgba(8,8,8,0.55); z-index: 60; cursor: pointer; flex-direction: column; align-items: center;
          justify-content: center; gap: 5px; justify-self: end;
        }
        .vp-burger span { display: block; width: 16px; height: 1.5px; background: #fff; border-radius: 1px; transition: transform .25s ease, opacity .2s ease; }
        .vp-burger:hover { border-color: rgba(255,255,255,0.32); background: rgba(255,255,255,0.05); }
        .vp-stage.is-open .vp-burger span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .vp-stage.is-open .vp-burger span:nth-child(2) { opacity: 0; }
        .vp-stage.is-open .vp-burger span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .vp-btn {
          position: relative; isolation: isolate; overflow: hidden; display: inline-flex; align-items: center;
          justify-content: center; height: var(--btn-h); padding: 0 16px; border-radius: 6px; border: none;
          font-size: var(--btn); font-weight: 500; letter-spacing: -0.02em; line-height: 1; white-space: nowrap;
          cursor: pointer; transition: background .35s ease, border-color .35s ease, box-shadow .35s ease, color .35s ease, filter .35s ease;
        }
        .vp-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%);
          transform: translateX(-130%); transition: transform .65s ease;
        }
        .vp-btn:hover::after { transform: translateX(130%); }
        .vp-btn:disabled { opacity: .6; cursor: default; }

        .vp-btn-solid {
          background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
          color: #111; border: 1px solid #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
        }
        .vp-btn-solid:hover {
          background: linear-gradient(180deg, #fff 0%, #f3f6ff 42%, #d5def2 100%); border-color: #f2f6ff;
          box-shadow: inset 0 1px 0 #fff, 0 0 22px rgba(186,208,255,0.35), 0 8px 18px rgba(255,255,255,0.12);
        }
        .vp-hero-actions .vp-btn-solid:hover {
          box-shadow: inset 0 1px 0 #fff, 0 0 26px rgba(186,208,255,0.4), 0 8px 18px rgba(255,255,255,0.14);
        }

        .vp-btn-ghost {
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.45) 50%, rgba(160,175,200,0.08));
          color: #fff; border: 1px solid rgba(198,198,198,0.45); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .vp-btn-ghost:hover {
          background: linear-gradient(135deg, rgba(210,225,255,0.18), rgba(0,0,0,0.35) 48%, rgba(180,195,220,0.16));
          border-color: rgba(220,230,255,0.75);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 0 20px rgba(170,200,255,0.22);
        }
        .vp-hero-actions .vp-btn-ghost {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.5) 46%, rgba(150,170,200,0.1));
          border: 1px solid rgba(198,198,198,0.55);
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
        }
        .vp-hero-actions .vp-btn-ghost:hover { box-shadow: 0 0 24px rgba(170,200,255,0.28); border-color: rgba(220,230,255,0.8); }
        .vp-hero-actions .vp-btn { height: var(--hero-btn-h); padding: 0 18px; }

        .vp-hero { display: flex; align-items: flex-end; justify-content: center; padding: 8px 24px var(--hero-gap); min-height: 0; position: relative; z-index: 1; }
        .vp-hero-copy { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: var(--copy-max); width: 100%; }

        .vp-badge {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; padding: 9px 15px; border-radius: 5px;
          background: linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%);
          color: #f2f2f2; font-size: var(--badge); font-weight: 400; letter-spacing: -0.01em;
        }
        .vp-badge-star { filter: drop-shadow(0 0 3px rgba(255,255,255,0.45)); }

        .vp-h1 { font-weight: 500; letter-spacing: -0.045em; line-height: 1.12; color: #fff; font-size: var(--h1); margin: 0; display: flex; flex-direction: column; align-items: center; }
        .vp-headline-line { display: block; overflow: hidden; padding: 0.06em 0.15em 0.14em; }
        .vp-h1 em {
          font-family: 'Instrument Serif', 'Times New Roman', Times, serif; font-style: italic; font-weight: 400;
          font-size: 1.08em; letter-spacing: -0.03em; color: #9a9a9a;
          animation: vp-in-em 1.2s cubic-bezier(0.16,1,0.3,1) 0.72s both;
        }

        .vp-lede { max-width: var(--lede-max); margin-top: 18px; color: #9a9a9a; font-size: var(--lede); font-weight: 400; line-height: 1.55; letter-spacing: -0.015em; }
        .vp-appear--lede { animation-duration: 1.25s; }

        .vp-hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 26px; }

        .vp-fineprint { margin-top: 22px; max-width: var(--lede-max); color: var(--muted); font-size: 12.5px; line-height: 1.6; }
        .vp-error { color: #ff9b9b; margin: 0 0 10px; font-weight: 500; }
        .vp-fineprint-title { margin: 0 0 6px; font-weight: 600; color: rgba(255,255,255,0.75); }
        .vp-fineprint ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
        .vp-fineprint li { display: flex; gap: 6px; justify-content: center; }
        .vp-fineprint li span { color: rgba(255,255,255,0.5); font-weight: 600; }

        .vp-stats { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 var(--stats-x) var(--stats-y); padding-bottom: max(var(--stats-y), env(safe-area-inset-bottom)); color: var(--stat); position: relative; z-index: 1; }
        .vp-stat { display: inline-flex; align-items: center; gap: 14px; font-size: var(--stat-size); letter-spacing: -0.015em; white-space: nowrap; }
        .vp-stat svg { flex-shrink: 0; }

        /* ── Entrance motion ── */
        .vp-appear { opacity: 1; animation-duration: 1.05s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16,1,0.3,1); animation-delay: var(--d, 0.08s); }
        .vp-appear.is-in { animation: none; opacity: 1; transform: none; clip-path: none; filter: none; }
        .vp-appear--scale { animation-name: vp-in-scale; }
        .vp-appear--soft { animation-name: vp-in-soft; }
        .vp-appear--mask { animation-name: vp-in-mask; }
        .vp-appear--pop { animation-name: vp-in-pop; }
        .vp-appear--btn { animation-name: vp-in-btn; }
        .vp-appear--side { animation-name: vp-in-side; }
        .vp-appear--stat { animation-name: vp-in-stat; }

        @keyframes vp-in-scale { from { opacity: 0; transform: scale(0.84); } to { opacity: 1; transform: scale(1); } }
        @keyframes vp-in-soft { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vp-in-mask { from { opacity: 0; transform: translateY(40%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vp-in-pop { 0% { opacity: 0; transform: scale(0.9); } 70% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes vp-in-btn { from { opacity: 0; transform: translateY(18px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes vp-in-side { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vp-in-stat { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vp-in-star { 0% { transform: scale(0.2) rotate(-50deg); } 65% { transform: scale(1.2) rotate(8deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes vp-in-em { from { opacity: 0.35; filter: blur(4px); } to { opacity: 1; filter: blur(0); } }
        .vp-badge-star { animation: vp-in-star 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s both; }

        @media (prefers-reduced-motion: reduce) {
          .vp-stage *, .vp-stage *::before, .vp-stage *::after { transition: none !important; animation: none !important; }
          .vp-stage .vp-appear, .vp-stage .vp-hero-photo, .vp-stage .vp-h1 em, .vp-stage .vp-badge-star { opacity: 1; transform: none; clip-path: none; filter: none; }
        }

        /* ── Responsive tokens ── */
        @media (min-width: 901px) and (max-width: 1279px) {
          .vp-stage { --logo:15px; --nav:13px; --nav-h:36px; --btn:13px; --btn-h:38px; --hero-btn-h:40px; --h1:42px; --lede:15px; --badge:12px; --stat-size:12.5px; --header-y:16px; --header-x:28px; --stats-x:36px; --stats-y:28px; --hero-gap:64px; --copy-max:760px; --lede-max:440px; }
          .vp-nav-link { padding: 0 14px; }
        }
        @media (min-width: 1280px) and (max-width: 1599px) {
          .vp-stage { --h1:54px; --lede:16px; --header-x:48px; --stats-x:80px; --copy-max:900px; }
        }
        @media (min-width: 1600px) {
          .vp-stage { --logo:17px; --logo-mark:24px; --nav:15px; --nav-h:44px; --btn:15px; --btn-h:44px; --hero-btn-h:48px; --h1:64px; --lede:18px; --badge:13.5px; --stat-size:15px; --header-y:28px; --header-x:64px; --stats-x:96px; --stats-y:44px; --copy-max:980px; --lede-max:540px; }
          .vp-nav-link { padding: 0 20px; }
          .vp-badge { margin-bottom: 26px; padding: 10px 15px; }
          .vp-lede { margin-top: 22px; }
          .vp-hero-actions { margin-top: 30px; gap: 12px; }
          .vp-stat-icon-wide { width: 45px; height: 24px; }
        }
        @media (min-width: 1920px) {
          .vp-stage { --logo:18px; --logo-mark:26px; --nav:16px; --nav-h:48px; --btn:16px; --btn-h:48px; --hero-btn-h:52px; --h1:76px; --lede:20px; --badge:14.5px; --stat-size:16px; --header-y:32px; --header-x:80px; --stats-x:120px; --stats-y:52px; --copy-max:1120px; --lede-max:620px; }
          .vp-nav { gap: 10px; }
          .vp-nav-link { padding: 0 22px; }
          .vp-btn { padding: 0 22px; }
          .vp-stat-icon-wide { width: 48px; height: 26px; }
        }
        @media (min-width: 2560px) {
          .vp-stage { --h1:88px; --lede:22px; --header-x:120px; --stats-x:160px; --copy-max:1280px; --lede-max:680px; }
        }
        @media (min-width: 901px) and (max-height: 850px) {
          .vp-stage { --header-y:14px; --stats-y:24px; --hero-gap:48px; --h1:40px; }
          .vp-badge { margin-bottom: 12px; }
          .vp-lede { margin-top: 12px; }
          .vp-hero-actions { margin-top: 16px; }
        }
        @media (min-width: 901px) and (max-height: 720px) {
          .vp-stage { --h1:34px; --lede:14px; --hero-gap:32px; --stats-y:18px; --nav-h:30px; --btn-h:34px; --hero-btn-h:36px; }
          .vp-badge { margin-bottom: 8px; }
        }

        @media (max-width: 900px) {
          html, body { height: auto; overflow-y: auto; }
          .vp-stage { --logo:16px; --btn:15px; --btn-h:46px; --hero-btn-h:48px; --h1:36px; --lede:16.5px; --badge:13.5px; --stat-size:15px; --header-y:16px; --header-x:16px; --stats-x:20px; --stats-y:28px; --hero-gap:36px; }
          .vp-page { min-height: 100vh; }
          .vp-header { grid-template-columns: 1fr auto auto; gap: 8px; padding-top: max(var(--header-y), env(safe-area-inset-top)); }
          .vp-logo, .vp-burger { z-index: 80; position: relative; }
          .vp-burger { display: flex; }
          .vp-nav {
            position: fixed; inset: 0; z-index: 45; background: transparent; flex-direction: column; align-items: center;
            justify-content: center; gap: 12px; padding: max(96px, calc(env(safe-area-inset-top) + 88px)) 22px 32px;
            opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .28s ease, visibility .28s ease;
          }
          .vp-stage.is-open .vp-nav { opacity: 1; visibility: visible; pointer-events: auto; }
          .vp-nav-link { width: 100%; height: 56px; font-size: 19px; border-radius: 10px; }
          body.menu-open, .vp-stage.is-open { overflow: hidden; }
          .vp-hero { padding: 20px 20px 64px; align-items: flex-end; }
          .vp-hero-copy { max-width: 100%; }
          .vp-lede { max-width: 100%; }
          .vp-stats { flex-direction: column; gap: 16px; }
          .vp-stat { white-space: normal; }
        }
        @media (max-width: 560px) {
          .vp-stage { --h1:34px; --lede:16px; --header-x:16px; }
          .vp-hero-actions { flex-direction: column; }
          .vp-hero-actions .vp-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default FreelancerLogin;
