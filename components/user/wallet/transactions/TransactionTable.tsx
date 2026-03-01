// components/user/wallet/transactions/TransactionTable.tsx
export default function TransactionTable({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return <div className="text-center py-20 bg-gray-50 rounded-xl">No transactions found.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop View */}
      <table className="hidden md:table w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Details</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
              </td>
              <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                {tx.type === 'withdraw' ? '-' : '+'}{tx.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-100">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900 capitalize">{tx.type}</p>
              <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                {tx.type === 'withdraw' ? '-' : '+'}{tx.amount}
              </p>
              <p className="text-[10px] uppercase text-gray-400 font-bold">Success</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}