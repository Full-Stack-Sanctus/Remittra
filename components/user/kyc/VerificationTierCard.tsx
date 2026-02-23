// @/components/user/kyc/VerificationTierCard.tsx
interface TierProps {
  tier: number;
  title: string;
  requirements: string;
  perks: string;
  status: "completed" | "action-required" | "locked";
  actionUrl?: string;
}

export default function VerificationTierCard({ tier, title, requirements, perks, status, actionUrl }: TierProps) {
  const isLocked = status === "locked";
  const isDone = status === "completed";

  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all ${
      isDone ? "border-brand bg-brand/5" : "border-gray-100 bg-white"
    } ${isLocked ? "opacity-60" : "opacity-100"}`}>
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            isDone ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
          }`}>
            Tier {tier}
          </span>
          <h3 className="text-lg font-black text-gray-800">{title}</h3>
        </div>
        {isDone && <CheckCircleIcon className="h-6 w-6 text-brand" />}
        {isLocked && <LockClosedIcon className="h-5 w-5 text-gray-400" />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400 font-bold text-[10px] uppercase">Requirements</p>
          <p className="text-gray-700 font-medium">{requirements}</p>
        </div>
        <div>
          <p className="text-gray-400 font-bold text-[10px] uppercase">Perks</p>
          <p className="text-gray-700 font-medium">{perks}</p>
        </div>
      </div>

      {status === "action-required" && (
        <button 
          onClick={() => window.location.href = actionUrl || "#"}
          className="w-full mt-6 bg-gray-900 text-white font-black py-3 rounded-xl hover:bg-brand transition-colors"
        >
          Verify Now
        </button>
      )}
    </div>
  );
}