"use client"

import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function History() {
  const [expenses, setExpenses] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Get expenses from localStorage
    const savedExpenses = JSON.parse(localStorage.getItem('kachingko-expenses') || '[]');
    
    // Sort by date, newest first
    savedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setExpenses(savedExpenses);
    setIsClient(true);
  }, []);

  const formatDate = (dateString) => {
    if (!isClient) return dateString;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <header className="bg-white py-3 px-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-500">Receipt History</h1>
      </header>
      
      <main className="p-4">
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-blue-50 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-black">{formatDate(expense.date)}</h2>
                    <p className="text-sm text-gray-600">{expense.items.length} items</p>
                  </div>
                  <div>
                    <span className="font-bold text-black">₱{expense.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="divide-y">
                  {expense.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-3 flex justify-between text-black">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <p className="font-semibold">₱{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No receipts found in your history.</p>
            <p className="text-gray-500 text-sm">Start scanning receipts to build your history.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}