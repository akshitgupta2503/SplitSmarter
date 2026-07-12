import { PrismaClient } from "@prisma/client";
import { addMemberToGroup, removeMemberFromGroup } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function GroupSettings(props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  const groupId = params.groupId;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" }
      }
    }
  });

  if (!group) return <div>Group not found</div>;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
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
        
        <Link href={`/group/${groupId}`} className="px-5 py-2.5 flex items-center bg-zinc-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-black tracking-tight text-zinc-900">Group Settings</h2>
          <p className="text-xl text-zinc-500 mt-2 font-medium">Manage group members and configuration.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-100">
                <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  </div>
                  <span>Add New Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-zinc-500 font-medium mb-6">Invite someone new to the group. They will be able to add expenses and view settlements.</p>
                <form action={async (formData) => {
                  "use server"
                  const name = formData.get("name") as string;
                  if (name) await addMemberToGroup(groupId, name);
                }} className="flex flex-col space-y-4">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter member's name..."
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-200 bg-zinc-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400 text-lg"
                  />
                  <Button type="submit" className="h-14 w-full rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_20px_rgb(79,70,229,0.25)] transition-all text-lg">
                    Add Member
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-7 space-y-6">
            <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-100">
                <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <span>Current Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-zinc-100">
                  {group.members.map(m => (
                    <li key={m.id} className="flex justify-between items-center p-6 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${m.leftAt ? 'bg-zinc-100 text-zinc-400' : 'bg-gradient-to-br from-indigo-500 to-rose-500 text-white shadow-md'}`}>
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-black text-lg ${m.leftAt ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{m.user.name}</p>
                          {m.leftAt ? (
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-500 uppercase tracking-widest">
                              Moved Out
                            </span>
                          ) : (
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                              Active Member
                            </span>
                          )}
                        </div>
                      </div>
                      {!m.leftAt && (
                        <form action={async () => {
                          "use server"
                          await removeMemberFromGroup(groupId, m.userId);
                        }}>
                          <Button type="submit" variant="ghost" className="h-10 px-4 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors">
                            Remove
                          </Button>
                        </form>
                      )}
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
