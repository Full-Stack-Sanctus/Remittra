// @/app/dashboard/ajo-groups/page.tsx
import UserNavbar from "@/components/layout/UserNavbar";
import WalletSection from "@/components/user/wallet/WalletSection"; // Assuming this exists
import GroupListSection from "@/components/user/ajo/GroupListSection";
import PendingRequestsSection from "@/components/user/ajo/PendingRequestsSection";

export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />

      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 flex-1 w-full">

        {/* Actionable approvals (only shows if requests exist) */}
        <PendingRequestsSection />

        {/* Joined groups list */}
        <GroupListSection />
        
        {/* Visual spacers to test scroll */}
        <div className="h-40 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 font-bold border-2 border-dashed">
          History & Analytics Coming Soon
        </div>
      </main>
    </div>
  );
}