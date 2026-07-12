"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (res.ok) {
      router.push("/groups");
      router.refresh();
    } else {
      const data = await res.json();
      setLoading(false);
      alert(data.error || "Failed to login");
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-zinc-50 font-sans">
      {/* Left Side - Visual Presentation */}
      <div className="relative hidden md:flex flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/30 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SplitSmarter</span>
          </div>
          
          <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
            Managing <br />
            shared expenses <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">beautifully.</span>
          </h1>
          <p className="mt-8 text-xl text-zinc-400 font-medium max-w-md">
            Import your messy spreadsheets, automatically catch anomalies, and settle debts with a single click.
          </p>
        </div>
        
        <div className="relative z-10 text-zinc-500 font-medium">
          &copy; {new Date().getFullYear()} SplitSmarter Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Welcome back</h2>
            <p className="text-lg text-zinc-500 font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-200 bg-white focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors font-medium text-zinc-900 placeholder:text-zinc-400 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900 flex justify-between">
                <span>Password</span>
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Forgot?</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-200 bg-white focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors font-medium text-zinc-900 placeholder:text-zinc-400 text-lg"
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-14 text-lg rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_30px_rgb(79,70,229,0.3)] transition-all active:scale-[0.98] mt-4"
              disabled={!email || !password || loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-zinc-500 font-medium text-lg">
            Don't have an account? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
