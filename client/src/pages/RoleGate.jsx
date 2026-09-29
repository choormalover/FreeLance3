import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const PARTNERS = [
  { label: "MST Blockchain", icon: "frame" },
  { label: "BridgeKey", icon: "orb" },
  { label: "Zero Fees", icon: "swirl" },
  { label: "Smart Contract Escrow", icon: "wave" },
];

const FEATURES = [
  { title: "Smart Contract Escrow", desc: "A job's budget locks on-chain the moment a client hires — no custodian, no platform ever holding the funds." },
  { title: "Milestone-Based Payments", desc: "Work is broken into milestones and paid out tranche by tranche as each one is approved." },
  { title: "AI Skill Verification", desc: "Groq-generated coding challenges are graded automatically, issuing Gold, Silver, or Bronze verified badges." },
  { title: "ZK Reputation Proofs", desc: "Individual ratings and reviewer identities stay sealed — only a zero-knowledge proof of your reputation tier is public." },
  { title: "PageRank Talent Ranking", desc: "A bipartite graph algorithm ranks freelancer authority mathematically — no pay-to-promote bias." },
  { title: "Zero Platform Commission", desc: "FreeLance3 takes no cut. What a client pays is exactly what a freelancer receives." },
];

const FAQ_ITEMS = [
  { q: "Do I need a crypto wallet?", a: "Yes — FreeLance3 runs entirely on smart contracts, so you'll need the BridgeKey wallet extension to sign in and interact with escrow." },
  { q: "What is MSTC?", a: "MSTC is the native coin of the MST Blockchain testnet — the currency every job budget, escrow deposit, and payout is denominated in." },
  { q: "How are payments protected?", a: "A job's budget is locked in an on-chain escrow contract the moment a client hires. Funds release milestone-by-milestone, only on the client's approval." },
  { q: "Is my rating public?", a: "No. Individual scores and reviewer identities stay private. Only a cryptographic proof that you've crossed a reputation threshold (Rising, Trusted, Expert) is ever shown publicly." },
  { q: "How is my skill level verified?", a: "You request a challenge for a skill, an AI model generates and grades it automatically, and a passing score issues a verified badge on your profile." },
];

const PartnerIcon = ({ kind }) => {
  if (kind === "frame") return (
    <svg viewBox="0 0 30 31" width="30" height="31" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="29" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="19.5" cy="10.5" r="5.1" fill="#050505" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
  if (kind === "orb") return (
    <svg viewBox="0 0 25 30" width="25" height="30" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="5.5" height="30" fill="currentColor" />
      <path d="M12.5 0a15 15 0 000 30 7.5 7.5 0 000-15 7.5 7.5 0 000-15z" fill="currentColor" />
    </svg>
  );
  if (kind === "swirl") return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12.35" stroke="currentColor" strokeWidth="3.1" />
      <path d="M6 10c4-6 12-6 16 0" stroke="currentColor" strokeWidth="3.05" strokeLinecap="round" />
      <path d="M6 18c4 6 12 6 16 0" stroke="currentColor" strokeWidth="3.05" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 28 25.5" width="28" height="25.5" fill="none" aria-hidden="true">
      <path d="M0 20c4-10 10-16 14-16s10 6 14 16z" fill="currentColor" />
      <path d="M0 24c4-4 10-4 14 0s10 4 14 0" stroke="currentColor" strokeWidth="3.05" strokeLinecap="round" />
    </svg>
  );
};

export const BrandMark = () => (
  <svg viewBox="0 0 31.5 48.5" className="rg-brand-svg" aria-hidden="true">
    <defs>
      <linearGradient id="rg-bg1" x1="8" y1="0" x2="34.1" y2="28.9" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#9e9e9e" />
        <stop offset="0.28" stopColor="#a6a6a6" />
        <stop offset="0.34" stopColor="#a3a3a3" />
        <stop offset="0.40" stopColor="#3a3a3a" />
        <stop offset="0.55" stopColor="#414141" />
        <stop offset="0.60" stopColor="#7a7a7a" />
        <stop offset="0.68" stopColor="#8e8e8e" />
        <stop offset="0.80" stopColor="#a9a9a9" />
        <stop offset="0.95" stopColor="#c4c4c4" />
        <stop offset="1" stopColor="#cccccc" />
      </linearGradient>
    </defs>
    <path d="M21.5 0 L21.5 19.5 L31.5 19.5 L31.5 29 L10 48.5 L10 28.5 L0.5 28.5 L0.5 18.5 Z" fill="url(#rg-bg1)" />
    <rect x="0.5" y="18.5" width="9" height="10" fill="#fdfdfd" />
    <rect x="22" y="19.5" width="9.5" height="9.5" fill="#fdfdfd" />
  </svg>
);

