# System Architecture Document
## Project: FreeLance3 (Decentralized Web3 Freelance Platform)
**Document Version:** 1.0.0  
**Target Architecture:** Hybrid On-Chain / Off-Chain Microservices  

---

## 1. High-Level Architecture Overview

FreeLance3 utilizes a tiered architecture designed to isolate concerns, minimize on-chain transaction costs, preserve user privacy, and ensure maximum performance:

```mermaid
graph TD
    subgraph ClientLayer [Client Presentation Layer - React 19 + Vite]
        UI_RoleGate[RoleGate Entrypoint]
        UI_Client[Client Portal: Jobs, Escrow, Top Freelancers]
        UI_Freelancer[Freelancer Portal: Verification, Bids, Recommendations]
        Web3_Provider[EIP-1193 / MetaMask Provider]
    end

    subgraph APILayer [Application Services - Node.js / Express]
        API_Gateway[Express REST Gateway & JWT Auth]
        Controller_Job[Job & Bid Management]
        Controller_ZK[ZK Reputation Engine]
        Controller_Skill[AI Skill Verification Controller]
        Controller_Ranking[PageRank & Graph Engine]
    end

    subgraph AIService [AI Inference Engine]
        Groq_API[Groq Cloud: Llama-3.3-70b-versatile]
    end

    subgraph DataStore [Persistence Layer]
        MongoDB[(MongoDB Atlas: Users, Jobs, Bids, Proofs)]
        Cloudinary[(Cloud Storage: Deliverables & Portfolios)]
    end

    subgraph BlockchainLayer [On-Chain Layer - Ethereum / EVM]
        Escrow_Factory[Job Escrow Factory]
        Escrow_Contract[Escrow.sol Instance]
        Client_Wallet[Client EOA Wallet]
        Freelancer_Wallet[Freelancer EOA Wallet]
    end

    UI_Client -->|HTTP / REST| API_Gateway
    UI_Freelancer -->|HTTP / REST| API_Gateway
    UI_Client -->|Ethers.js Transactions| Escrow_Contract
    UI_Freelancer -->|Sign Messages| Web3_Provider
    Web3_Provider -->|Ethers.js| BlockchainLayer

    API_Gateway --> Controller_Job
    API_Gateway --> Controller_ZK
    API_Gateway --> Controller_Skill
    API_Gateway --> Controller_Ranking

    Controller_Skill -->|HTTP Prompts| Groq_API
    Controller_Job --> MongoDB
    Controller_ZK --> MongoDB
    Controller_Ranking --> MongoDB

    Client_Wallet -->|1. deposit ETH| Escrow_Contract
    Client_Wallet -->|2. releaseMilestone| Escrow_Contract
    Escrow_Contract -->|3. Transfer ETH| Freelancer_Wallet
```

---

## 2. Smart Contract Escrow Architecture

Each hired engagement deploys or binds to an isolated instance of `Escrow.sol`. This guarantees non-custodial custody of funds without relying on platform treasury wallets.

### 2.1 Escrow State Machine
```mermaid
stateDiagram-v2
    [*] --> Initialized: Constructor(freelancer, jobId)
    Initialized --> Funded: deposit() with msg.value > 0
    Funded --> MilestoneReleased: releaseMilestone(percentage)
    MilestoneReleased --> MilestoneReleased: releaseMilestone(next_percentage)
    MilestoneReleased --> Completed: address(this).balance == 0
    Funded --> Refunded: refund() [by client if unspent]
    MilestoneReleased --> Refunded: refund() [remaining balance]
    Completed --> [*]
    Refunded --> [*]
```

### 2.2 Contract Specification (`Escrow.sol`)
* **State Variables**:
  * `address public client`: Address with authority to deposit, release, and refund.
  * `address public freelancer`: Beneficiary recipient of milestone funds.
  * `uint256 public totalAmount`: Total ETH deposited upfront.
  * `uint256 public totalReleased`: Cumulative ETH transferred to freelancer.
  * `bool public isRefunded`: Flag preventing double refunds or releases post-cancellation.
  * `string public jobId`: Cross-reference string to MongoDB `Job._id`.
* **Methods**:
  * `deposit() external payable onlyClient notRefunded`: Locks funds upfront; requires `msg.value > 0` and `totalAmount == 0`.
  * `releaseMilestone(uint256 percentage) external onlyClient notRefunded`: Calculates `(totalAmount * percentage) / 100`, verifies `address(this).balance >= milestoneAmount`, updates `totalReleased`, and invokes safe low-level `.call{value: milestoneAmount}("")`.
  * `refund() external onlyClient notRefunded`: Empties remaining contract balance back to the client.
  * `getStatus()`: Returns full escrow state tuple for instant frontend reconciliation.
* **Security & Gas Profile**:
  * Adheres strictly to **Checks-Effects-Interactions** to prevent reentrancy attacks.
  * Reentrancy guard semantics embedded via state update preceding `.call`.
  * Typical deployment gas: ~340,000 gas; `releaseMilestone`: ~38,000 gas.

---

## 3. Cryptographic Zero-Knowledge (ZK) Reputation System

