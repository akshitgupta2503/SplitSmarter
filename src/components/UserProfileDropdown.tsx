"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserProfileDropdown({ user }: { user: { name: string, email: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!user) {
    return (
      <button 
        onClick={() => router.push("/login")}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-sm"
      >
        Sign In
      </button>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
