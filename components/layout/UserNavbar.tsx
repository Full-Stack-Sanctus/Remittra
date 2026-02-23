"use client";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";
import { MENU_ITEMS, MenuItemConfig } from "@/constants/navigation";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Logic to determine current role
  const currentUserRole = user?.is_admin ? "admin" : "user";

  // Filter and Resolve Menu Items
  const filteredMenu = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentUserRole)
  ).map((item) => {
    // Resolve dynamic href if it's a function
    const resolvedHref = typeof item.href === "function" 
      ? item.href(user?.is_admin ?? false) 
      : item.href;
    
    return { ...item, resolvedHref };
  });

  if (loading) return <div className="h-16 bg-white border-b animate-pulse" />;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm">
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-gray-800">
                {user?.is_admin ? "System Admin" : user?.email}
              </p>
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar Drawer */}
      <div className={`fixed inset-0 z-50 ${isOpen ? "visible" : "invisible"}`}>
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsOpen(false)} 
        />
        
        <div className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 bg-brand/10 border-b border-brand/20 flex flex-col items-center">
              <h2 className="text-xl font-black text-gray-800">AJO PRO</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark px-2 py-1 bg-white rounded-md mt-2 shadow-sm">
                {user?.is_admin ? "🛡️ Admin Portal" : "👤 Member Area"}
              </p>
            </div>

            <ul className="flex-1 py-6 px-4 space-y-2">
              {filteredMenu.map((item) => (
                <MenuItem 
                  key={item.resolvedHref}
                  icon={<item.icon size={20}/>} 
                  label={item.label}
                  active={pathname === item.resolvedHref}
                  onClick={() => {
                    router.push(item.resolvedHref);
                    setIsOpen(false);
                  }}
                />
              ))}
            </ul>

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

function MenuItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <li 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active 
          ? "bg-brand text-white shadow-lg shadow-brand/30" 
          : "text-gray-600 hover:bg-gray-50 hover:text-brand"
      }`}
    >
      {icon} <span className="font-bold">{label}</span>
    </li>
  );
}