"use client";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext"; // Import your hook
import { MENU_ITEMS } from "@/constants/navigation"; // Import the config

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser(); // Get user role
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // 1. Filter items based on admin status
  const filteredMenu = MENU_ITEMS.filter(item => {
    if (item.adminOnly) return user?.is_admin === true;
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm">
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-medium">Welcome back</p>
              {/* 2. Dynamically show role label */}
              <p className="text-sm font-bold text-gray-800">
                {loading ? "Loading..." : user?.is_admin ? "Administrator" : "User Account"}
              </p>
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar Drawer */}
      <div className={`fixed inset-0 z-50 ${isOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsOpen(false)} />
        
        <div className={`absolute left-0 top-0 h-full w-72 bg-white transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 bg-brand/10 border-b flex flex-col items-center">
               <h2 className="text-xl font-black text-gray-800">AJO PRO</h2>
               <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full mt-1">
                 {user?.is_admin ? "ADMIN" : "MEMBER"}
               </span>
            </div>

            {/* 3. Map through the filtered menu */}
            <ul className="flex-1 py-6 px-4 space-y-2">
              {filteredMenu.map((item) => (
                <MenuItem 
                  key={item.href}
                  icon={<item.icon size={20}/>} 
                  label={item.label}
                  active={pathname === item.href}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                />
              ))}
            </ul>

            <div className="p-4 border-t">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Keep your MenuItem helper as is