const RoleGate = () => {
  const navigate = useNavigate();
  const [, setStats] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    // Fetch live platform stats — not surfaced in the hero per the composition
    // rules (single-viewport, no secondary blocks), but kept available for
    // whichever page wants to display them next.
    axios.get(`${import.meta.env.VITE_API_URL}/platform/stats`)
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    const onResize = () => {
      if (window.innerWidth / window.innerHeight > 1.1) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`rg-page${isOpen ? " is-open" : ""}`}>
      <div className="rg-stage">
        <div className="rg-plate">
          <video className="rg-plate-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        </div>

        <header className="rg-topbar">
          <a className="rg-brand" href="/" aria-label="FreeLance3 — home" onClick={(e) => e.preventDefault()}>
            <BrandMark />
            <span className="rg-brand-name">FreeLance3</span>
          </a>

          <nav className="rg-links" aria-label="Primary">
            {NAV_LINKS.map(item => (
              <a key={item.id} href={`#${item.id}`} onClick={scrollToSection(item.id)}>{item.label}</a>
            ))}
          </nav>

          <button className="rg-pill rg-pill-nav" onClick={() => navigate("/client/login")}>
            <span>Get Started</span>
          </button>

          <button className="rg-burger" id="rg-burger" aria-label={isOpen ? "Close menu" : "Menu"}
            aria-expanded={isOpen} aria-controls="rg-menu" onClick={() => setIsOpen(o => !o)}>
            <i /><i />
          </button>
        </header>

        <nav className="rg-menu" id="rg-menu" aria-label="Menu" aria-hidden={!isOpen}>
          <div className="rg-menu-inner">
            <p className="rg-menu-eyebrow">Menu</p>
            <ul className="rg-menu-list">
              {NAV_LINKS.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={(e) => { scrollToSection(item.id)(e); closeMenu(); }}>{item.label}</a>
                </li>
              ))}
            </ul>
            <div className="rg-menu-foot">
              <button className="rg-pill rg-pill-cta" onClick={() => { closeMenu(); navigate("/client/login"); }}>
                <span>I&apos;m a Client</span>
              </button>
              <button className="rg-ghost" onClick={() => { closeMenu(); navigate("/freelancer/login"); }}>
                I&apos;m a Freelancer
              </button>
            </div>
          </div>
        </nav>

        <main className="rg-hero">
          <h1 className="rg-headline">
            <span>The Next Layer</span>
            <span>of Freelancing</span>
          </h1>

          <p className="rg-sub">
            <span>Zero-commission escrow, milestone payments, and AI-verified</span>
            <span>talent — all settled trustlessly on-chain.</span>
          </p>

          <div className="rg-actions">
            <button className="rg-pill rg-pill-cta" onClick={() => navigate("/client/login")}>
              <span>I&apos;m a Client</span>
            </button>
            <button className="rg-ghost" onClick={() => navigate("/freelancer/login")}>
              I&apos;m a Freelancer
            </button>
          </div>
        </main>

        <div className="rg-logos">
          {PARTNERS.map(p => (
            <div className="rg-lg" key={p.label}>
              <PartnerIcon kind={p.icon} />
              <span className="rg-lg-word">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section id="about" className="rg-section">
        <p className="rg-eyebrow">About</p>
        <h2 className="rg-section-title">Freelancing, without the middleman.</h2>
        <p className="rg-section-body">
          FreeLance3 is a decentralized freelance marketplace built on smart contracts. Clients and
          freelancers transact directly — a job's budget locks in an on-chain escrow, payments release
          by milestone, and reputations are proven with cryptography instead of a platform's word.
          There's no commission, no custodian, and no single party ever holding your funds.
        </p>
      </section>

      <section id="features" className="rg-section">
        <p className="rg-eyebrow">Features</p>
        <h2 className="rg-section-title">Everything runs on-chain, by design.</h2>
        <div className="rg-features-grid">
          {FEATURES.map(f => (
            <div className="rg-feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="rg-section">
        <p className="rg-eyebrow">FAQ</p>
        <h2 className="rg-section-title">Common questions.</h2>
        <div className="rg-faq-list">
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div className="rg-faq-item" key={item.q}>
                <button className="rg-faq-q" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}>
                  <span>{item.q}</span>
                  <span className="rg-faq-plus">{open ? "–" : "+"}</span>
                </button>
                {open && <p className="rg-faq-a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section id="contact" className="rg-section rg-section-center">
        <p className="rg-eyebrow">Contact</p>
        <h2 className="rg-section-title">Questions, partnerships, or bug reports?</h2>
        <a href="mailto:hello@freelance3.xyz" className="rg-pill rg-pill-cta">
          <span>hello@freelance3.xyz</span>
        </a>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');

        .rg-page {
          --ink: #fafafa;
          --muted: #a7a6a6;
          --nav: #b6b5b5;
          --strip: #8b8a8a;
          --pill: #ffffff;
          --pill-ink: #050505;
          background: #050505;
          color: var(--ink);
          font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }

        .rg-stage {
          --u: calc(100vh / 1058);
          --uw: calc(100vw / 1487);
          --h: clamp(var(--u), calc(var(--u) * .65 + var(--uw) * .35), calc(var(--u) * 1.16));
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          isolation: isolate;
        }
        @supports (height: 100dvh) {
          .rg-stage { height: 100dvh; --u: calc(100dvh / 1058); }
        }

        .rg-plate { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
        .rg-plate-video {
          position: absolute; left: 50%; top: calc(1 * var(--u));
          width: calc(1492 * var(--u)); height: calc(1054 * var(--u));
          transform: translateX(calc(-50% - calc(0.5 * var(--u))));
          object-fit: cover; pointer-events: none;
        }
        .rg-plate::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(to bottom,
              rgba(5,5,5,0) 78.8%, rgba(5,5,5,.23) 79.6%, rgba(5,5,5,.45) 81.4%,
              rgba(5,5,5,.75) 83.3%, rgba(5,5,5,.84) 85.2%, rgba(5,5,5,.888) 88%,
              rgba(5,5,5,.905) 91%, rgba(5,5,5,.96) 95%, #050505 100%),
            linear-gradient(to right,
              #050505 calc(50% - 746 * var(--u)), transparent calc(50% - 676 * var(--u)),
              transparent calc(50% + 676 * var(--u)), #050505 calc(50% + 746 * var(--u)));
        }

        .rg-topbar { position: fixed; inset: 0; z-index: 20; pointer-events: none; }
        .rg-topbar > * { pointer-events: auto; }

        .rg-brand {
          position: absolute; left: calc(75 * var(--u)); top: calc(27 * var(--u));
          display: flex; align-items: center; gap: calc(10 * var(--u));
          color: var(--ink); text-decoration: none;
        }
        .rg-brand-svg { width: calc(31.5 * var(--u)); height: calc(48.5 * var(--u)); display: block; }
        .rg-brand-name { font-weight: 700; font-size: calc(20 * var(--u)); white-space: nowrap; }

        .rg-links {
          position: absolute; left: 50%; top: calc(51 * var(--u)); transform: translate(-50%, -50%);
          display: flex; align-items: center; font-size: calc(19 * var(--u)); color: var(--nav);
        }
        .rg-links a { color: inherit; text-decoration: none; white-space: nowrap; cursor: pointer; }
        .rg-links a:nth-child(1) { margin-right: calc(24.5 * var(--u)); }
        .rg-links a:nth-child(2) { margin-right: calc(23.5 * var(--u)); }
        .rg-links a:nth-child(3) { margin-right: calc(26 * var(--u)); }
        .rg-links a:hover { color: var(--ink); }

        .rg-pill {
          border: none; cursor: pointer; border-radius: 999px; background: var(--pill);
          color: var(--pill-ink); font-weight: 500; display: inline-flex; align-items: center;
          justify-content: center; white-space: nowrap; font-family: inherit; text-decoration: none;
        }
        .rg-pill-nav {
          position: absolute; right: calc(75.4 * var(--u)); top: calc(27 * var(--u));
          height: calc(49 * var(--u)); padding: 0 calc(28 * var(--u)); font-size: calc(20.6 * var(--u));
        }
        .rg-pill-nav span { transform: translateY(calc(1 * var(--u))); }

        .rg-burger {
          display: none; position: absolute; right: calc(30 * var(--u)); top: calc(27 * var(--u));
          width: calc(49 * var(--u)); height: calc(49 * var(--u)); border-radius: 999px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14);
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
          cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
        }
        .rg-burger i { display: block; width: 18px; height: 2px; background: var(--ink); transition: transform .25s ease, opacity .25s ease; }
        .rg-page.is-open .rg-burger i:nth-child(1) { transform: translateY(3.5px) rotate(45deg); }
        .rg-page.is-open .rg-burger i:nth-child(2) { transform: translateY(-3.5px) rotate(-45deg); }

        .rg-menu {
          position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, rgba(5,5,5,.94), rgba(5,5,5,.98));
          -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);
          opacity: 0; visibility: hidden; transition: opacity .42s ease, visibility .42s ease;
        }
        .rg-page.is-open .rg-menu { opacity: 1; visibility: visible; }
        .rg-menu-inner { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 24px; }
        .rg-menu-eyebrow { color: var(--muted); font-size: 14px; letter-spacing: .1em; text-transform: uppercase; }
        .rg-menu-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .rg-menu-list a { color: var(--ink); text-decoration: none; font-size: clamp(22px, 7vw, 31px); font-weight: 500; cursor: pointer; }
        .rg-menu-foot { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; align-items: center; }
        .rg-menu-foot .rg-pill-cta { height: 48px; padding: 0 30px; font-size: 16px; }
        .rg-menu-foot .rg-ghost { color: #fff; background: none; border: none; font-size: 15px; }

        .rg-hero { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        .rg-hero > * { pointer-events: auto; }

        .rg-headline {
          position: absolute; left: calc(75.5 * var(--u)); top: calc(230.5 * var(--u));
          margin: 0; font-size: calc(71.6 * var(--h)); line-height: calc(80.5 * var(--h));
          font-weight: 400; letter-spacing: calc(0.3 * var(--h)); color: var(--ink); white-space: nowrap;
        }
        .rg-headline span { display: block; }

        .rg-sub {
          position: absolute; left: calc(75.5 * var(--u));
          top: calc(230.5 * var(--u) + 189.0 * var(--h));
          margin: 0; font-size: calc(20.7 * var(--h)); line-height: calc(23.5 * var(--h));
          font-weight: 400; word-spacing: calc(1.8 * var(--h)); color: var(--muted);
        }
        .rg-sub span { display: block; white-space: nowrap; }

        .rg-actions {
          position: absolute; left: calc(74.9 * var(--u));
          top: calc(230.5 * var(--u) + 264.5 * var(--h));
          display: flex; align-items: center; gap: calc(24 * var(--h));
        }
        .rg-actions .rg-pill-cta { height: calc(50 * var(--h)); padding: 0 calc(32 * var(--h)); font-size: calc(20.6 * var(--h)); }
        .rg-actions .rg-ghost {
          background: none; border: none; cursor: pointer; color: #fff; font-family: inherit;
          font-size: calc(20.6 * var(--h)); font-weight: 500; letter-spacing: calc(0.12 * var(--h)); white-space: nowrap;
        }

        .rg-logos {
          position: absolute; left: 50%; top: calc(994.7 * var(--u));
          transform: translateX(calc(-50% + 20 * var(--u)));
          width: calc(741 * var(--u)); z-index: 2;
          display: flex; align-items: center; gap: calc(48 * var(--u)); color: var(--strip);
        }
        .rg-lg { display: flex; align-items: center; gap: calc(9 * var(--u)); }
        .rg-lg-word { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: calc(15.5 * var(--u)); white-space: nowrap; }

        /* ── Sections below the hero ── */
        .rg-section {
          position: relative; z-index: 1; max-width: 1040px; margin: 0 auto;
          padding: clamp(64px, 10vw, 120px) 24px; scroll-margin-top: 96px;
        }
        .rg-section-center { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 22px; }
        .rg-eyebrow { color: var(--muted); font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; margin: 0 0 14px; }
        .rg-section-title { color: var(--ink); font-size: clamp(26px, 4vw, 40px); font-weight: 600; line-height: 1.15; margin: 0 0 22px; max-width: 640px; }
        .rg-section-body { color: var(--muted); font-size: 16px; line-height: 1.75; max-width: 660px; margin: 0; }

        .rg-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 12px; }
        .rg-feature-card { border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 26px; background: rgba(255,255,255,.02); }
        .rg-feature-card h3 { color: var(--ink); font-size: 17px; font-weight: 700; margin: 0 0 10px; }
        .rg-feature-card p { color: var(--muted); font-size: 14px; line-height: 1.65; margin: 0; }

        .rg-faq-list { margin-top: 8px; }
        .rg-faq-item { border-bottom: 1px solid rgba(255,255,255,.1); padding: 20px 0; }
        .rg-faq-q {
          width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px;
          background: none; border: none; color: var(--ink); font-family: inherit;
          font-size: 17px; font-weight: 600; cursor: pointer; text-align: left; padding: 0;
        }
        .rg-faq-plus { color: var(--muted); font-size: 20px; flex-shrink: 0; }
        .rg-faq-a { margin: 14px 0 0; color: var(--muted); font-size: 15px; line-height: 1.7; max-width: 720px; }

        @media (prefers-reduced-motion: no-preference) {
          .rg-brand, .rg-links, .rg-pill-nav { animation: rg-rise .8s cubic-bezier(.22,1,.36,1) both; }
          .rg-links { animation-name: rg-rise-nav; }
          .rg-headline { animation: rg-rise .9s cubic-bezier(.22,1,.36,1) .06s both; }
          .rg-sub { animation: rg-rise .9s cubic-bezier(.22,1,.36,1) .14s both; }
          .rg-actions { animation: rg-rise .9s cubic-bezier(.22,1,.36,1) .22s both; }
          .rg-logos { animation: rg-fade 1.1s ease .34s both; }
        }
        @keyframes rg-rise { from { opacity: 0; transform: translateY(calc(14 * var(--u))); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rg-rise-nav {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 14 * var(--u))); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes rg-fade { from { opacity: 0; } to { opacity: 1; } }

        @media (max-aspect-ratio: 11/10) {
          .rg-stage { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
          .rg-plate-video {
            inset: 0; left: 0; top: 0; width: 100%; height: 100%; transform: none;
            object-fit: cover; object-position: 43% center;
          }
          .rg-plate::after {
            background:
              linear-gradient(to right, rgba(5,5,5,.86), rgba(5,5,5,.66) 42%, rgba(5,5,5,.20) 78%, rgba(5,5,5,.10) 100%),
              linear-gradient(to bottom, rgba(5,5,5,.72) 0%, rgba(5,5,5,.34) 24%, rgba(5,5,5,.34) 56%, rgba(5,5,5,.80) 82%, rgba(5,5,5,.97) 94%, #050505 100%);
          }
          .rg-links, .rg-pill-nav { display: none; }
          .rg-burger { display: flex; }

          .rg-headline {
            left: 24px; right: 24px; top: auto; bottom: 42%; white-space: normal;
            font-size: clamp(32px, 9vw, 52px); line-height: 1.08; letter-spacing: 0;
          }
          .rg-sub {
            left: 24px; right: 24px; top: auto; bottom: 30%; white-space: normal;
            font-size: 16px; line-height: 1.4;
          }
          .rg-sub span { white-space: normal; }
          .rg-actions { left: 24px; top: auto; bottom: 16%; flex-direction: column; align-items: flex-start; gap: 12px; }
          .rg-actions .rg-pill-cta { height: 48px; padding: 0 26px; font-size: 16px; }
          .rg-actions .rg-ghost { font-size: 15px; }

          .rg-logos {
            left: 24px; right: 24px; top: auto; bottom: 24px; transform: none; width: auto;
            display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px;
          }
          .rg-lg-word { font-size: 12px; white-space: normal; }
        }

        @media (min-width: 600px) and (max-aspect-ratio: 11/10) {
          .rg-logos { grid-template-columns: 1fr 1fr 1fr 1fr; }
          .rg-lg-word { font-size: 13px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .rg-page *, .rg-page *::before, .rg-page *::after { animation: none !important; transition: none .001s !important; }
        }
      `}</style>
    </div>
  );
};

export default RoleGate;
