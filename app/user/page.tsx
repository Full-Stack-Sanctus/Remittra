import WalletSection from "@/components/user/wallet/WalletSection";
import AjoSection from "@/components/user/ajo/AjoSection";
import UserNavbar from "@/components/layout/UserNavbar";


export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* This stays fixed at the top */}
      <UserNavbar />

      {/* This scrolls naturally */}
      <main className="p-4 space-y-6 flex-1">
        <WalletSection />
        <AjoSection />
        {/* Add more content here to test the scroll! */}
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          More Content
        </div>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          More more content...
        </div>
      </main>
    </div>
  );
}