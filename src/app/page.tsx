"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch(err => console.error("Not logged in"));
  }, []);

  const handleImport = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/import", {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (data.success) {
      localStorage.setItem("importReport", JSON.stringify(data.anomalies));
      router.push(`/group/${data.groupId}`);
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col bg-zinc-950 font-sans relative overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-rose-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between p-8 relative z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SplitSmarter</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/groups" className="text-zinc-400 font-medium hover:text-white transition-colors">Go to Dashboard</Link>
          {user ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link href="/login" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold backdrop-blur-md transition-all">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-20">
        <div className="text-center mb-12 space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Drop your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
              messy spreadsheet
            </span> here.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            We will parse the chaos, detect anomalies, convert currencies, and instantly calculate exactly who owes who.
          </p>
        </div>

        {/* Huge Dropzone */}
        <div className="w-full max-w-4xl relative group">
          <div className="absolute inset-[-4px] bg-gradient-to-r from-indigo-500 to-rose-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-70 transition duration-500" />
          
          <div className={`relative flex flex-col items-center justify-center w-full min-h-[300px] md:min-h-[400px] rounded-[2rem] border-2 border-dashed transition-all duration-300 overflow-hidden bg-zinc-950/80 backdrop-blur-2xl ${
            dragActive || file ? 'border-indigo-400' : 'border-zinc-700 group-hover:border-indigo-500/50'
          }`}>
            
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDrop={() => setDragActive(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {file ? (
              <div className="flex flex-col items-center space-y-6 p-12 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">{file.name}</h3>
                  <p className="text-zinc-400 font-medium">Ready for analysis. Click below to begin.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 p-12 text-center pointer-events-none">
                <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-800 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">Click or drag file to upload</h3>
                  <p className="text-zinc-400 font-medium">Supports .csv, .xlsx, .xls</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <div className={`mt-10 transition-all duration-500 transform ${file ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
          <Button 
            className="h-16 px-12 text-xl rounded-full font-bold bg-white text-zinc-900 hover:bg-zinc-200 shadow-[0_0_40px_rgb(255,255,255,0.3)] hover:scale-105 transition-all"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="flex items-center space-x-3">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing 10,000+ calculations...
              </span>
            ) : "Analyze Expenses Now"}
          </Button>
        </div>
      </div>
    </main>
  );
}
