import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import GroupCardClient from "./GroupCardClient";

const prisma = new PrismaClient();

export default async function GroupsPage() {
  const userId = (await cookies()).get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groupMemberships: {
        include: {
          group: {
            include: { _count: { select: { members: true, expenses: true } } }
          }
        }
      }
    }
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">SplitSmarter</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-r border-zinc-200 pr-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="font-semibold text-zinc-700">{user.name}</span>
          </div>
          <form action="/api/auth" method="POST">
            <input type="hidden" name="_method" value="DELETE" />
            <button formAction={async () => {
              "use server"
              ;(await cookies()).delete("userId");
              redirect("/login");
            }} className="text-zinc-500 font-medium hover:text-rose-600 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Expansive Main Content */}
      <div className="flex-1 w-full px-8 py-12 md:px-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900">Your Groups</h1>
            <p className="text-xl text-zinc-500 mt-2 font-medium">Select a group to manage expenses or create a new one.</p>
          </div>
          <Link href="/" className="px-8 py-4 bg-zinc-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:-translate-y-1">
            + Import CSV
          </Link>
        </div>

        {/* Full-width responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          <Link href="/groups/create" className="group flex flex-col items-center justify-center h-[280px] rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 hover:bg-white hover:border-indigo-400 transition-all hover:shadow-[0_20px_60px_rgb(0,0,0,0.05)] cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <h3 className="font-bold text-xl text-zinc-700 group-hover:text-indigo-600 transition-colors">Create New Group</h3>
            <p className="text-zinc-400 mt-2 font-medium text-center px-6">Start fresh and manually track expenses.</p>
          </Link>

          {user.groupMemberships.map((membership) => (
            <GroupCardClient key={membership.groupId} membership={membership} />
          ))}
        </div>
      </div>
    </main>
  );
}
