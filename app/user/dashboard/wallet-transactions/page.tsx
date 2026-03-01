import { createClient } from "@/lib/supabaseServerClient";
import TransactionTable from '@/components/user/wallet/transactions/TransactionTable';
import FilterTabs from '@/components/user/wallet/transactions/FilterTabs';
import UserNavbar from "@/components/layout/UserNavbar"; // Imported as requested

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Redirect to login if the server finds no valid user
    redirect('/login');
  }
  
  const currentType = searchParams.type || 'all';
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 10;

  // Build the query
  let query = supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  // Scalable Filter Logic
  if (currentType !== 'all') {
    query = query.eq('type', currentType);
  }

  // Pagination calculation
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: transactions, count } = await query.range(from, to);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navigation */}
      <UserNavbar />

      {/* Main Content Area */}
      <main className="p-4 md:p-8 flex-1">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Filters Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-500 text-sm">
                Real-time updates enabled • Total: {count || 0}
              </p>
            </div>
            
            {/* The filter tabs align to the right on desktop */}
            <div className="w-full md:w-auto overflow-x-auto">
              <FilterTabs currentType={currentType} />
            </div>
          </div>

          {/* Table / List View */}
          <div className="space-y-6">
            <TransactionTable transactions={transactions || []} />
          </div>

          {/* Optional: Add a back to dashboard button for better UX */}
          <div className="mt-8 text-center md:text-left">
             <a href="/user/dashboard" className="text-sm text-blue-600 hover:underline">
               ← Back to Wallet Overview
             </a>
          </div>
        </div>
      </main>
    </div>
  );
}