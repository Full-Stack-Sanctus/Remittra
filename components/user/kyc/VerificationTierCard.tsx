// @/components/user/kyc/VerificationTierCard.tsx
"use client";

import { CheckCircleIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface TierProps {
  tier: number;
  title: string;
  requirements: string;
  perks: string;
  status: "completed" | "action-required" | "locked";
  actionUrl?: string;
}

export default function VerificationTierCard({ 
  tier, 
  title, 
  requirements, 
  perks, 
  status, 
  actionUrl 
}: TierProps) {
  const isLocked = status === "locked";
  const isDone = status === "completed";
  const isAction = status === "action-required";

  return (
    <div 
      className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${
        isDone 
          ? "border-brand bg-brand/5 shadow-sm" 
          : "border-gray-100 bg-white"
      } ${isLocked ? "opacity-50 grayscale-[0.5]" : "opacity-100"}`}
    >
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isDone ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
            }`}>
              Tier {tier}
            </span>
            {tier === 3 && (
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                 Enterprise
               </span>
            )}
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
        </div>

        {/* Dynamic Icon Indicator */}
        <div className="flex flex-col items-end">
          {isDone && (
            <div className="flex flex-col items-end gap-1">
              <CheckCircleIcon className="h-7 w-7 text-brand" />
              <span className="text-[9px] font-bold text-brand uppercase">Verified</span>
            </div>
          )}
          {isLocked && <LockClosedIcon className="h-6 w-6 text-gray-300" />}
          {isAction && <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Requirements</p>
          <p className={`text-sm font-bold ${isLocked ? "text-gray-400" : "text-gray-700"}`}>
            {requirements}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Perks</p>
          <div className="flex items-center gap-1">
            <p className={`text-sm font-bold ${isLocked ? "text-gray-400" : "text-brand"}`}>
              {perks}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {isAction && actionUrl && (
        <Link href={actionUrl} className="block">
          <button 
            className="w-full mt-8 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-brand active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            <ShieldCheckIcon className="h-5 w-5" />
            Upgrade to {title}
          </button>
        </Link>
      )}

      {isLocked && (
        <div className="mt-6 py-3 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-tight">
            Complete previous tier to unlock
          </p>
        </div>
      )}
    </div>
  );
}