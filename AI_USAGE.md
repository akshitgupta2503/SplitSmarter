# AI_USAGE.md - AI Tooling & Correction Log

## AI Tools Used
- **Google Antigravity:** Served as the primary autonomous agent/pair-programmer for building the entire Next.js MVP. 

## Key Prompts Used
- *"Build a beautiful widescreen Premium SaaS dashboard for a shared expenses app that displays actionable debts."*
- *"Implement an importer script that parses a messy CSV and corrects foreign currency, duplicates, and invalid percentages."*
- *"Rohan: 'No magic numbers. If the app says I owe ₹2,300, I want to see exactly which expenses make that up.' this condition is satisfying ?"*
- *"Sam: 'I moved in mid-April. Why would March electricity affect my balance?'"*
- *"Meera: 'Clean up the duplicates — but I want to approve anything the app deletes or changes.'"*

## AI Mistakes & Human Corrections

While the AI successfully handled 95% of the codebase, it made a few critical logical mistakes requiring manual intervention/course-correction:

### 1. The Missing Group Membership Bug (Database Relation)
- **What the AI did wrong:** When importing users from the CSV (e.g. creating Dev, Aisha, Rohan), the AI correctly created the `User` models in Prisma, but it failed to connect them to the specific `GroupMember` junction table linking them to the currently active group. 
- **How I caught it:** I noticed that the entire "Net Standings" and "Actionable Debts" dashboard was rendering completely blank, despite the database showing hundreds of valid parsed `Expense` rows.
- **How I fixed it:** I prompted the AI to investigate why the list was blank. It ran a debug script, discovered that `user.groupMemberships` was empty, and I explicitly instructed it to modify `importer.ts` to attach users to the group. We then ran a retroactive JS patch script to insert the missing group relationships for existing users.

### 2. PowerShell String Interpolation Syntax Error
- **What the AI did wrong:** The AI attempted to append two Server Actions (`renameGroup` and `deleteGroup`) to `src/app/actions.ts` using a PowerShell `@"..."@` string block. However, it failed to properly escape the template literal `` \`/group/${groupId}\` ``, resulting in PowerShell evaluating it and writing `revalidatePath(/group/\);` into the file, completely breaking the Next.js build.
- **How I caught it:** The Next.js dev server immediately crashed with a fatal syntax error: `Expected unicode escape`. I relayed the exact build error log to the AI.
- **How I fixed it:** I instructed the AI to stop using generic bash/PowerShell commands to edit files and instead use its direct file-writing tools (`replace_file_content`). It fixed the broken line and the dev server hot-reloaded successfully.

### 3. Missing Tenancy Check for Move-ins (Sam)
- **What the AI did wrong:** I gave the AI the explicit prompt about Sam: *"Sam: I moved in mid-April. Why would March electricity affect my balance?"*. The AI correctly identified that it needed to filter out Sam for expenses prior to April 15. However, while it wrote the `const isSamHere` boolean, it initially completely forgot to write the `else if` block to actually use that boolean to exclude him in the loop!
- **How I caught it:** I reviewed the `importer.ts` logic and noticed that only Meera (move-out) was being filtered from the active participants list; Sam's logic was missing.
- **How I fixed it:** I pointed out the missing condition. The AI then updated `importer.ts` with the proper `else if` block to exclude him, and wrote a secondary background script (`fixSam.js`) to retroactively delete Sam from all March/early-April expenses and recalculate the splits for the remaining flatmates.
