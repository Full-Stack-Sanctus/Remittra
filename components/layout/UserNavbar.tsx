"use client";
import { useState } from "react";
import { Menu, X, UserCircle, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Correct way to sign out in Supabase
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) throw error;

      // Close menu, clear cache, and redirect
      setIsOpen(false);
      router.push("/"); 
      router.refresh(); 
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white shadow-lg">
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-blue-700 p-2 rounded-md transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-blue-200 overflow-hidden bg-blue-500">
          <img 
            src="/api/placeholder/40/40" 
            alt="User" 
            className="w-full h-full object-cover" 
          />
        </div>
      </nav>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close menu when clicking outside */}
          <div 
            className="fixed inset-0 bg-black/5 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 shadow-xl rounded-br-lg z-50 animate-in slide-in-from-top-1 duration-200">
            <ul className="py-2 text-gray-700">
              <li className="px-4 py-3 hover:bg-blue-50 flex items-center gap-3 cursor-pointer transition-colors">
                <UserCircle size={18} className="text-blue-600" /> Profile
              </li>
              <li className="px-4 py-3 hover:bg-blue-50 flex items-center gap-3 cursor-pointer transition-colors">
                <Settings size={18} className="text-blue-600" /> Settings
              </li>
              <hr className="my-1 border-gray-100" />
              <li 
                onClick={handleLogout} 
                className="px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 cursor-pointer transition-colors"
              >
                <LogOut size={18} /> Logout
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
}