Traditional reviews suffer from **retaliation bias**, **private data leaks**, and **centralized censorship**. FreeLance3 employs a privacy-preserving cryptographic reputation protocol:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as Backend ZK Controller
    participant DB as MongoDB (Private Partition)
    participant ZK as ZK Proof Engine
    actor Freelancer
    actor Public as Public Observer

    Client->>API: POST /api/zk/rate (jobId, score: 1-5, review)
    API->>DB: Upsert Private Rating Record
    API->>ZK: computePrivateScore(freelancerId)
    Note over ZK: Weighted average over historical ratings:<br/>Weight = 1 + (i / N)
    ZK->>ZK: Evaluate highest threshold (Expert >= 4.5, Trusted >= 3.5, Rising >= 2.5)
    ZK->>ZK: Generate SHA-256 HMAC Proof Hash:<br/>Hash(freelancerId : score : secret : timestamp)
    ZK->>DB: Save Public Proof (proofHash, verifiedLevel, emoji, publicStatement)
    API-->>Client: 200 OK (Proof Updated)

    Freelancer->>API: GET /api/zk/my-proof
    API-->>Freelancer: Full Private Data (Avg Score, Total Count, Met Thresholds)

    Public->>API: GET /api/zk/proof/:freelancerId
    API-->>Public: Public Proof ONLY (Level: "Expert ⭐", proofHash: "0x8f4b...")
    Note over Public: Raw score, client identity, and reviews remain 100% hidden!
```

### 3.1 Reputation Tiers & Thresholds
| Tier Name | Minimum Score ($\tau$) | Visual Badge | Public Meaning | Trust Points Awarded |
| :--- | :---: | :---: | :--- | :---: |
| **Expert** | $\ge 4.5$ | ⭐ Gold | Exceptional top-tier delivery history | 40 pts |
| **Trusted** | $\ge 3.5$ | 🛡️ Emerald | Reliable, consistent high-quality execution | 28 pts |
| **Rising** | $\ge 2.5$ | 📈 Cyan | Early career momentum & validated delivery | 16 pts |
| **None** | $< 2.5$ | ◌ Neutral | New or unrated profile | 0 pts |

### 3.2 Performance & Benchmarks (from `measureProof.js`)
* **Sample Runs:** 1,000 iterations.
* **Proof Format:** 64-character hex SHA-256 digest (32 bytes binary).
* **Generation Latency:** $\approx 0.005\text{ ms}$ (under 6 microseconds), enabling instantaneous real-time recalculation upon every completed rating.

---

## 4. AI-Powered Skill Verification & Badging Pipeline

FreeLance3 eliminates credential fraud through automated, on-demand AI technical challenges powered by **Groq Cloud** running `llama-3.3-70b-versatile`.

```mermaid
sequenceDiagram
    autonumber
    actor Freelancer
    participant ClientApp as React Client
    participant API as Express Skill Controller
    participant Groq as Groq LPU (Llama-3.3-70b)
    participant DB as MongoDB (SkillVerification)

    Freelancer->>ClientApp: Select Skill (e.g., "Solidity") & Click "Take Challenge"
    ClientApp->>API: POST /api/skills/challenge { skill: "Solidity" }
    API->>DB: Check existing passed verification or attempt limit
    API->>Groq: Request Challenge JSON Prompt
    Note over Groq: Generates coding scenario,<br/>requirements, hint, and test parameters
    Groq-->>API: JSON: { question, hint, exampleInput, exampleOutput }
    API->>DB: Upsert SkillVerification (status: "pending", attemptCount: 0)
    API-->>ClientApp: Return challenge
    ClientApp-->>Freelancer: Display IDE challenge & live timer

    Freelancer->>ClientApp: Writes code & submits solution
    ClientApp->>API: POST /api/skills/submit { skill, answer }
    API->>Groq: Evaluate solution against problem criteria
    Note over Groq: Evaluates syntax, algorithmic logic,<br/>edge cases, and style
    Groq-->>API: JSON: { passed: true/false, score: 0-100, feedback, correct_approach }
    API->>DB: Update status, aiFeedback, verifiedAt, badgeLevel
    API-->>ClientApp: Return evaluation result & badge unlocked
