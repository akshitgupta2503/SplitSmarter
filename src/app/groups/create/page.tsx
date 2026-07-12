import { createGroup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateGroupPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 blur-[120px]" />
      
      <div className="relative z-10 max-w-md w-full p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.04)] space-y-8">
        <div className="flex items-center space-x-4 mb-2">
          <Link href="/groups" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Create Group</h1>
            <p className="text-slate-500 text-sm">Start a new shared ledger</p>
          </div>
        </div>

        <form action={createGroup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Group Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Goa Trip 2024"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <Button 
            type="submit"
            className="w-full h-12 text-base rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            Create Group
          </Button>
        </form>
      </div>
    </main>
  );
}
