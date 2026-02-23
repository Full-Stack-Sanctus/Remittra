// constants/navigation.ts
import { Home, Users, Settings, UserCircle, ShieldCheck } from "lucide-react";

export const MENU_ITEMS = [
  {
    label: "Home",
    icon: Home,
    href: "/user",
    adminOnly: false,
  },
  {
    label: "Ajo Groups",
    icon: Users,
    href: "/user/dashboard/ajo-groups",
    adminOnly: false,
  },
  {
    label: "Admin Panel",
    icon: ShieldCheck,
    href: "/admin/dashboard",
    adminOnly: true, // Only admins see this
  },
  {
    label: "Identity Verification",
    icon: UserCircle,
    href: "/user/dashboard/verify",
    adminOnly: false,
  },
  {
    label: "Account Settings",
    icon: Settings,
    href: "/user/settings",
    adminOnly: false,
  },
];