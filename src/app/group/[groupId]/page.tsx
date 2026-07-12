import { PrismaClient } from "@prisma/client";
import { getGroupBalances } from "@/lib/balances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { SettleDebtDialog } from "@/components/SettleDebtDialog";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export default async function GroupDashboard(props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  const groupId = params.groupId;

  const userId = (await cookies()).get("userId")?.value;
  let loggedInUser = null;
  if (userId) {
    loggedInUser = await prisma.user.findUnique({ where: { id: userId } });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      expenses: {
        include: { paidBy: true },
        orderBy: { date: "desc" }
      },
      members: {
        include: { user: true }
      }
    }
  });

  if (!group) return <div>Group not found</div>;

  const { balances, debts } = await getGroupBalances(groupId);

  const activeMembers = group.members.filter(m => !m.leftAt).map(m => m.user);
  const allMembers = group.members.map(m => m.user);
  const userIds = allMembers.map(u => u.id);

  const payments = await prisma.payment.findMany({
    where: { payerId: { in: userIds }, payeeId: { in: userIds } },
    include: { payer: true, payee: true }
  });

  // Combine expenses and payments into a single feed
  const feedItems = [
    ...group.expenses.map(ex => ({ ...ex, type: "expense" as const })),
    ...payments.map(p => ({
      id: p.id,
      type: "payment" as const,
      description: "Settled Up",
      amount: p.amount,
      date: p.date,
      notes: p.notes,
      isIgnored: false,
      payerName: p.payer.name,
      payeeName: p.payee.name,
      splitType: "PAYMENT"
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/groups" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">SplitSmarter</span>
          </Link>
          <div className="h-6 w-px bg-zinc-200" />
          <h1 className="text-xl font-bold text-zinc-600">{group.name}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href={`/group/${groupId}/report`} className="px-5 py-2.5 flex items-center bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-700 border-2 border-zinc-200 transition-all hover:border-indigo-300 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Import Report
          </Link>
          <Link href={`/group/${groupId}/settings`} className="px-5 py-2.5 flex items-center bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-700 border-2 border-zinc-200 transition-all hover:border-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </Link>
          <div className="pl-2 border-l border-zinc-200">
            <UserProfileDropdown user={loggedInUser} />
          </div>
        </div>
      </header>

      {/* Main Expansive Content */}
      <div className="flex-1 w-full px-8 py-10 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">Dashboard</h2>
            <p className="text-lg text-zinc-500 mt-2 font-medium">Overview of all group activity and settlements.</p>
          </div>
          <div className="flex space-x-4">
            <SettleDebtDialog groupId={groupId} members={allMembers} />
            <AddExpenseDialog groupId={groupId} members={activeMembers} />
          </div>
        </div>

        {/* 3-Pane Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Pane 1: Individual Balances (col-span-3) */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
              <CardHeader className="pb-4 border-b border-zinc-100">
                <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span>Net Standing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-zinc-100">
                  {balances.map(b => (
                    <li key={b.id} className="flex justify-between items-center p-5 hover:bg-zinc-50 transition-colors">
                      <Link href={`/group/${groupId}/user/${b.id}`} className="font-bold text-zinc-700 hover:text-indigo-600 transition-colors flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm text-zinc-500 uppercase font-black">
                          {b.name.charAt(0)}
                        </div>
                        <span>{b.name}</span>
                      </Link>
                      <div className="text-right">
                        <span className={`block font-black text-lg ${b.net > 0 ? "text-emerald-600" : b.net < 0 ? "text-rose-600" : "text-zinc-400"}`}>
                          {b.net > 0 ? "+" : ""}{b.net.toFixed(2)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {b.net > 0 ? "Gets back" : b.net < 0 ? "Owes" : "Settled"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pane 2: Settlement Path (col-span-4) */}
          <div className="xl:col-span-4 space-y-6">
            <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden relative min-h-[400px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
              <CardHeader className="pb-4 border-b border-zinc-100">
                <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                  </div>
                  <span>Actionable Debts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {debts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-4">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <p className="font-bold text-lg text-zinc-500">Everyone is fully settled!</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {debts.map((d, i) => (
                      <li key={i} className="flex flex-col p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-white hover:border-rose-200 hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-end mb-3 z-10">
                          <span className="font-bold text-zinc-700 text-lg">{d.fromName}</span>
                          <span className="font-black text-rose-600 text-xl">₹{d.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-3 z-10">
                          <div className="h-0.5 flex-1 bg-zinc-200 group-hover:bg-rose-200 transition-colors relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-rose-400 transition-colors" />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Pays To</span>
                          <span className="font-bold text-zinc-700">{d.toName}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pane 3: Expense Ledger Feed (col-span-5) */}
          <div className="xl:col-span-5 space-y-6">
            <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden h-[800px] flex flex-col">
              <CardHeader className="pb-4 border-b border-zinc-100 flex-none bg-white z-10">
                <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <span>Activity Feed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1 bg-zinc-50/50">
                <ul className="divide-y divide-zinc-100">
                  {feedItems.map((ex: any) => (
                    <li key={ex.id} className={`p-6 bg-white hover:bg-zinc-50 transition-colors flex justify-between items-start ${ex.isIgnored ? "opacity-50 grayscale" : ""}`}>
                      <div className="space-y-2 pr-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-zinc-900 text-lg leading-tight">{ex.description}</h4>
                          {ex.isIgnored && (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-zinc-200 text-zinc-500 rounded-md">Ignored</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-zinc-500 font-medium">
                          {ex.type === "payment" ? (
                            <>
                              <span className="text-zinc-800 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">{ex.payerName}</span>
                              <span>paid</span>
                              <span className="text-zinc-800 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">{ex.payeeName}</span>
                            </>
                          ) : (
                            <>
                              <span>Paid by</span>
                              <span className="text-zinc-800 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">{ex.paidBy?.name || "Unknown"}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{format(new Date(ex.date), "MMM d, yyyy")}</span>
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-zinc-400 font-medium bg-zinc-50 p-2 rounded-lg border border-zinc-100 inline-block mt-2">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-none">
                        <span className="block font-black text-2xl text-zinc-900 tracking-tight">
                          {ex.type === "payment" ? (
                            <span className="text-emerald-600">₹{ex.amount.toFixed(2)}</span>
                          ) : (
                            <span>₹{ex.amount.toFixed(2)}</span>
                          )}
                        </span>
                        <span className={`text-[10px] uppercase font-black tracking-widest ${ex.type === "payment" ? "text-emerald-500" : "text-indigo-500"}`}>
                          {ex.splitType}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
