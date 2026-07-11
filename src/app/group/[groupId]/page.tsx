import { PrismaClient } from "@prisma/client";
import { getGroupBalances } from "@/lib/balances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";

const prisma = new PrismaClient();

export default async function GroupDashboard(props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  const groupId = params.groupId;

  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) return <div>Group not found</div>;

  const { balances, debts } = await getGroupBalances(groupId);

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { paidBy: true, splits: { include: { user: true } } },
    orderBy: { date: 'desc' }
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{group.name} Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage shared expenses</p>
          </div>
          <Link href={`/group/${groupId}/report`} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
            View Import Report
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Who owes whom?</CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length === 0 ? (
                <p className="text-slate-500">Everyone is settled up!</p>
              ) : (
                <ul className="space-y-3">
                  {debts.map((d, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">{d.fromName}</span>
                      <div className="flex flex-col items-center px-4">
                        <span className="text-sm text-slate-500">owes</span>
                        <span className="font-bold text-red-500">₹{d.amount.toFixed(2)}</span>
                      </div>
                      <span className="font-medium text-slate-700">{d.toName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Individual Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {balances.map(b => (
                  <li key={b.id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                    <Link href={`/group/${groupId}/user/${b.id}`} className="font-medium text-blue-600 hover:underline">
                      {b.name}
                    </Link>
                    <span className={`font-bold ${b.net > 0 ? "text-green-600" : b.net < 0 ? "text-red-600" : "text-slate-400"}`}>
                      {b.net > 0 ? "+" : ""}{b.net.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Paid By</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(ex => (
                    <tr key={ex.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${ex.isIgnored ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">{format(new Date(ex.date), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{ex.description}</td>
                      <td className="px-4 py-3">{ex.paidBy?.name || "Unknown"}</td>
                      <td className="px-4 py-3 font-bold">₹{ex.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {ex.isIgnored ? (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Ignored</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{ex.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
