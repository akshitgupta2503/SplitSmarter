"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Anomaly } from "@/lib/importer";
import { useParams } from "next/navigation";

export default function ImportReport() {
  const params = useParams();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [approvedRows, setApprovedRows] = useState<Set<number>>(new Set());

  const toggleApproval = (index: number) => {
    setApprovedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  useEffect(() => {
    const data = localStorage.getItem("importReport");
    if (data) {
      setAnomalies(JSON.parse(data));
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-rose-500/10 blur-[120px] rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

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
          <h1 className="text-xl font-bold text-zinc-600">Import Report</h1>
        </div>
        
        <Link href={`/group/${params.groupId}`} className="px-5 py-2.5 flex items-center bg-zinc-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-5xl font-black tracking-tight text-zinc-900 flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mr-4">
                Import Report
              </span>
            </h2>
            <p className="text-xl text-zinc-500 mt-2 font-medium">
              We parsed your messy spreadsheet and made automated corrections.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border-2 border-zinc-100 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-black text-xl">
              {anomalies.length - approvedRows.size}
            </div>
            <span className="font-bold text-zinc-600 leading-tight">Pending<br/>Approvals</span>
          </div>
        </div>

        <Card className="rounded-[2rem] border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-100 bg-zinc-50/50">
            <CardTitle className="text-xl font-black text-zinc-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <span>Anomaly Resolution Log</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-100/50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest w-24">Row</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Issue Detected</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Action Taken</th>
                    <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {anomalies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-zinc-500 font-medium">No anomalies were found. Your data is perfect!</p>
                      </td>
                    </tr>
                  ) : anomalies.map((a, i) => {
                    const isApproved = approvedRows.has(i);
                    return (
                    <tr key={i} className={`transition-colors group ${isApproved ? 'bg-emerald-50/30 opacity-75' : 'hover:bg-zinc-50/80'}`}>
                      <td className="px-6 py-5">
                        <span className={`font-mono text-sm font-bold px-2 py-1 rounded-md ${isApproved ? 'text-emerald-500 bg-emerald-100' : 'text-zinc-400 bg-zinc-100'}`}>
                          #{a.row}
                        </span>
                      </td>
                      <td className={`px-6 py-5 font-bold ${isApproved ? 'text-emerald-700' : 'text-zinc-700'}`}>{a.description}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${isApproved ? 'bg-emerald-100/50 text-emerald-600/70' : 'bg-rose-100 text-rose-700'}`}>
                          {a.issue}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {a.actionTaken}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => toggleApproval(i)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            isApproved 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-white border-2 border-zinc-200 text-zinc-600 hover:border-indigo-600 hover:text-indigo-600'
                          }`}
                        >
                          {isApproved ? '✓ Approved' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
