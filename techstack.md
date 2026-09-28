# Technology Stack Document (TechStack)
## Project: FreeLance3 (Decentralized Web3 Freelance Platform)
**Document Version:** 1.0.0  
**Last Updated:** Current Production Baseline  

---

## 1. Stack Overview & Technology Matrix

FreeLance3 employs a hybrid **Web3/Web2 architecture**: high-speed off-chain services (React 19, Express, MongoDB, Groq AI) handle real-time interactions, graph calculations, and AI evaluations, while on-chain smart contracts (Solidity, Ethereum/EVM) govern custody of funds, milestone escrow logic, and immutable state transitions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   React 19  ·  Vite  ·  TailwindCSS v4  ·  React Router v7  ·  Ethers  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION API LAYER                           │
│   Node.js  ·  Express v4  ·  Mongoose v9  ·  JWT / Auth  ·  Multer     │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
     ┌───────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
     │  DATABASE & STORE │ │ AI VERIFICATION  │ │ CRYPTO / BLOCKCHAIN │
     │  MongoDB Atlas    │ │ Groq Cloud API   │ │ Solidity 0.8.28     │
     │  Mongoose ODM     │ │ Llama-3.3-70b    │ │ Hardhat 3 Beta      │
     │  Cloudinary / S3  │ │ Fast Inference   │ │ Viem / Ethers.js    │
     └───────────────────┘ └──────────────────┘ └─────────────────────┘
```

---

## 2. Frontend Layer

### 2.1 Core Framework & Tooling
* **React 19 (`^19.2.4`)**: Selected for the latest concurrent rendering features, action hooks, clean ref patterns, and optimal DOM update throughput.
* **Vite (`^8.0.4`) & `@vitejs/plugin-react` (`^6.0.1`)**: Lightning-fast build tool leveraging native ES modules for sub-millisecond Hot Module Replacement (HMR) and optimized Rollup production bundling.
* **React Router DOM (`^7.14.0`)**: Modern client-side declarative routing providing layout nesting, dynamic route params (e.g. `/client/job/:id`, `/freelancer/job/:id`), and programmatic redirection (`RoleGate.jsx`).

### 2.2 Styling & Design Tokens
* **TailwindCSS (`^4.2.2`) via `@tailwindcss/vite`**: The next-generation CSS compiler engine featuring zero-config `@import "tailwindcss"`, instant compilation, and custom CSS custom properties (CSS variables).
* **Vanilla CSS Design Tokens (`index.css`)**:
  * Dual-portal palette: Client Purple (`--c-bg: #190019`, `--c-accent: #854F6C`) vs Freelancer Cyber Blue (`--f-bg: #021024`, `--f-accent: #7DA0CA`).
  * Custom Glassmorphism utility: `.glass-card` with `backdrop-filter: blur(20px)` and subtle alpha borders.
  * Canvas particle dynamic physics background for high-tech Web3 aesthetic.
* **Typography**:
  * Display / Headings: **Syne** (`font-family: 'Syne', sans-serif`) — avant-garde geometric sans.
  * Body / UI: **Outfit** (`font-family: 'Outfit', sans-serif`) — clean legibility for dense data tables.
  * Code / Numbers: **Space Grotesk** / Monospace.

### 2.3 Web3 & Network Utilities
* **Ethers.js (`^6.16.0`)**: Lightweight, robust library for connecting to Ethereum wallets (MetaMask / EIP-1193), signing transactions, estimating gas, invoking escrow methods, and decoding blockchain events.
* **Axios (`^1.15.0`)**: Promise-based HTTP client equipped with interceptors for JWT token injection and standardized error normalization.

---

## 3. Backend & API Services Layer

### 3.1 Server Runtime & Routing
* **Node.js (v20+ LTS recommended)**: High-throughput asynchronous event-driven JavaScript runtime.
* **Express (`^4.22.1`)**: Minimalist, battle-tested web framework providing declarative route modularity (`/routes/auth`, `/routes/jobs`, `/routes/skills`, `/routes/zk`, `/routes/ranking`, `/routes/trust`, `/routes/platform`).
* **CORS (`^2.8.6`)**: Configured for cross-origin security between local/remote frontend domains and API endpoints.
* **Dotenv (`^17.4.2`)**: Robust environment variable management across deployment stages.

### 3.2 Data Persistence & Object Modeling
* **MongoDB (v6.0+)**: Schema-flexible document database ideally suited for complex nested milestone arrays, dynamic job tags, and graph adjacency lists.
* **Mongoose (`^9.4.1`)**: Strictly typed ODM layer ensuring data validation, unique compound indexing (`{ freelancer: 1, skill: 1 }`), and virtual population across collections.
* **Multer (`^2.1.1`) & Cloudinary (`^2.9.0`)**: Multi-part form parser and cloud media storage for handling client project briefs, freelancer deliverable zip files, and portfolio assets.

