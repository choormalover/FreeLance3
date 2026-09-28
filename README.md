# FreeLance3

**A decentralized, zero-commission freelancing platform** built on the MST Blockchain. Clients post jobs and lock payment in on-chain milestone escrow, freelancers prove their skills through AI-graded challenges, and reputation is shared as a privacy-preserving proof instead of raw ratings.

Wallet login uses the **BridgeKey** browser extension, and all payments are in **MSTC**, the native coin of the MST Testnet.

---

## Features

| | |
|---|---|
| 🔑 **Wallet login (BridgeKey)** | Sign-in by signing a one-time nonce. No passwords. Each wallet is locked to one role (client or freelancer), chosen by the portal it first connects through. |
| 🔒 **Milestone escrow** | `Escrow.sol` holds the job budget in MSTC and releases it milestone by milestone. Only the client can deposit, release or refund. |
| 🛡️ **ZK-style reputation** | Clients rate freelancers 1–5, but ratings and reviewer identities are never exposed. The public sees only a threshold level (Expert ≥ 4.5, Trusted ≥ 3.5, Rising ≥ 2.5) and an HMAC-SHA256 proof hash. |
| 🎓 **AI skill verification** | Groq (`llama-3.3-70b-versatile`) generates a coding challenge per skill and grades the answer. Max 3 attempts per skill. |
| 📈 **Fair talent ranking** | PageRank over a freelancer ↔ skill graph (damping 0.85, 20 iterations), combined into a composite score: skill match 40 + ZK level 30 + activity 20 + PageRank 10. No paid promotion. |
| 🎨 **Two portals** | Client portal (amethyst palette) and freelancer portal (oceanic blue), with a shared role-selection entry page. |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, ethers.js 6, Axios |
| **Backend** | Node.js, Express 4, MongoDB + Mongoose 9, JWT, bcryptjs, Multer, Cloudinary |
| **AI** | Groq Cloud API (`llama-3.3-70b-versatile`) |
| **Blockchain** | Solidity 0.8.28, Hardhat 2, ethers.js 6, MST Testnet |
| **Wallet** | BridgeKey (EIP-1193 injected provider) |

---

## Project Structure

```
freelance-platform/
├── client/          React frontend (Vite)
│   └── src/
│       ├── pages/        RoleGate, client/* portal, freelancer/* portal
│       ├── components/   Sidebars, ZK badge, trust score, submissions
│       ├── context/      WalletContext (BridgeKey connect + session)
│       ├── hooks/        useEscrow (contract interactions)
│       └── utils/        API client, Escrow ABI
├── server/          Express REST API
│   ├── controllers/      auth, jobs, skills, zk
│   ├── models/           User, Job, Bid, Submission, Rating, ZKProof, SkillVerification, Notification
│   ├── routes/           /api/* route definitions
│   └── middleware/       JWT auth
├── blockchain/      Hardhat project
│   ├── contracts/        Escrow.sol
│   ├── scripts/          deploy.js, evaluation scripts
│   └── test/             Escrow tests
├── prd.md, architecture.md, techstack.md, design.md, roadmap.md
└── req.txt          System requirements and dependency list
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** (developed on Node 22) and npm
- **MongoDB**: a local instance or a MongoDB Atlas cluster
- **BridgeKey** browser extension, with some MSTC testnet coins for escrow deposits
- **Groq API key** for skill verification ([console.groq.com](https://console.groq.com))

See [`req.txt`](req.txt) for the full list.

### 1. Clone and install

```bash
git clone <this-repo-url>
cd freelance-platform

cd server && npm install && cd ..
cd client && npm install && cd ..
cd blockchain && npm install && cd ..
```

### 2. Configure environment variables

Copy each example file and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp blockchain/.env.example blockchain/.env
```

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `ZK_SECRET` | Secret used for reputation proof hashes |
| `GROQ_API_KEY` | Groq API key for skill challenges |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage for work submissions |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:5000/api` |
| `VITE_NETWORK_ID` | MST Testnet chain ID: `91562037` |
| `VITE_ESCROW_ADDRESS` | Deployed `Escrow` contract address |

**`blockchain/.env`**

| Variable | Description |
|---|---|
| `MST_TESTNET_RPC_URL` | `https://testnetrpc.mstblockchain.com` |
| `PRIVATE_KEY` | Deployer wallet private key (testnet only, never commit it) |

### 3. Run locally

In two terminals:

```bash
# Terminal 1: backend on http://localhost:5000
cd server && npm run dev

# Terminal 2: frontend on http://localhost:5173
cd client && npm run dev
```

Open **http://localhost:5173**, pick **Client** or **Freelancer**, and click **Connect Wallet**. The app asks BridgeKey to switch to MST Testnet (adding it if needed), connect your account and sign a login message. Signing is free; it sends no transaction.

> A wallet stays in the portal it first registered through. To use both portals, use two different BridgeKey accounts.

### 4. Smart contract

```bash
cd blockchain
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network mstTestnet
```

Put the deployed address in `client/.env` as `VITE_ESCROW_ADDRESS`.

---

## MST Testnet

| | |
|---|---|
| Network name | MST Testnet |
| Chain ID | `91562037` (`0x5752035`) |
| Currency | MSTC (18 decimals) |
| RPC | https://testnetrpc.mstblockchain.com |
| Explorer | https://mstscan.com |

---

## API Overview

All endpoints are under `/api`. 🔒 = requires `Authorization: Bearer <JWT>`.

| Area | Endpoints |
|---|---|
| **Auth** | `GET /auth/nonce/:walletAddress` · `POST /auth/verify` |
| **Jobs** | `GET /jobs` · `GET /jobs/:id` · 🔒 `POST /jobs` · 🔒 `PUT/DELETE /jobs/:id` · 🔒 `POST /jobs/:id/bid` · 🔒 `POST /jobs/:id/hire` · 🔒 `POST /jobs/:id/milestone` · 🔒 `GET /jobs/my/posted` · 🔒 `GET /jobs/my/bids` |
| **Users** | 🔒 `GET /users/me` · 🔒 `PUT /users/profile` · 🔒 `GET /users/stats` |
| **Submissions** | 🔒 `POST /submissions/:jobId` · 🔒 `GET /submissions/:jobId` · 🔒 `GET /submissions/download/:id` |
| **Skills** | 🔒 `POST /skills/challenge` · 🔒 `POST /skills/submit` · 🔒 `GET /skills/my` · `GET /skills/verified/:freelancerId` |
| **Reputation** | 🔒 `POST /zk/rate` · 🔒 `GET /zk/my-proof` · `GET /zk/proof/:freelancerId` · `GET /trust/:freelancerId` |
| **Discovery** | `GET /ranking/freelancers` · 🔒 `GET /recommendations/jobs` · `GET /platform/stats` |
| **Notifications** | 🔒 `GET /notifications` · 🔒 `PUT /notifications/read` |

Public reputation endpoints never return raw scores, individual reviews or reviewer identities.

---

## Deployment

- **Frontend**: Vercel (`client/vercel.json` rewrites all routes to `index.html` for client-side routing)
- **Backend**: any Node host (e.g. Render). Set the `server/.env` variables in the host's dashboard.

---

## Documentation

- [`prd.md`](prd.md): product requirements
- [`architecture.md`](architecture.md): system architecture and cryptographic design
- [`techstack.md`](techstack.md): technology choices
- [`design.md`](design.md): UI/UX design system
- [`roadmap.md`](roadmap.md): engineering roadmap
