# UI/UX Design System & Specifications
## Project: FreeLance3 (Decentralized Web3 Freelance Platform)
**Document Version:** 1.0.0  
**Design Standard:** High-End Web3 Glassmorphism & Dual-Personality Dark Mode  

---

## 1. Design Philosophy & Aesthetic Identity

FreeLance3 departs radically from the sterile, corporate look of legacy Web2 freelancing portals. The design philosophy centers on **"Cryptographic Elegance & Dual-Role Immersion"**:

1. **Submersive Dark Modes**: Deep cosmological tones minimize eye fatigue during extended coding or hiring sessions, while creating high-contrast canvases for glowing accents.
2. **Dual-Portal Personalities**:
   * **Client Portal (Imperial Amethyst)**: Conveys prestige, authority, investment, and capital allocators.
   * **Freelancer Portal (Cyber Oceanic Blue)**: Conveys technical precision, digital craftsmanship, focus, and engineering rigor.
3. **Tactile Glassmorphism & Depth**: Multi-layered interfaces utilizing real-time CSS backdrop filters (`blur(20px)`), frosted translucent surfaces (`rgba(255, 255, 255, 0.04)`), and hairline border glows (`1px solid rgba(255, 255, 255, 0.08)`).
4. **Living, Interactive Canvas**: Subtle physics-driven background particle streams and slow-pulsing radial gradient orbs evoke the sensation of an active, decentralized network.

---

## 2. Color System & Design Tokens

### 2.1 Client Theme Palette (Imperial Amethyst)
Applied across `/client/*` routes:

| Token Name | Hex Code | Swatch / Usage |
| :--- | :---: | :--- |
| `--c-bg` | `#190019` | Deepest background canvas |
| `--c-bg2` | `#2B124C` | Secondary container & surface background |
| `--c-bg3` | `#522B5B` | Interactive hover states & card elevations |
| `--c-accent` | `#854F6C` | Primary buttons, active pill tabs, borders |
| `--c-light` | `#DFB6B2` | Subtitles, icons, secondary accent text |
| `--c-lightest` | `#FBE4D8` | Primary headings, prominent numerical values |
| `--c-glow` | `rgba(82, 43, 91, 0.6)` | Ambient drop-shadows & box-glow highlights |
| `--c-border` | `rgba(133, 79, 108, 0.35)` | Subtle component dividing borders |

### 2.2 Freelancer Theme Palette (Cyber Oceanic Blue)
Applied across `/freelancer/*` routes:

| Token Name | Hex Code | Swatch / Usage |
| :--- | :---: | :--- |
| `--f-bg` | `#021024` | Deep oceanic void canvas |
| `--f-bg2` | `#052659` | Dark navy card & panel surfaces |
| `--f-bg3` | `#5483B3` | Elevated surface layers & active states |
| `--f-accent` | `#7DA0CA` | Primary call-to-actions & focus rings |
| `--f-light` | `#C1E8FF` | Primary typography & hero headings |
| `--f-muted` | `#7DA0CA` | Secondary subtitles & metadata labels |
| `--f-glow` | `rgba(5, 38, 89, 0.7)` | Cyan-blue neon back-glows |
| `--f-border` | `rgba(84, 131, 179, 0.35)` | Structural outlines & grid cards |

### 2.3 Semantic & Functional Accents
* **ZK Expert Gold**: `#FFD700` (Top tier reputation, $\ge 4.5$ score, Gold Badges).
* **ZK Trusted Emerald**: `#6EE7B7` (Verified escrow safety, active milestone progress).
* **ZK Rising Cyan**: `#7DA0CA` (Emerging talent badge).
* **Status Badges**:
  * *Open / Pending*: Amber `#F59E0B`
  * *Funded / Escrow Locked*: Indigo `#6366F1`
  * *Milestone Released / Completed*: Emerald `#10B981`
  * *Refunded / Cancelled*: Rose `#F43F5E`

---

## 3. Typography Hierarchy

```
Display Headings:   SYNE (Geometric, Avant-Garde Sans)
Body & Interface:   OUTFIT (Modern, Geometric, Highly Legible)
Code & Web3 Hashes: SPACE GROTESK / MONOSPACE
```

### Type Scale
| Element | Font Family | Size | Weight | Line Height | Tracking |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Hero Title** | Syne | `3.0rem (48px)` | Black (900) | `1.1` | `-0.02em` |
| **Section Header (H1)** | Syne | `2.25rem (36px)` | Bold (800) | `1.2` | `-0.015em` |
| **Card Header (H2)** | Syne | `1.5rem (24px)` | SemiBold (700) | `1.3` | `normal` |
| **Subheader (H3)** | Outfit | `1.125rem (18px)` | Medium (500) | `1.4` | `normal` |
| **Body (Regular)** | Outfit | `0.9375rem (15px)`| Regular (400) | `1.6` | `normal` |
| **Captions / Meta** | Space Grotesk | `0.75rem (12px)` | Medium (500) | `1.4` | `+0.05em (wide)` |
| **Wallet Address / Hashes** | Monospace | `0.8125rem (13px)`| Regular (400) | `1.2` | `normal` |

---

