"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Shared Expenses</h1>
        <p className="text-slate-300 text-center">Import your CSV to get started.</p>
        
        <div className="space-y-4">
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
          />
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-bold py-3"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? "Importing & Analyzing..." : "Import Expenses"}
          </Button>
        </div>
      </div>
    </main>
  );
}
