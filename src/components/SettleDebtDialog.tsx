"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settleDebt } from "@/app/actions";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
}

export function SettleDebtDialog({ groupId, members }: { groupId: string, members: User[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [payerId, setPayerId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payerId === payeeId) return alert("Payer and Payee cannot be the same");
    
    setLoading(true);
    await settleDebt(groupId, payerId, payeeId, parseFloat(amount));
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-bold rounded-xl shadow-sm transition-all h-10 px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Settle Up
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Record Payment</DialogTitle>
          <DialogDescription>Record a manual peer-to-peer payment to settle balances.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Who paid?</Label>
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

          <div className="space-y-2">
            <Label>Who received the money?</Label>
            <Select value={payeeId} onValueChange={(val) => val && setPayeeId(val)} required>
              <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select payee" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="rounded-xl bg-slate-50 border-slate-200" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all mt-4">
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
