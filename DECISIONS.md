# DECISIONS.md

## Decision Log

### 1. Framework & Tech Stack
**Options Considered:**
- React + Node.js Express + MongoDB (MERN)
- Next.js (App Router) + SQLite via Prisma
- Vue.js + Firebase

**Decision:** Next.js (App Router) + SQLite via Prisma.
**Reason:** The project has a strict 2-day timeline. Next.js provides a unified frontend and backend in one repository, vastly accelerating development. Prisma with SQLite requires zero separate database setup (no Docker, no external hosting required for evaluation), making it highly portable for the reviewer. Furthermore, relational databases were explicitly mandated by the requirements.

### 2. CSV Parsing & Anomaly Logic Placement
**Options Considered:**
- Process CSV on the client-side, send clean JSON to the server.
- Send raw CSV to the server, parse and handle anomalies on the backend.

**Decision:** Send raw CSV to the server and process it in a dedicated backend library (`src/lib/importer.ts`).
**Reason:** The anomaly resolution rules (like checking DB for existing users to map "Dev's friend Kabir" to Dev) require database context. Keeping this logic on the server ensures data integrity and keeps the frontend lightweight. The server responds with the `ImportReport` which the UI then caches and displays.

### 3. Database Schema for Splits ("No Magic Numbers")
**Options Considered:**
- Store only the `Expense` and calculate the splits on the fly via a JSON field `split_details`.
- Store `Expense` and a relational table `ExpenseSplit` with pre-calculated, concrete amounts for each user per expense.

**Decision:** Store pre-calculated, concrete amounts in `ExpenseSplit`.
**Reason:** Rohan explicitly requested: "If the app says I owe ₹2,300, I want to see exactly which expenses make that up." Calculating all percentages, shares, and USD-to-INR conversions at import time and saving the exact numeric value into `ExpenseSplit` ensures that the user can query the database directly to see exactly what they owe, eliminating runtime "magic" calculations. 

### 4. Handling Move-ins and Move-outs
**Options Considered:**
- Only apply "Equal" splits to users listed explicitly in `split_with`.
- Determine residency dynamically based on the expense `date` and the `GroupMember` timeline.

**Decision:** Dynamic residency checks.
**Reason:** Sam explicitly asked: "Why would March electricity affect my balance?". The system enforces a strict temporal check. If an expense is dated in April, and Meera left in March, the system will explicitly intercept the inclusion of Meera, flag it as an anomaly, and re-distribute the cost among the *actual* active residents at that time.

### 5. Settlement Algorithm
**Options Considered:**
- Keep a ledger of exact debts based on who paid for what. (If A pays for B, B owes A).
- Use a global net balance and a greedy settlement algorithm to minimize transactions.

**Decision:** Global net balance with a greedy settlement algorithm.
**Reason:** Aisha requested: "I just want one number per person. Who pays whom, how much, done." The greedy algorithm calculates net balances (Paid - Owed) and iteratively matches the biggest debtors with the biggest creditors. This minimizes the number of transactions required to settle the group.

### 6. USD to INR Conversion
**Options Considered:**
- Keep multiple currency balances (e.g., A owes B 100 INR and 20 USD).
- Convert at runtime based on an API.
- Convert at import time using a fixed or provided rate.

**Decision:** Convert at import time using a fixed prototype rate (1 USD = 83 INR).
**Reason:** Priya requested accurate conversion. Keeping multiple currencies complicates the "one number per person" settlement rule. Converting to a base currency at the time of the transaction (or import, for historical data) provides a single, unified ledger. The original USD amount is preserved in the notes for transparency.
