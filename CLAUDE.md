# CLAUDE.md — Developer & AI Agent Operations Manual
## Project: FreeLance3 (Decentralized Web3 Freelancing Platform)
**Last Updated:** Current Production Baseline  
**Maintainer:** FreeLance3 Core Team  

---

## 1. Project Overview & Architecture

**FreeLance3** is an open-source decentralized freelance platform designed to replace legacy high-commission marketplaces (Upwork, Fiverr) with zero-fee, non-custodial smart contracts and cryptographic reputation.

### Core Innovations
1. **Smart Contract Milestone Escrow**: Milestone tranches deployed on-chain (`Escrow.sol`). Funds are locked upfront in ETH and released deterministically upon milestone approval.
2. **Privacy-Preserving ZK Reputation**: Clients rate freelancers (1–5), but raw scores and client identities are cryptographically sealed. Only verified threshold commitments (Expert $\ge 4.5$, Trusted $\ge 3.5$, Rising $\ge 2.5$) and SHA-256 HMAC proof hashes are exposed publicly.
3. **AI-Powered Skill Challenges**: Groq Cloud running `llama-3.3-70b-versatile` synthesizes dynamic coding tests and automatically grades solutions, issuing Gold ($\ge 90$), Silver ($\ge 75$), and Bronze ($\ge 60$) verified badges.
4. **Bipartite Graph PageRank**: Open mathematical ranking algorithm that calculates freelancer authority and matches talent to client jobs without pay-to-promote bias.

---

## 2. Workspace & Directory Structure

```
freelance-platform/
├── blockchain/               # Smart contract workspace (Hardhat 3 Beta)
│   ├── contracts/            # Solidity contracts (Escrow.sol)
│   ├── ignition/             # Hardhat Ignition deployment modules
│   ├── test/                 # Solidity & Node.js native test runner suites
│   ├── hardhat.config.js     # Hardhat 3 config (viem, node:test, Sepolia)
│   └── package.json
│
├── client/                   # Frontend workspace (React 19 + Vite + Tailwind v4)
│   ├── src/
│   │   ├── pages/            # RoleGate, client portal, freelancer portal
│   │   │   ├── client/       # Client dashboards, job post, job detail, top talent
│   │   │   └── freelancer/   # Bids, recommendations, skill verify, reputation
│   │   ├── components/       # Shared UI components, modals, navbar, cards
│   │   ├── context/          # Auth and Web3 state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper utilities and Ethers contract bindings
│   │   ├── index.css         # Custom tokens (Dual theme: Purple vs Blue, glassmorphism)
│   │   └── App.jsx           # Route declarations
│   ├── vite.config.js        # Vite 8 config with @tailwindcss/vite
│   └── package.json
│
├── server/                   # Backend REST API workspace (Node.js + Express)
│   ├── controllers/          # authController, jobController, skillController, zkController
│   ├── middleware/           # authMiddleware (JWT verification)
│   ├── models/               # Mongoose schemas (User, Job, Bid, Submission, ZKProof, SkillVerification, Rating)
│   ├── routes/               # API routes (/auth, /jobs, /skills, /zk, /ranking, /trust, /recommendations)
│   ├── measureProof.js       # ZK reputation benchmark test runner
│   ├── server.js             # Express entry point (port 5000)
│   └── package.json
│
├── prd.md                    # Product Requirements Document
├── techstack.md              # Technology Stack Specifications
├── architecture.md           # System Architecture & Cryptographic Specs
├── design.md                 # UI/UX Design System & Color Tokens
├── roadmap.md                # 2026-2027 Engineering Roadmap
└── claude.md                 # Claude Developer & Agent Operations Manual (this file)
```

---

## 3. Developer Quick-Start & Commands

### 3.1 Client (`/client`)
```bash
cd client
npm install              # Install dependencies (React 19, Tailwind 4, Ethers 6)
npm run dev              # Launch local Vite dev server at http://localhost:5173
npm run lint             # Execute ESLint 9 checks
npm run build            # Compile production assets into /client/dist
npm run preview          # Preview production build locally
```

### 3.2 Server (`/server`)
```bash
cd server
npm install              # Install dependencies (Express, Mongoose 9, JWT)
npm run dev              # Launch development server with Nodemon on port 5000
npm start                # Run production Node.js server
node measureProof.js     # Run 1,000-iteration ZK benchmark test
```