## 4. Key UI Components & Layout Systems

### 4.1 The RoleGate (Entry Portal)
* **Layout**: Full-screen viewport (`100vh`) with dual radial gradient orbs (Client Purple on top-left, Freelancer Navy on bottom-right) and a live interactive 60-particle canvas animation.
* **Hero Section**: Dual-color brand title (`Free` in `#DFB6B2`, `Lance` in `#7DA0CA`, `3` in `rgba(255,255,255,0.9)`).
* **Live Telemetry Bar**: Floating frosted glass pill displaying live on-chain platform metrics: Freelancers, Jobs Posted, Completed Jobs, ETH Transacted, and Skills Verified.
* **Interactive Portal Cards**:
  * Side-by-side hover-reactive 3D cards.
  * Micro-animations: On hover, card scales gently (`scale-[0.98]`), inner glow intensifies (`opacity: 1`), and directional arrow triggers `translate-x-1`.

### 4.2 Job Cards & Escrow Milestone Visualizer
* **Structure**:
  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │ [Category Tag]  Senior Solidity Escrow Auditor    [0.85 ETH]   │
  │ Posted by: 0x4f...8a  ·  Deadline: 14 Days  ·  3 Milestones     │
  │ ─────────────────────────────────────────────────────────────── │
  │ Progress: [██████████████░░░░░░░░░] 60% Released                │
  │ Milestone 1: Core Architecture (30%) - [Released ✓]             │
  │ Milestone 2: Formal Verification (30%) - [Under Review ⏳]     │
  │ Milestone 3: Testnet Deployment (40%) - [Locked 🔒]             │
  │ ─────────────────────────────────────────────────────────────── │
  │ Skills: [Solidity ⭐ Gold] [Hardhat] [Security]     [View Job →]│
  └─────────────────────────────────────────────────────────────────┘
  ```
* **Visual States**:
  * Unfunded: Translucent amber badge `Waiting for Deposit`.
  * Escrow Funded: Pulsing emerald shield `0.85 ETH Secured in Escrow`.
  * Deliverable Pending: File attachment icon with clickable preview modal.

### 4.3 AI Skill Verification Terminal (`FreelancerSkillVerify.jsx`)
* **State 1: Skill Selection Grid**:
  * Skill chips for Solidity, React, Node.js, Python, TypeScript, Smart Contracts.
  * Shows earned badge level (Gold, Silver, Bronze) or "Unverified" with attempt counter.
* **State 2: Live Code Challenge**:
  * Split pane: Left pane contains challenge prompt, scenario description, hint accordion, and example inputs/outputs generated by Groq.
  * Right pane contains code editor textarea with syntax font and line number accents.
* **State 3: Evaluation Modal**:
  * Instant feedback overlay detailing pass/fail state, numerical score (0–100), AI commentary, and canonical optimal solution.

### 4.4 Privacy-Preserving ZK Reputation Shield (`FreelancerReputation.jsx`)
* **Holographic Shield Component**:
  * Central shield displaying verified tier emoji (⭐ Expert / 🛡️ Trusted / 📈 Rising).
  * Prominent cryptographic claim banner: *"Cryptographically Proven: Score $\ge 4.5/5.0$ Across $N$ Contracts"*.
  * Copyable proof hash widget with one-click clipboard interaction: `SHA256: 8f4b...39e1`.
  * Explanatory tooltip: *"This proof validates real performance while keeping individual client reviews and raw scores completely private."*

### 4.5 Top Freelancers PageRank Leaderboard (`ClientTopFreelancers.jsx`)
* **Dynamic Filter Bar**: Multi-select skill pills that trigger real-time re-ranking via `/api/ranking/freelancers?skills=...`.
* **Ranking Table / Card Grid**:
  * Rank badge: #1 Gold Ribbon, #2 Silver Ribbon, #3 Bronze Ribbon.
  * Freelancer avatar with ZK status ring.
  * Verified skill chips with badge icons.
  * Multi-factor score breakdown bar: Match % (40pt bar), ZK Points (30pt bar), Activity (20pt bar), PageRank (10pt bar).

---

## 5. Micro-Animations & Motion Design

Defined in `index.css`:
* **Fade In & Slide Up (`animate-fadeInUp`)**:
  ```css
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```
* **Floating Ambient Elements (`animate-float`)**:
  ```css
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  ```
* **Pulse Glow Border (`pulse-glow`)**:
  Used on active escrow contracts and verified gold skill badges to convey high trust.
* **Linear Shimmer Effect (`shimmer`)**:
  Used on loading skeleton cards while fetching on-chain escrow states.

---

## 6. Accessibility & Responsive Breakpoints

* **Target Contrast Ratio**: All body copy meets or exceeds WCAG AA standard ($\ge 4.5:1$ against dark containers).
* **Responsive Breakpoint Matrix**:
  * `sm (640px)`: Single column layouts, collapsible mobile navigation drawer.
  * `md (768px)`: Two-column cards (RoleGate, Job cards, Milestone lists).
  * `lg (1024px)`: Three-column dashboard widgets, side-by-side IDE challenge view.
  * `xl (1280px)`: Full-width data tables and PageRank bipartite graph visualizer.
