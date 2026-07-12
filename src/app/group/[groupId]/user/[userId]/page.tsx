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

  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true }
  });
  const groupUserIds = groupMembers.map(m => m.userId);

  const expensesPaid = await prisma.expense.findMany({
    where: { groupId, paidById: userId, isIgnored: false },
    orderBy: { date: 'desc' }
  });

  const expenseSplits = await prisma.expenseSplit.findMany({
    where: { userId, expense: { groupId, isIgnored: false } },
    include: { expense: { include: { paidBy: true } } },
    orderBy: { expense: { date: 'desc' } }
  });

  const paymentsPaid = await prisma.payment.findMany({
    where: { payerId: userId, payeeId: { in: groupUserIds } },
    include: { payee: true },
    orderBy: { date: 'desc' }
  });

  const paymentsReceived = await prisma.payment.findMany({
    where: { payeeId: userId, payerId: { in: groupUserIds } },
    include: { payer: true },
    orderBy: { date: 'desc' }
  });

  const totalExpensesPaid = expensesPaid.reduce((sum, ex) => sum + ex.amount, 0);
  const totalPaymentsPaid = paymentsPaid.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = totalExpensesPaid + totalPaymentsPaid;

  const totalSharedCosts = expenseSplits.reduce((sum, sp) => sum + sp.amount, 0);
  const totalPaymentsReceived = paymentsReceived.reduce((sum, p) => sum + p.amount, 0);
  const totalOwed = totalSharedCosts + totalPaymentsReceived;
  
  const net = totalPaid - totalOwed;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="w-full bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href={`/group/${groupId}`} className="flex items-center space-x-2 text-zinc-500 hover:text-indigo-600 transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 w-full px-8 py-12 md:px-16 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900">{user.name}&apos;s Itemized Breakdown</h1>
            <p className="text-xl text-zinc-500 mt-2 font-medium">No magic numbers. Every cent accounted for.</p>
          </div>
          <div className="bg-white px-8 py-6 rounded-3xl border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-right">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Net Standing</p>
            <p className={`text-4xl font-black tracking-tight ${net > 0 ? "text-emerald-600" : net < 0 ? "text-rose-600" : "text-zinc-400"}`}>
              {net > 0 ? "+" : ""}{net.toFixed(2)}
            </p>
            <p className="text-sm font-bold text-zinc-400 mt-1">
              (Total Paid ₹{totalPaid.toFixed(2)} - Total Owed ₹{totalOwed.toFixed(2)})
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: What they paid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center text-emerald-600">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
              </span>
              What {user.name} Paid (₹{totalPaid.toFixed(2)})
            </h2>
            
            <Card className="rounded-[2rem] border-2 border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
              <CardContent className="p-0">
                <ul className="divide-y divide-zinc-100">
                  {expensesPaid.map(ex => (
                    <li key={`ex-${ex.id}`} className="flex justify-between items-center p-6 hover:bg-emerald-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900 text-lg">{ex.description}</p>
                        <p className="text-sm font-medium text-zinc-500 mt-1">{format(new Date(ex.date), "MMM d, yyyy")} • Group Expense</p>
                      </div>
                      <span className="font-black text-emerald-600 text-xl">+₹{ex.amount.toFixed(2)}</span>
                    </li>
                  ))}
                  {paymentsPaid.map(p => (
                    <li key={`pay-${p.id}`} className="flex justify-between items-center p-6 hover:bg-emerald-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900 text-lg">Settled with {p.payee.name}</p>
                        <p className="text-sm font-medium text-zinc-500 mt-1">{format(new Date(p.date), "MMM d, yyyy")} • Payment</p>
                      </div>
                      <span className="font-black text-emerald-600 text-xl">+₹{p.amount.toFixed(2)}</span>
                    </li>
                  ))}
                  {expensesPaid.length === 0 && paymentsPaid.length === 0 && (
                    <li className="p-8 text-center text-zinc-400 font-medium">No payments made.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: What they owe */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center text-rose-600">
              <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
              </span>
              What {user.name} Owes (₹{totalOwed.toFixed(2)})
            </h2>
            
            <Card className="rounded-[2rem] border-2 border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
              <CardContent className="p-0">
                <ul className="divide-y divide-zinc-100">
                  {expenseSplits.map(sp => (
                    <li key={`sp-${sp.id}`} className="flex justify-between items-center p-6 hover:bg-rose-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900 text-lg">{sp.expense.description}</p>
                        <p className="text-sm font-medium text-zinc-500 mt-1">{format(new Date(sp.expense.date), "MMM d, yyyy")} • Paid by {sp.expense.paidBy?.name || 'Unknown'}</p>
                      </div>
                      <span className="font-black text-rose-600 text-xl">-₹{sp.amount.toFixed(2)}</span>
                    </li>
                  ))}
                  {paymentsReceived.map(p => (
                    <li key={`rec-${p.id}`} className="flex justify-between items-center p-6 hover:bg-rose-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900 text-lg">Received from {p.payer.name}</p>
                        <p className="text-sm font-medium text-zinc-500 mt-1">{format(new Date(p.date), "MMM d, yyyy")} • Refund/Settlement</p>
                      </div>
                      <span className="font-black text-rose-600 text-xl">-₹{p.amount.toFixed(2)}</span>
                    </li>
                  ))}
                  {expenseSplits.length === 0 && paymentsReceived.length === 0 && (
                    <li className="p-8 text-center text-zinc-400 font-medium">No shared costs.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
