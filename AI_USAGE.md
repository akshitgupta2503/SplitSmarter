# AI_USAGE.md

## AI Tools Used
- **Google Antigravity (Gemini 3.1 Pro)**: Used as the primary development collaborator for generating boilerplate, designing the database schema, scaffolding UI components, and reasoning about the complex settlement algorithm.

## Key Prompts Used
1. *"I need a Prisma schema for a shared expenses app. It needs to track Users, Groups, Expenses, and ExpenseSplits. The most important requirement is that 'ExpenseSplits' must store the exact flattened amount a user owes for a specific expense, so there are no magic numbers."*
2. *"Write a CSV parser in TypeScript using papaparse that can handle a messy input. Specifically, I need it to detect duplicate rows using fuzzy matching on the description, and I need it to intercept move-ins and move-outs based on a date threshold."*
3. *"Write a greedy settlement algorithm in TypeScript that takes an array of net balances (positive and negative) and returns a list of peer-to-peer debts (who owes whom) to minimize transactions."*

## Instances Where AI Produced Something Wrong

**Case 1: Date Parsing Assumptions**
- *What AI produced*: The AI initially used `new Date(dateString)` to parse the dates from the CSV.
- *How I caught it*: Upon reviewing the CSV, I noticed dates like `Mar-14` and `04/05/2024`. JavaScript's native `Date` parser behaves unpredictably with these formats, often yielding `Invalid Date` or interpreting `04/05` incorrectly depending on the environment.
- *What I changed*: I explicitly added the `date-fns` library and wrote a custom parser function that intercepts the specific messy formats found in the spreadsheet, falling back to a structured format, rather than relying on native date parsing.

**Case 2: Greedy Settlement with Floats**
- *What AI produced*: The AI wrote the greedy settlement algorithm using standard floats (e.g. `debtor.net -= amount`).
- *How I caught it*: I knew from experience that floating-point arithmetic in JavaScript (`0.1 + 0.2`) leads to precision errors, which would result in infinite loops or micro-debts of `0.00000000001`.
- *What I changed*: I modified the AI's algorithm to strictly round the net balances and transaction amounts to two decimal places at every iteration using `Math.round(amount * 100) / 100` and changed the loop termination condition to check for `< -0.01` and `> 0.01` rather than strictly zero.

**Case 3: Filtering Async Operations**
- *What AI produced*: The AI attempted to filter participants using an async callback: `participants.filter(async p => await checkResidency(p))`.
- *How I caught it*: I realized that `Array.prototype.filter` does not wait for promises. It evaluates the Promise object as truthy, meaning everyone would be included regardless of the residency check.
- *What I changed*: I rewrote the filtering logic to use a traditional `for...of` loop, awaiting the database query for each participant before conditionally pushing them into an `activeParticipants` array.
