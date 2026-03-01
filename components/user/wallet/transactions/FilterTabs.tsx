// components/user/wallet/transactions/FilterTabs.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation';

const filters = ['all', 'deposit', 'withdraw', 'contribution', 'payout'];

export default function FilterTabs({ currentType }: { currentType: string }) {
  const router = useRouter();

  const handleFilter = (type: string) => {
    const params = new URLSearchParams(window.location.search);
    if (type === 'all') params.delete('type');
    else params.set('type', type);
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => handleFilter(f)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${
            currentType === f ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}