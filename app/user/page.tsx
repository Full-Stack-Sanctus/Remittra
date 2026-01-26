import WalletSection from "@/components/wallet/WalletSection";
import AjoSection from "@/components/ajo/AjoSection";

export default function UserPage() {
  return (
    <div className="p-4 space-y-6">
      <Navbar />
      
      <WalletSection />
      <AjoSection />
    </div>
  );
}
