# DECISIONS.md - Architectural & Product Decision Log

## 1. Settlement Math Algorithm
**Decision:** Implement the "Greedy Debt Simplification Algorithm" for all user balances.
- **Options Considered:** 
  1. *Direct ledger tracking:* Tracking exactly who owes whom for every specific bill (results in a messy web of micro-debts where A owes B, B owes C, C owes A).
  2. *Greedy Simplification:* Pool all debts into Net Balances (+ or -), and sequentially match the largest debtors with the largest creditors.
- **Why I chose this:** This is the industry standard (used by Splitwise). It mathematically guarantees the absolute minimum number of transactions necessary for everyone to settle up. Flatmates don't care *who* pays them for a specific pizza, they just care that their total `Net Balance` returns to zero.

## 2. Handling CSV Anomalies & Bad Data
**Decision:** Intercept anomalies using strict hardcoded logic in a centralized `importer.ts` engine, and generate a user-facing "Import Report" for approval.
- **Options Considered:**
  1. *Fail and reject the CSV:* Too frustrating for users if 1 typo blocks the entire upload.
  2. *Silently fix the data:* Dangerous. If we secretly change a user's expense from USD to INR or drop a duplicate, they lose trust in the math.
  3. *Fix and Flag (Chosen):* Automatically enforce corrective policies (e.g. converting currency, dropping duplicates), but output an Anomaly Log requiring explicitly user review and approval.
- **Why I chose this:** Meera explicitly requested "I want to approve anything the app deletes or changes." This creates a perfect balance of automated intelligence and executive user control.

## 3. Database Schema Design (Ignored Flags vs Deletions)
**Decision:** Keep discarded rows (e.g., duplicates, zero amounts) in the `Expense` table but flag them as `isIgnored: true`.
- **Options Considered:**
  1. *Completely drop the row from DB:* Clean database, but if the user disagrees with the deletion (e.g. they want to restore a duplicate), the data is gone forever.
  2. *Flag as ignored:* Keeps the original data intact, but explicitly excludes it from math queries (e.g. `where: { isIgnored: false }`).
- **Why I chose this:** Safest approach. Allows us to render the "Import Report" directly from the database and potentially allow users to "Restore" ignored records in the future.

## 4. UI/UX Paradigm
**Decision:** Widescreen "Premium SaaS" aesthetic using Tailwind CSS and Shadcn UI.
- **Options Considered:**
  1. *Basic MVP layout:* Simple centered cards, white background, functional but plain.
  2. *Premium Widescreen (Chosen):* Edge-to-edge layout, deep Zinc/Indigo color palette, micro-animations, glassmorphic headers.
- **Why I chose this:** A core requirement was to "Wow" the judges and build an app that feels like a modern startup, not a weekend homework assignment.

## 5. Tenancy Time-Bounding
**Decision:** Explicitly checking every expense date against user residency dates (e.g., Meera's move-out, Sam's move-in).
- **Options Considered:**
  1. *Global static groups:* Everyone pays for everything regardless of dates.
  2. *Dynamic time-bounding (Chosen):* `importer.ts` verifies `expense.date` against known move-in/move-out horizons.
- **Why I chose this:** Satisfies specific complaints by Sam and Meera regarding being charged for electricity/groceries when they didn't live in the flat.
