"use client";
import { useState } from "react";
import { Menu, X, UserCircle, Settings, LogOut, Wallet, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-medium">Welcome back</p>
              <p className="text-sm font-bold text-gray-800">User Account</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-brand overflow-hidden bg-gray-100">
              <img src="/api/placeholder/40/40" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </nav>
      </header>

      {/* Full Length Sidebar Menu */}
      <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? "visible" : "invisible"}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            {/* Top Branding Area */}
            <div className="p-6 bg-brand/10 border-b border-brand/20 flex flex-col items-center">
              <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-brand/20">
                <img src="/api/placeholder/64/64" alt="Company Logo" className="rounded-xl" />
              </div>
              <h2 className="text-xl font-black text-gray-800">AJO PRO</h2>
              <p className="text-xs text-brand-dark font-bold uppercase tracking-widest">Enterprise Secured</p>
            </div>

            {/* Menu Items */}
            <ul className="flex-1 py-6 px-4 space-y-2">
              <MenuItem icon={<Wallet size={20}/>} label="My Wallet" active />
              <MenuItem icon={<Users size={20}/>} label="Ajo Groups" />
              <MenuItem icon={<Settings size={20}/>} label="Account Settings" />
              <MenuItem icon={<UserCircle size={20}/>} label="Identity Verification" />
            </ul>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
          
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-[-50px] text-white">
            <X size={32} />
          </button>
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <li className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? "bg-brand text-white shadow-md shadow-brand/30" : "text-gray-600 hover:bg-gray-50 hover:text-brand"}`}>
      {icon} <span className="font-bold">{label}</span>
    </li>
  );
}