```

### 4.1 Badging Logic & Multipliers
* **Gold Badge ($\ge 90$%)**: 3x multiplier in bipartite PageRank weight and $+3$ bonus in Trust Score.
* **Silver Badge ($75 - 89$%)**: 2x multiplier in PageRank and $+2$ bonus in Trust Score.
* **Bronze Badge ($60 - 74$%)**: 1x base weight.
* **Failure ($< 60$%)**: Increments `attemptCount`. Hard cap of 3 attempts per skill to prevent brute-force exploitation.

---

## 5. Bipartite Graph PageRank & Matching Engine

To prevent "pay-to-win" placement and discover genuine competence, FreeLance3 models the platform as a **bipartite directed graph** $G = (V, E)$:

### 5.1 Graph Definition
* **Vertices ($V$):**
  $$V = V_{\text{freelancers}} \cup V_{\text{skills}}$$
* **Edges ($E$):**
  * Directed edge from Freelancer $u$ to Skill $s$ with weight $W(u \to s) \in \{1, 2, 3\}$ corresponding to Bronze, Silver, or Gold badge.
  * Reverse directed edge from Skill $s$ to Freelancer $u$ with weight $0.5 \times W(u \to s)$ representing domain authority back-propagation.

### 5.2 PageRank Formulation
Iterative calculation over 20 cycles with damping factor $d = 0.85$:
$$PR^{(t+1)}(v) = \frac{1 - d}{|V|} + d \sum_{u \in \text{In}(v)} PR^{(t)}(u) \frac{W(u \to v)}{\sum_{w \in \text{Out}(u)} W(u \to w)}$$

### 5.3 Composite Talent Score Breakdown (0–100 Points)
For any client query with required skills $\{s_1, s_2, \dots, s_k\}$:
1. **Skill Match Score ($S_{\text{match}}$, Max 40 pts):**
   $$S_{\text{match}} = \min\left(40, \left(\frac{|\text{Matched Verified Skills}|}{k} \times 40\right) + 3 \cdot N_{\text{gold}} + 2 \cdot N_{\text{silver}}\right)$$
2. **ZK Reputation Score ($S_{\text{zk}}$, Max 30 pts):**
   * Expert: 30 pts | Trusted: 20 pts | Rising: 10 pts | None: 0 pts
3. **Platform Activity Score ($S_{\text{act}}$, Max 20 pts):**
   $$S_{\text{act}} = \min(20, \; 5 \times \text{JobsCompleted} + 1 \times \text{BidCount})$$
4. **PageRank Authority Score ($S_{\text{pr}}$, Max 10 pts):**
   $$S_{\text{pr}} = \min(10, \; PR(u) \times 1000)$$
5. **Total Score:**
   $$\text{Total Score} = S_{\text{match}} + S_{\text{zk}} + S_{\text{act}} + S_{\text{pr}}$$

---

## 6. Data Architecture & MongoDB Schemas

```mermaid
erDiagram
    USER ||--o{ JOB : posts
    USER ||--o{ BID : submits
    USER ||--o{ SUBMISSION : uploads
    USER ||--o{ SKILL_VERIFICATION : verifies
    USER ||--o{ ZK_PROOF : possesses
    USER ||--o{ RATING : receives
    USER ||--o{ NOTIFICATION : receives
    JOB ||--o{ BID : receives
    JOB ||--o{ SUBMISSION : tracks
    JOB ||--o{ RATING : rated_on

    USER {
        ObjectId _id PK
        string walletAddress UK
        string nonce
        string username
        string email UK
        string password
        string role "client | freelancer"
        string[] skills
        date createdAt
    }

    JOB {
        ObjectId _id PK
        ObjectId client FK
        string title
        string description
        string[] skills
        number budget
        date deadline
        Milestone[] milestones
        string status "open | in_progress | completed | cancelled"
        ObjectId hiredFreelancer FK
        string escrowAddress
        number paymentProgress
        date createdAt
    }

    BID {
        ObjectId _id PK
        ObjectId job FK
        ObjectId freelancer FK
        number amount
        string proposal
        number deliveryDays
        string status "pending | accepted | rejected"
        date createdAt
    }

    SKILL_VERIFICATION {
        ObjectId _id PK
        ObjectId freelancer FK
        string skill
        string status "pending | passed | failed"
        string challenge
        string submittedAnswer
        string aiFeedback
        number attemptCount
        date verifiedAt
    }

    ZK_PROOF {
        ObjectId _id PK
        ObjectId freelancer FK
        string proofHash
        number threshold
        boolean verified
        string verifiedLevel "Expert | Trusted | Rising | None"
        string publicStatement
        date verifiedAt
    }
```

---

## 7. Security Architecture & Threat Mitigations

| Threat Vector | Attack Mechanism | FreeLance3 Defense / Mitigation |
| :--- | :--- | :--- |
| **Smart Contract Reentrancy** | Malicious freelancer contract recursively calling `releaseMilestone` during external call. | Checks-Effects-Interactions pattern adhered to in `Escrow.sol`; contract balance and `totalReleased` updated before external transfer. |
| **Escrow Drain by Unauthorized Actor** | Rogue address invoking `releaseMilestone` or `refund`. | Strict modifier `onlyClient` requiring `msg.sender == client`. |
| **Sybil Attack on Skill Verification** | Automated scripts spamming random code submissions to guess answers. | Hard cap of 3 attempts per skill (`attemptCount >= 3` check); AI evaluation checks semantic reasoning rather than literal substring match. |
| **Reputation Tampering** | Manipulating public reputation level in transit. | Public proof contains `proofHash = SHA256(freelancerId : score : secret : timestamp)`. Server-side HMAC validation prevents clients from spoofing tiers. |
| **Credential Hijacking** | Stealing session tokens. | JWT tokens signed with HS256 and stored in secure memory/session; passwords hashed with salted Bcrypt. Web3 auth uses random dynamic nonces to prevent replay attacks. |
