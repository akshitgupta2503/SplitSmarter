# SCOPE.md - Anomaly Log & Database Schema

## 1. Database Schema
Our application utilizes a strictly relational database powered by PostgreSQL and Prisma ORM.

### Models:
- **User:** Represents a person (id, name).
- **Group:** Represents a specific household or travel group (id, name).
- **GroupMember:** Junction table representing the many-to-many relationship between Users and Groups. Also includes `joinedAt` and `leftAt` for dynamic tenancy tracking.
- **Expense:** Represents a single parsed line item from the CSV or a manually added group cost.
  - Fields: `amount` (float), `description`, `date`, `currency` (normalized to INR), `splitType`, `notes`, `isIgnored` (boolean flag to preserve ignored anomalies without polluting math).
  - Relationships: Belongs to a Group, has one `paidBy` User, has many `ExpenseSplit` records.
- **ExpenseSplit:** Represents a specific user's share of a specific Expense.
  - Fields: `amount` (exact slice of the cost).
  - Relationships: Belongs to an Expense, belongs to a User.
- **Payment:** Represents a direct settlement between two users. 
  - Fields: `payerId`, `payeeId`, `amount`, `date`.

## 2. Anomaly Log (Deliberate Data Problems)

The `expenses_export.csv` contained extremely messy data. The importer strictly identifies and corrects these:

1. **Foreign Currency (USD)**
   - *Problem:* Row contains USD instead of local currency.
   - *Action:* Automatically intercepts and converts the amount to INR using a fixed exchange rate (1 USD = 83.5 INR) so all math is standardized.
2. **Missing Currency**
   - *Problem:* The currency column is completely blank.
   - *Action:* Defaults to INR.
3. **Invalid/Unparsable Dates**
   - *Problem:* Date is nonsense (e.g. "April 31st").
   - *Action:* Replaced with the current date to preserve the expense.
4. **Number Formatting (Commas)**
   - *Problem:* Amount is stringified with commas (e.g. "1,000").
   - *Action:* Strips commas and parses cleanly to a float.
5. **Precision Issues**
   - *Problem:* Amounts have 3+ decimal places (e.g. "899.995").
   - *Action:* Rounds explicitly to 2 decimal places.
6. **Zero Amounts**
   - *Problem:* The amount is 0.
   - *Action:* Row is marked as `isIgnored = true` in the database and skipped in calculations.
7. **Negative Amounts (Refunds)**
   - *Problem:* The amount is negative.
   - *Action:* Processed as a refund. It properly reduces the balance of the payer and splits.
8. **Settlements logged as Expenses**
   - *Problem:* Direct pay-backs logged as group expenses (e.g. notes say "settlement" or desc says "paid back").
   - *Action:* Converted from an `Expense` to a `Payment` record between the two users.
9. **Duplicates & Conflicts**
   - *Problem:* Exact same event (date + description) logged multiple times, sometimes with different amounts.
   - *Action:* The first chronological occurrence wins. Subsequent duplicates are ignored.
10. **Move-outs (Participant Scope Error)**
    - *Problem:* Meera is included in splits *after* she explicitly moved out (March 31st).
    - *Action:* Meera is surgically excluded from the expense and her share is dynamically redistributed among the remaining active flatmates.
11. **Move-ins (Participant Scope Error)**
    - *Problem:* Sam is included in splits *before* he explicitly moved in (Mid-April).
    - *Action:* Sam is surgically excluded from the expense and his share is dynamically redistributed among the active flatmates.
12. **Conflicting Data Types**
    - *Problem:* `split_type` is marked as EQUAL, but explicit `split_details` are also provided.
    - *Action:* Explicit details always override the basic `split_type`.
13. **Invalid Percentages**
    - *Problem:* Percentage splits do not equal exactly 100%.
    - *Action:* Mathematically normalizes the percentages (e.g., scaling 50/30/10 to their proper weights) so they sum to 100%.
14. **Exact Amount Mismatches**
    - *Problem:* Exact amounts provided in `split_details` do not add up to the total receipt amount.
    - *Action:* Proportionally scales the individual splits up or down so they equal the actual expense total.
