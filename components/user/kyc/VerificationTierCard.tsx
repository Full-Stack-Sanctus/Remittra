// @/components/user/kyc/VerificationTierCard.tsx
"use client";

import { useState } from "react";
import { CheckCircleIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast"; // Or your preferred toast library

interface TierProps {
  tier: number;
  title: string;
  requirements: string;
  perks: string;
  status: "completed" | "action-required" | "locked";
  actionUrl?: string;
}


export default function VerificationTierCard({ tier, title, requirements, perks, status }: TierProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDone = status === "completed";
  const isAction = status === "action-required";

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Submission received! We are reviewing your documents.");
      // Optional: Refresh page to show 'pending' state if you add that logic
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 ...`}>
      {/* ... Header and Info Grid same as before ... */}

      {isAction && (
        <button 
          onClick={handleVerify}
          disabled={isSubmitting}
          className="w-full mt-8 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-brand disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheckIcon className="h-5 w-5" />
              Verify with Passport
            </>
          )}
        </button>
      )}
    </div>
  );
}