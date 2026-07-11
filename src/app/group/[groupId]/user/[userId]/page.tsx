import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";

const prisma = new PrismaClient();

export default async function UserBreakdown(props: { params: Promise<{ groupId: string; userId: string }> }) {
  const params = await props.params;
  const { groupId, userId } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return <div>User not found</div>;

  const expensesPaid = await prisma.expense.findMany({
    where: { groupId, paidById: userId, isIgnored: false },
    orderBy: { date: 'desc' }
  });

  const expenseSplits = await prisma.expenseSplit.findMany({
    where: { userId, expense: { groupId, isIgnored: false } },
    include: { expense: { include: { paidBy: true } } },
    orderBy: { expense: { date: 'desc' } }
  });

  const totalPaid = expensesPaid.reduce((sum, ex) => sum + ex.amount, 0);
  const totalOwed = expenseSplits.reduce((sum, sp) => sum + sp.amount, 0);
  const net = totalPaid - totalOwed;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.name}&apos;s Breakdown</h1>
            <p className="text-slate-500 mt-1">
              Net Balance: <span className={`font-bold ${net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : "text-slate-500"}`}>{net > 0 ? "+" : ""}{net.toFixed(2)}</span>
            </p>
          </div>
          <Link href={`/group/${groupId}`} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
            Back to Dashboard
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-green-700">Expenses Paid (₹{totalPaid.toFixed(2)})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {expensesPaid.map(ex => (
                  <li key={ex.id} className="flex justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <p className="font-medium">{ex.description}</p>
                      <p className="text-xs text-slate-500">{format(new Date(ex.date), "MMM d")}</p>
                    </div>
                    <span className="font-bold text-green-600">+₹{ex.amount.toFixed(2)}</span>
                  </li>
                ))}
                {expensesPaid.length === 0 && <p className="text-slate-500 text-sm">No expenses paid.</p>}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-red-700">Shared Costs (₹{totalOwed.toFixed(2)})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {expenseSplits.map(sp => (
                  <li key={sp.id} className="flex justify-between text-sm p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <p className="font-medium">{sp.expense.description}</p>
                      <p className="text-xs text-slate-500">{format(new Date(sp.expense.date), "MMM d")} • Paid by {sp.expense.paidBy?.name || 'Unknown'}</p>
                    </div>
                    <span className="font-bold text-red-600">-₹{sp.amount.toFixed(2)}</span>
                  </li>
                ))}
                {expenseSplits.length === 0 && <p className="text-slate-500 text-sm">No shared costs.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
