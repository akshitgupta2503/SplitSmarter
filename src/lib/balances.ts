import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type UserBalance = {
  id: string;
  name: string;
  paid: number;
  owed: number;
  net: number;
};

export type Debt = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

export async function getGroupBalances(groupId: string) {
  const users = await prisma.user.findMany({
    where: { groupMemberships: { some: { groupId } } }
  });

  const balances: Record<string, UserBalance> = {};
  users.forEach(u => {
    balances[u.id] = { id: u.id, name: u.name, paid: 0, owed: 0, net: 0 };
  });

  // Calculate Expenses
  const expenses = await prisma.expense.findMany({
    where: { groupId, isIgnored: false },
    include: { splits: true }
  });

  expenses.forEach(ex => {
    if (ex.paidById && balances[ex.paidById]) {
      balances[ex.paidById].paid += ex.amount;
    }
    ex.splits.forEach(sp => {
      if (balances[sp.userId]) {
        balances[sp.userId].owed += sp.amount;
      }
    });
  });

  // Calculate Payments
  // For the prototype, we assume all payments in DB are relevant to this group
  // To be perfectly strict, payments don't have groupId, so we fetch payments where both payer and payee are in group
  const userIds = users.map(u => u.id);
  const payments = await prisma.payment.findMany({
    where: {
      payerId: { in: userIds },
      payeeId: { in: userIds }
    }
  });

  payments.forEach(p => {
    if (balances[p.payerId]) balances[p.payerId].paid += p.amount;
    if (balances[p.payeeId]) balances[p.payeeId].owed += p.amount; // Effectively reduces their net
  });

  const balancesList = Object.values(balances).map(b => {
    b.paid = Math.round(b.paid * 100) / 100;
    b.owed = Math.round(b.owed * 100) / 100;
    b.net = Math.round((b.paid - b.owed) * 100) / 100;
    return b;
  });

  // Settlement Algorithm
  const debtors = balancesList.filter(b => b.net < -0.01).map(b => ({ ...b, net: Math.abs(b.net) })).sort((a, b) => b.net - a.net);
  const creditors = balancesList.filter(b => b.net > 0.01).sort((a, b) => b.net - a.net);

  const debts: Debt[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const amount = Math.min(debtor.net, creditor.net);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      debts.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: roundedAmount
      });
    }

    debtor.net -= amount;
    creditor.net -= amount;

    if (debtor.net < 0.01) d++;
    if (creditor.net < 0.01) c++;
  }

  return { balances: balancesList, debts };
}
