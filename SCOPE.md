# SCOPE.md

## Database Schema

We use a relational database (SQLite via Prisma) with the following core entities:

- **User**: Represents a member of the group (e.g., Aisha, Rohan).
- **Group**: A logical container for expenses (e.g., "Flatmates").
- **GroupMember**: Tracks when a user joined and left the group, which helps in determining if they should be included in "equal" splits.
- **Expense**: A recorded expense. Contains total amount, base currency (INR), date, payer, split type, and flags for ignored anomalies (like duplicates).
- **ExpenseSplit**: The exact calculated amount a specific user owes for a given expense. This "flattens" all split types (equal, percentage, shares, exact) into concrete numbers, answering Rohan's requirement ("no magic numbers").
- **Payment**: Peer-to-peer settlements (e.g., "Rohan paid Aisha back").

## Data Anomalies & Handling Log

The provided `expenses_export.csv` was deliberately messy. Here is the anomaly log outlining the problems detected and the rules implemented in our parser to handle them automatically during import:

1. **Duplicate Entries**: 
   - *Problem*: "Dinner at Marina Bites" and "dinner - marina bites" by Dev on the same day for 3200 INR.
   - *Action*: The parser hashes the normalized description, amount, date, and payer. If an exact match is found, the subsequent entry is inserted into the database but flagged with `isIgnored: true`. It does not affect balances, fulfilling Meera's requirement.

2. **Number Formatting Issues**: 
   - *Problem*: Commas in amounts (e.g., `1,200 INR`) and extreme precision (`899.995`).
   - *Action*: The parser strips commas. All amounts are parsed as floats and rounded strictly to 2 decimal places before being saved.

3. **Missing/Inconsistent Names**: 
   - *Problem*: "priya", "Priya S" instead of Priya. Missing payer for "House cleaning supplies".
   - *Action*: Names are trimmed and Title Cased. "Priya S" is explicitly mapped to "Priya". Missing payers are temporarily mapped to "Unknown" so the import doesn't crash.

4. **Settlements Logged as Expenses**: 
   - *Problem*: "Rohan paid Aisha back" (5000 INR) was logged as an expense.
   - *Action*: Detected via keywords ("paid back", "settlement"). The importer redirects these entries to create `Payment` records instead of `Expense` records.

5. **Missing Currency**: 
   - *Problem*: Groceries DMart (2105) by Priya had no currency.
   - *Action*: Detected and defaulted to the base currency, INR.

6. **Invalid Percentages**: 
   - *Problem*: Pizza Friday was split 30%, 30%, 30%, 20% (Sums to 110%).
   - *Action*: The parser detects the invalid sum and normalizes the percentages proportionally (e.g., each 30% becomes `30/110`) so they equal 100%, and logs this action.

7. **Unregistered Users**: 
   - *Problem*: "Dev's friend Kabir" is not a standard flatmate.
   - *Action*: When parsed, the system maps Kabir's financial burden to the inviter, Dev. Dev is held accountable for this share.

8. **Messy Dates**: 
   - *Problem*: Dates like `Mar-14` and `04/05/2024`.
   - *Action*: We use `date-fns` and regex fallbacks. `04/05` is parsed assuming standard US `MM/DD/YYYY` logic as April 5th, which aligns with notes. 

9. **Currency Conversion (Priya's Request)**: 
   - *Problem*: USD expenses mixed with INR.
   - *Action*: Converted to INR at a fixed prototype exchange rate of 1 USD = 83 INR. The base amount in the DB is stored as INR, but the original USD amount is appended to the notes.

10. **Zero or Negative Amounts**: 
    - *Problem*: 0 INR for a Swiggy order, -30 USD for a parasailing refund.
    - *Action*: 0 INR is ignored entirely. The -30 USD refund decreases the total amount, and is split normally, effectively crediting the participants.

11. **User Scope (Move-ins/Move-outs) (Sam's Request)**: 
    - *Problem*: Meera moved out end of March, Sam moved in mid-April. But Meera is on the April groceries split.
    - *Action*: The importer checks the expense date against the user's active residency timeline. If a user is included in a split after they moved out, they are removed from the participant pool, and the cost is equally redistributed among the actual active residents.

12. **Conflicting Data**: 
    - *Problem*: `split_type` is "equal" but explicit `split_details` (shares) are provided.
    - *Action*: Explicit `split_details` are treated as the source of truth, overriding the generic "equal" flag.

This logic ensures the CSV is ingested completely, intelligently addressing the messy reality of shared spreadsheets without human pre-processing.
