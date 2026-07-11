# Shared Expenses App

This is a prototype shared expenses web application built to fulfill the requirements of the product engineering assessment.

## Key Features
- **Intelligent CSV Ingestion**: Imports a deliberately messy CSV file, automatically handling 12 distinct types of data anomalies (duplicates, conflicting splits, move-ins/move-outs, currency conversion, bad dates, and more) according to strict business logic.
- **Group Dashboards**: View net balances for the group, showing exactly who owes whom, minimized through a greedy settlement algorithm.
- **Individual Breakdown**: Click on any user to see a transparent ledger of every expense they paid and every shared cost they are responsible for (No "magic numbers").
- **Import Report**: A transparency log generated immediately after ingestion, detailing exactly what anomalies were found in the CSV and what actions the parser took to correct them.

## Technology Stack
- Next.js (App Router, Server Components, Server Actions)
- Tailwind CSS & shadcn/ui
- Prisma ORM & SQLite (Zero-config relational database)
- Papaparse & date-fns

## Setup Instructions

1. **Prerequisites**: Node.js v18+ installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Database Setup**:
   The app uses a local SQLite database (`dev.db`). Initialize it by running:
   ```bash
   npx prisma migrate dev --name init
   ```
   (Alternatively, run `npx prisma db push` if you have issues with migrations).
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Usage**:
   - Navigate to `http://localhost:3000`.
   - Click "Choose File" and upload the provided `expenses_export.csv`.
   - Wait for the import to complete. You will be redirected to the Group Dashboard.
   - Click on "View Import Report" to see how the data anomalies were handled.
   - Click on individual names to see their exact balance breakdown.

## AI Usage & Decisions
Please review `AI_USAGE.md` for details on how AI was utilized during development, and `DECISIONS.md` for a log of significant engineering and product choices. The exact anomaly handling logic and database schema are documented in `SCOPE.md`.
