"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Anomaly } from "@/lib/importer";
import { useParams } from "next/navigation";

export default function ImportReport() {
  const params = useParams();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("importReport");
    if (data) {
      setAnomalies(JSON.parse(data));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Import Report</h1>
            <p className="text-slate-500 mt-1">{anomalies.length} data anomalies detected and resolved</p>
          </div>
          <Link href={`/group/${params.groupId}`} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition">
            Back to Dashboard
          </Link>
        </header>

        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle>Anomaly Log (SCOPE.md preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg w-16">Row</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Issue Detected</th>
                    <th className="px-4 py-3 rounded-tr-lg">Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-slate-500">{a.row}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{a.description}</td>
                      <td className="px-4 py-3 text-red-600">{a.issue}</td>
                      <td className="px-4 py-3 text-green-700">{a.actionTaken}</td>
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