### 3.3 Security & Cryptographic Core
* **JSON Web Token (`jsonwebtoken ^9.0.3`)**: Stateless authentication mechanism delivering signed Bearer tokens containing user ID and authorization role claims.
* **Bcryptjs (`^3.0.3`)**: Adaptive cryptographic password hashing utilizing salted Blowfish encryption.
* **Node.js Native `crypto` Module**:
  * SHA-256 HMAC digest generator for Zero-Knowledge Reputation Proof commitments (`proofHash`).
  * Nonce generation for wallet signature challenges (`crypto.randomBytes`).

---

## 4. Blockchain & Smart Contract Layer

### 4.1 Smart Contracts
* **Solidity (`^0.8.28`)**: Latest stable Solidity compiler release featuring:
  * Native arithmetic overflow/underflow protection.
  * Custom errors for gas-efficient reverts (`require` with custom messages).
  * Explicit address and memory layout controls.
* **Core Contract: `Escrow.sol`**:
  * Roles: `client` and `freelancer` immutable addresses.
  * Funds: Upfront ETH `deposit()`.
  * Milestones: Percentile tranche releases via `releaseMilestone(percentage)`.
  * Cancellation: Client-side `refund()` transferring unspent contract balance back to client.

### 4.2 Web3 Development Environment
* **Hardhat 3 Beta**: Next-generation Ethereum development environment:
  * Native integration with Node.js test runner (`node:test`) for ultra-low latency unit tests.
  * Built-in support for **Viem** (`viem`) and Hardhat Keystore for encrypted private key handling.
  * Hardhat Ignition (`ignition/modules/`) for deterministic, replayable smart contract deployments.
* **Supported Networks**:
  * Local: Hardhat Simulated EVM / Local Node (`http://127.0.0.1:8545`).
  * Testnet: Ethereum Sepolia Testnet (Chain ID: `11155111`).
  * Target L2s: Arbitrum One / Optimism / Base (for sub-cent gas fees in production).

---

## 5. AI & Algorithmic Engines

### 5.1 AI Skill Verification: Groq Cloud API
* **Engine / Model**: `llama-3.3-70b-versatile` hosted on Groq's Tensor Streaming Processor (LPU) architecture.
* **Key Advantage**: Sub-second token generation latency (~250–350 tokens/sec), ensuring that candidates taking technical challenges experience zero UI lag.
* **Workload**:
  1. *Challenge Synthesizer*: Generates unique coding problems, requirements, hints, and expected inputs/outputs based on candidate target skill.
  2. *Automated Grader*: Evaluates candidate code solutions, determines binary pass/fail, calculates percentage score (0–100), and provides constructive technical feedback and the optimal canonical approach.

### 5.2 Algorithmic Talent Graph (PageRank)
* **Mathematical Solver**: Custom iterative PageRank algorithm implemented in JavaScript (`ranking.js`).
* **Parameters**:
  * Damping Factor ($\alpha$): `0.85`.
  * Convergence: `20` iterations across the bipartite graph nodes (freelancers + verified skill tags).
  * Weighted Directed Edges: Freelancer $\leftrightarrow$ Skill edges weighted by badge level (Gold: 3, Silver: 2, Bronze: 1).
* **Composite Ranking Formula**:
  * 40% Verified Skill Overlap
  * 30% ZK Reputation Tier
  * 20% Verified Platform Activity & Completed Contracts
  * 10% PageRank Centrality

---

## 6. Development & Deployment Tooling

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Package Manager** | `npm` (v10+) | Dependency locking and workspace resolution |
| **Dev Server (Client)** | Vite 8 HMR | Instant local UI feedback |
| **Dev Server (API)** | Nodemon (`^3.1.14`) | Auto-reloading Express server on code updates |
| **Linting & Quality** | ESLint 9 (`@eslint/js`, React hooks plugin) | Code consistency and static analysis |
| **Hosting (Client)** | Vercel (`vercel.json` configured) | Global edge CDN distribution |
| **Hosting (API)** | Render / Railway / AWS EC2 | Persistent Node.js container runtime |
| **Database Cloud** | MongoDB Atlas | Managed cloud database with automated backups |
| **Smart Contract Verification** | Etherscan API / Hardhat Verify | Public source code transparency on block explorers |

---

## 7. Environment Variables Architecture

### Client (`/client/.env`)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
```

### Server (`/server/.env`)
```bash
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/freelance3
JWT_SECRET=super_secret_jwt_key_here
ZK_SECRET=freelance3_zk_cryptographic_secret
GROQ_API_KEY=gsk_your_groq_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Blockchain (`/blockchain/.env`)
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
SEPOLIA_PRIVATE_KEY=0x_your_deployment_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```
