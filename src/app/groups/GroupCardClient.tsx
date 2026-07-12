"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { renameGroup, deleteGroup } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function GroupCardClient({ membership }: { membership: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(membership.group.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    setIsLoading(true);
    await renameGroup(membership.groupId, newName);
    setIsLoading(false);
    setIsRenameOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await deleteGroup(membership.groupId);
    setIsLoading(false);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div 
        className="relative group h-[280px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/group/${membership.groupId}`} className="block h-full">
          <Card className="h-full rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white hover:-translate-y-2 hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all cursor-pointer overflow-hidden flex flex-col relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <CardHeader className="pb-4 flex-none z-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <CardTitle className="text-2xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors pr-16 truncate">
                {membership.group.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end z-10">
              <p className="text-zinc-500 font-medium mb-6">Joined {format(new Date(membership.joinedAt), "MMMM d, yyyy")}</p>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-zinc-700 bg-zinc-100 px-4 py-2 rounded-xl">
                  <span className="text-zinc-500">Members:</span>
                  <span>{membership.group._count.members}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-zinc-700 bg-zinc-100 px-4 py-2 rounded-xl">
                  <span className="text-zinc-500">Expenses:</span>
                  <span>{membership.group._count.expenses}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Action Buttons inside relative container but outside link so clicking them doesn't navigate */}
        <div className={`absolute top-6 right-6 flex items-center space-x-2 transition-opacity duration-200 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRenameOpen(true); }}
            className="w-10 h-10 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 flex items-center justify-center transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeleteOpen(true); }}
            className="w-10 h-10 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Group Name" 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename} disabled={isLoading || !newName.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? All expenses, payments, and members will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
