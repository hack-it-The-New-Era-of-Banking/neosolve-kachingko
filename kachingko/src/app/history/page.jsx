export default function History() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <a 
            href="/"
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </a>
        </div>
      </header>
      
      <main className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        
        {/* Sample transaction list - replace with actual data */}
        <div className="space-y-4">
          <div className="border-b dark:border-gray-700 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Grocery Shopping</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">March 15, 2024</p>
              </div>
              <span className="text-red-500">-$85.50</span>
            </div>
          </div>
          
          <div className="border-b dark:border-gray-700 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Salary Deposit</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">March 14, 2024</p>
              </div>
              <span className="text-green-500">+$2,500.00</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}