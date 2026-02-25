// @/components/user/kyc/VerificationTierCard.tsx
"use client";

import { useState } from "react";
import { CheckCircleIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

interface TierProps {
  tier: number;
  title: string;
  requirements: string;
  perks: string;
  status: "completed" | "action-required" | "locked";
  actionUrl?: string;
}


export default function VerificationTierCard({ tier, title, requirements, perks, status }: TierProps) {
    
  const isDone = status === "completed";
  const isAction = status === "action-required";
  
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });
  
  const showModal = (title: string, message: string, type: "success" | "error") => setModal({ isOpen: true, title, message, type });
  

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/users/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        showModal("Request Failed", data.error || "Something went wrong", "error");
        return;
      }

      showModal("Success", "Verification Submission successfull", "success");
      // Optional: Refresh page to show 'pending' state if you add that logic
      window.location.reload(); 
    } catch (err: any) {
      showModal("Connection Error", "Check your internet and try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 ...`}>
      {/* ... Header and Info Grid same as before ... */}

      {isAction && (
        <Button 
          isLoading={isVerifying}
          onClick={handleVerify}
          className="w-full mt-8 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-brand disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheckIcon className="h-5 w-5" />
              Verify with Passport
            </>
          )}
        </Button>
      )}
    </div>
  );
}