### 3.3 Blockchain (`/blockchain`)
```bash
cd blockchain
npm install              # Install Hardhat 3 Beta and dependencies
npx hardhat compile      # Compile Solidity contracts (^0.8.28)
npx hardhat test         # Run all unit & integration tests (Solidity + node:test)
npx hardhat test solidity # Run only Solidity native tests
npx hardhat test nodejs   # Run only TypeScript/Node.js tests using viem
npx hardhat ignition deploy ignition/modules/Counter.ts   # Deploy locally
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts # Deploy to Sepolia
```

---

## 4. Key Subsystems & Implementation Rules

### 4.1 Smart Contract Escrow (`Escrow.sol`)
* **File**: `blockchain/contracts/Escrow.sol`
* **Authority**: Strict `onlyClient` modifier controls `deposit`, `releaseMilestone`, and `refund`.
* **Checks-Effects-Interactions**: Always modify storage (`totalReleased += milestoneAmount`) *before* invoking external transfer `.call{value: milestoneAmount}("")`.
* **State Check**: Ensure contract is `notRefunded` before allowing milestone releases.

### 4.2 AI Skill Verification Pipeline (`skillController.js`)
* **File**: `server/controllers/skillController.js`
* **LLM Engine**: Groq Cloud API (`llama-3.3-70b-versatile`).
* **Generation**: Generates unique coding challenges with expected test criteria.
* **Evaluation**: Returns JSON `{ "passed": boolean, "score": number, "feedback": string, "correct_approach": string }`.
* **Rate Limiting**: Enforce maximum of 3 attempts (`verification.attemptCount >= 3`).

### 4.3 Privacy-Preserving ZK Reputation (`zkController.js`)
* **File**: `server/controllers/zkController.js`
* **Zero Score Leakage**: Public endpoints (`GET /api/zk/proof/:freelancerId`) must **never** return raw numeric ratings, individual reviews, or reviewer identities.
* **Commitment**: SHA-256 HMAC hash over `freelancerId : score : secret : timestamp`.
* **Thresholds**:
  * Expert: $\ge 4.5$ (⭐ Gold)
  * Trusted: $\ge 3.5$ (🛡️ Emerald)
  * Rising: $\ge 2.5$ (📈 Cyan)

### 4.4 Graph PageRank & Talent Matching (`ranking.js`)
* **File**: `server/routes/ranking.js`
* **Graph**: Bipartite graph with Freelancer and Skill nodes.
* **Damping Factor**: $0.85$ over $20$ iterations.
* **Composite Talent Score**:
  $$\text{Composite Score} = \text{Skill Match (40 pts)} + \text{ZK Level (30 pts)} + \text{Activity (20 pts)} + \text{PageRank (10 pts)}$$

---

## 5. UI/UX & Design Guidelines

* **Dual-Portal Palettes**:
  * **Client Portal (`/client/*`)**: Imperial Amethyst (`--c-bg: #190019`, `--c-accent: #854F6C`, `--c-light: #DFB6B2`, `--c-lightest: #FBE4D8`).
  * **Freelancer Portal (`/freelancer/*`)**: Cyber Oceanic Blue (`--f-bg: #021024`, `--f-accent: #7DA0CA`, `--f-light: #C1E8FF`).
* **Typography**: Headings use `Syne, sans-serif`, body copy uses `Outfit, sans-serif`, and hashes/metrics use `Space Grotesk, sans-serif`.
* **Glassmorphism**: Use `.glass-card` (`backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08)`).
* **Entry Point**: `RoleGate.jsx` with real-time particle animation on canvas and live platform telemetry.

---

## 6. Environment Configuration

### Client (`client/.env`)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
```

### Server (`server/.env`)
```bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/freelance3
JWT_SECRET=your_jwt_secret_here
ZK_SECRET=freelance3_zk_secret
GROQ_API_KEY=gsk_your_groq_api_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Blockchain (`blockchain/.env`)
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
SEPOLIA_PRIVATE_KEY=0x_your_sepolia_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

---

## 7. Guidelines for AI Assistants & Contributors

1. **Do Not Dilute Security**: Keep smart contract access strictly limited to `onlyClient` and maintain Checks-Effects-Interactions.
2. **Preserve Privacy Guarantees**: Never expose private rating collections or client IDs via public API responses.
3. **Maintain Visual Fidelity**: Ensure newly added components adhere to the dual-palette design tokens and typography hierarchy.
4. **Test Before Deployment**: Always compile contracts with `npx hardhat compile` and run tests with `npx hardhat test` when modifying blockchain code.
