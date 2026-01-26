"use client"; // Required for useState in Next.js App Router

import { useState } from "react";
import { Menu, X, UserCircle, Settings, LogOut } from "lucide-react";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative">
      <nav className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white shadow-md">
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-blue-700 p-1 rounded-md transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-blue-200 overflow-hidden bg-blue-500">
          <img src="/api/placeholder/40/40" alt="User" className="w-full h-full object-cover" />
        </div>
      </nav>

      {/* Actual Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 shadow-xl rounded-br-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <ul className="py-2 text-gray-700">
            <li className="px-4 py-3 hover:bg-blue-50 flex items-center gap-3 cursor-pointer">
              <UserCircle size={18} /> Profile
            </li>
            <li className="px-4 py-3 hover:bg-blue-50 flex items-center gap-3 cursor-pointer">
              <Settings size={18} /> Settings
            </li>
            <hr className="my-1 border-gray-100" />
            <li className="px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 cursor-pointer">
              <LogOut size={18} /> Logout
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}