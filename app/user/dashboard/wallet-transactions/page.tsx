// app/user/dashboard/wallet-transactions/page.tsx
import { createClient } from '@/utils/supabase/server';
import TransactionTable from '@/components/user/wallet/transactions/TransactionTable';
import FilterTabs from '@/components/user/wallet/transactions/FilterTabs';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const currentType = searchParams.type || 'all';
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 10;

  // Build the query
  let query = supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  // Scalable Filter Logic: Just add more cases here later
  if (currentType !== 'all') {
    query = query.eq('type', currentType);
  }

  // Pagination
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: transactions, count } = await query.range(from, to);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 text-sm">Real-time updates enabled</p>
        </div>
        <FilterTabs currentType={currentType} />
      </div>

      <TransactionTable transactions={transactions || []} />
      
      {/* Simple Pagination Component would go here */}
    </div>
  );
}