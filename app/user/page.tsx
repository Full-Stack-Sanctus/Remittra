import WalletSection from "@/components/wallet/WalletSection";
import AjoSection from "@/components/ajo/AjoSection";
import UserNavbar from "@/components/layout/UserNavbar";

export default function UserPage() {
  return (
    <div className="p-4 space-y-6">
      <UserNavbar />
      
      <WalletSection />
      <AjoSection />
    </div>
  );
}
