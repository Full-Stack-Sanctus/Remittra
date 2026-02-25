"use client";

import { useUser } from "@/context/UserContext";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import VerificationTierCard from "@/components/user/kyc/VerificationTierCard";

// Map levels to readable names
const LEVEL_NAMES: Record<number, string> = {
  1: "Basic Access",
  2: "Silver Member",
  3: "Gold (Enterprise)",
};

export default function KYCPage() {
  const { user, loading } = useUser();

  if (loading) return <KYCSkeleton />;

  // Default to 1 since it's passed on sign up
  const currentLevel = user?.verification_level || 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900">Identity Verification</h1>
          <p className="text-gray-500">Upgrade your tier to increase contribution limits and unlock payouts.</p>
        </div>

        {/* Status Overview */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Current Standing</p>
            <h2 className="text-xl font-black text-brand">
               {LEVEL_NAMES[currentLevel]} Verified
            </h2>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <ShieldCheckIcon className="h-3 w-3 mr-1" /> Enterprise Secured
            </p>
          </div>
          <div className="h-12 w-12 bg-brand/10 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-brand" />
          </div>
        </div>

        {/* Tier Grid */}
        <div className="space-y-4">
          {/* Tier 1: Always Completed for existing users */}
          <VerificationTierCard 
            tier={1}
            title={LEVEL_NAMES[1]}
            status="completed"
            requirements="Phone Number & Email"
            perks="Join public circles, max ₦50k contribution"
          />
          
          {/* Tier 2: Actionable if at level 1, Completed if at 2 or 3 */}
          <VerificationTierCard 
            tier={2}
            title={LEVEL_NAMES[2]}
            status={currentLevel >= 2 ? "completed" : "action-required"}
            requirements="BVN or vNIN Verification"
            perks="Create circles, max ₦500k contribution"
            actionUrl="/dashboard/verify/tier-2"
          />

          {/* Tier 3: Locked until Tier 2 is done */}
          <VerificationTierCard 
            tier={3}
            title={LEVEL_NAMES[3]}
            status={currentLevel >= 3 ? "completed" : currentLevel === 2 ? "action-required" : "locked"}
            requirements="Government ID & Liveness Selfie"
            perks="Unlimited contributions & Instant Payouts"
            actionUrl="/dashboard/verify/tier-3"
          />
        </div>

      </main>
    </div>
  );
}

function KYCSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-200 rounded-lg" />
        </div>

        {/* Status Card Skeleton */}
        <div className="h-24 bg-white rounded-[2rem] border border-gray-100" />

        {/* Tiers Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-[2rem] border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}