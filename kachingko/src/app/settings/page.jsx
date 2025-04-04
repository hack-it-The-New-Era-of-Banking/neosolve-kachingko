"use client"

import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function Settings() {
  const [budgetLimit, setBudgetLimit] = useState(15000);
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('PHP');
  const [notifications, setNotifications] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedBudgetLimit = localStorage.getItem('kachingko-budget-limit');
    if (savedBudgetLimit) {
      const parsedBudget = JSON.parse(savedBudgetLimit);
      setBudgetLimit(parsedBudget.target);
    }
    
    const savedTheme = localStorage.getItem('kachingko-theme');
    if (savedTheme) setTheme(savedTheme);
    
    const savedCurrency = localStorage.getItem('kachingko-currency');
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedNotifications = localStorage.getItem('kachingko-notifications');
    if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
    
    setIsClient(true);
  }, []);
  
  const handleSaveSettings = () => {
    // Save budget limit
    const budgetLimitObj = {
      description: "Monthly Spending Limit",
      target: budgetLimit
    };
    localStorage.setItem('kachingko-budget-limit', JSON.stringify(budgetLimitObj));
    
    // Save other settings
    localStorage.setItem('kachingko-theme', theme);
    localStorage.setItem('kachingko-currency', currency);
    localStorage.setItem('kachingko-notifications', JSON.stringify(notifications));
    
    // Show saved message
    alert('Settings saved successfully!');
  };
  
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.removeItem('kachingko-expenses');
      alert('All expense data has been cleared.');
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <header className="bg-white py-3 px-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-500">Settings</h1>
      </header>
      
      <main className="p-4">
        <div className="space-y-4">
          {/* Budget Settings */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-black mb-4">Budget Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Monthly Budget Limit (₱)
              </label>
              <input 
                type="number" 
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          </div>
          
          {/* App Settings */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-black mb-4">App Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Theme
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Currency
              </label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="PHP">Philippine Peso (₱)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <input 
                type="checkbox" 
                id="notifications"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 text-sm text-black">
                Enable notifications
              </label>
            </div>
          </div>
          
          {/* Data Management */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-black mb-4">Data Management</h2>
            
            <button 
              onClick={handleClearData}
              className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 mb-2"
            >
              Clear All Data
            </button>
            <p className="text-xs text-gray-500 text-center">
              This will permanently delete all your expense data.
            </p>
          </div>
          
          {/* Save Button */}
          <button 
            onClick={handleSaveSettings}
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}