# SplitSmarter - Shared Expenses App

SplitSmarter is a comprehensive, production-ready full-stack application built to effortlessly manage shared flatmate expenses, parse extremely messy CSV data, and rigorously compute actionable debts using the Greedy Debt Simplification Algorithm.

## 🚀 Key Features

### 1. Robust CSV Import Engine (Anomaly Detection)
The core of this application is its highly defensive CSV import engine. It is explicitly designed to handle incomplete, overlapping, and mathematically contradictory data by enforcing strict policies.

The engine runs a 14-point diagnostic on every expense and handles 12+ deliberate data anomalies:
- **Foreign Currencies (USD):** Automatically converts USD to INR at a fixed exchange rate to standardize the mathematical ledger.
- **Duplicates & Conflicts:** Flags and drops identical chronological rows to prevent duplicate charging.
- **Time-Bound Tenancies:** Strictly enforces move-in and move-out dates (e.g., dynamically excluding flatmates from electricity bills dated before they moved in).
- **Settlement Detection:** Identifies text like "settlement" or "paid back" and transforms them from shared group expenses into direct peer-to-peer payments.
- **Formatting Corrections:** Strips commas from numerical values, rounds excessive decimal places, and resolves invalid percentages by mathematically normalizing them to 100%.

### 2. The Import Report (Executive Approval)
Instead of mutating or dropping data silently, the application logs every single automated policy decision. Users can view the **Import Report** to see the exact row number, the issue detected, and the action taken. This features an **Approval Workflow**, allowing users (like Meera) to maintain executive control by explicitly acknowledging or overriding the engine's decisions.

### 3. Widescreen Premium Dashboard
A meticulously crafted UI leveraging Tailwind CSS, `shadcn/ui`, and a modern dark/zinc aesthetic. 
- **Actionable Debts:** Summarizes complex webs of group IOUs into the absolute minimum number of transactions using the Greedy Debt Simplification Algorithm (similar to Splitwise).
- **Itemized Breakdown:** Clicking on any user reveals a deeply granular, two-column breakdown of exactly what they paid vs. what they owe, proving the math down to the exact cent without any "magic numbers."
- **Group Management:** Create, rename, or permanently delete groups natively within the application.

### 4. Technical Architecture
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + `shadcn/ui`
- **Database:** PostgreSQL (Relational) OR SQLite
- **ORM:** Prisma
- **State Management:** React Hooks + Server Actions

## ⚙️ How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup the Database**
   Configure your `.env` file with a valid database URL (PostgreSQL or SQLite), then run the Prisma migrations:
   ```bash
   npx prisma db push
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the App**
   You can login by selecting any of the mock users (e.g., Aisha, Dev, Rohan) to view the system through their perspective.

## 📁 Repository Structure
- `/src/app`: Next.js App Router pages (Dashboard, Reports, User Breakdowns).
- `/src/lib/importer.ts`: The massive, robust parsing engine that processes CSV uploads and generates anomaly reports.
- `/src/lib/balances.ts`: The mathematical engine that processes the Greedy Debt Simplification Algorithm.
- `/src/components`: UI components powered by Tailwind and `shadcn/ui`.
