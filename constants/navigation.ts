// constants/navigation.ts
import { Home, Users, Settings, UserCircle, ShieldCheck, UsersRound, Receipt } from "lucide-react";

export type Role = "admin" | "user";

export interface MenuItemConfig {
  label: string;
  icon: any;
  // href can be a string or a function that returns a string based on admin status
  href: string | ((isAdmin: boolean) => string);
  allowedRoles: Role[]; 
}

export const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: "Home",
    icon: Home,
    // If admin, go to /admin, else /user
    href: (isAdmin) => (isAdmin ? "/admin" : "/user"),
    allowedRoles: ["admin", "user"],
  },
  {
    label: "Ajo Groups",
    icon: Users,
    href: "/user/dashboard/ajo-groups",
    allowedRoles: ["user"], // Admins won't see this at all
  },
  {
    label: "User Management", // Admins see this instead of Ajo Groups
    icon: Users,
    href: "/admin/users",
    allowedRoles: ["admin"],
  },
  {
    label: "Ajo Management", // Admins see this instead of Ajo Groups
    icon: UsersRound,
    href: "/admin/ajos",
    allowedRoles: ["admin"],
  },
  {
    label: "Admin Control",
    icon: ShieldCheck,
    href: "/admin/dashboard",
    allowedRoles: ["admin"],
  },
  {
    label: "Financial History",
    icon: Receipt,
    href: "/user/dashboard/wallet-transactions",
    allowedRoles: ["user"], // Admins might not need to verify themselves
  },
  {
    label: "Identity Verification",
    icon: UserCircle,
    href: "/user/dashboard/verify",
    allowedRoles: ["user"], // Admins might not need to verify themselves
  },
  {
    label: "Settings",
    icon: Settings,
    href: (isAdmin) => (isAdmin ? "/admin/settings" : "/user/settings"),
    allowedRoles: ["admin", "user"],
  },
];