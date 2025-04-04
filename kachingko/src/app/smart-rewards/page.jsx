export default function SmartRewards() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Smart Rewards</h1>
          <a 
            href="/"
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </a>
        </div>
      </header>
      
      <main className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Rewards Overview</h2>
        {/* Add your rewards components here */}
        <p className="text-gray-600 dark:text-gray-300">
          Rewards tracking functionality will be implemented here.
        </p>
      </main>
    </div>
  );
}