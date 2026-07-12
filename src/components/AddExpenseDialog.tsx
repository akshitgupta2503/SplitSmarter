"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addManualExpense } from "@/app/actions";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
}

export function AddExpenseDialog({ groupId, members }: { groupId: string, members: User[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [splitType, setSplitType] = useState("EQUAL");
  const [splitDetails, setSplitDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addManualExpense(groupId, desc, parseFloat(amount), payerId, splitType, splitDetails);
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all h-10 px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">New Expense</DialogTitle>
          <DialogDescription>Add a new expense manually. Supported splits: Equal, Percentage, Share, Unequal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input required value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Dinner at Marina Bites" className="rounded-xl bg-slate-50 border-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="rounded-xl bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select value={payerId} onValueChange={(val) => val && setPayerId(val)} required>
                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Split Type</Label>
            <Select value={splitType} onValueChange={(val) => val && setSplitType(val)}>
              <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">Equal Split</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="SHARE">Shares (e.g. 2 shares, 1 share)</SelectItem>
                <SelectItem value="UNEQUAL">Unequal (Exact Amounts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {splitType !== "EQUAL" && (
            <div className="space-y-2">
              <Label>Split Details</Label>
              <Input 
                required 
                value={splitDetails} 
                onChange={e => setSplitDetails(e.target.value)} 
                placeholder={splitType === "PERCENTAGE" ? "Rohan 30; Aisha 70" : "Rohan 2; Aisha 1"} 
                className="rounded-xl bg-slate-50 border-slate-200 font-mono text-sm" 
              />
              <p className="text-xs text-slate-400">Format: Name Value; Name Value</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-12 text-base rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all">
            {loading ? "Adding..." : "Save Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
