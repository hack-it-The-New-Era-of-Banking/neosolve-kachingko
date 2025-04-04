"use client"

import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function SmartRewards() {
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    // Calculate points based on expenses (1 point per ₱10 spent)
    const expenses = JSON.parse(localStorage.getItem('kachingko-expenses') || '[]');
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.total, 0);
    const calculatedPoints = Math.floor(totalSpent / 10);
    
    setPoints(calculatedPoints);
    
    // Set achievements based on user activity
    const newAchievements = [];
    
    if (expenses.length >= 1) {
      newAchievements.push({
        icon: "🎯",
        title: "First Scan",
        description: "Scanned your first receipt"
      });
    }
    
    if (expenses.length >= 5) {
      newAchievements.push({
        icon: "📊",
        title: "Tracking Star",
        description: "Scanned 5 receipts"
      });
    }
    
    if (totalSpent > 1000) {
      newAchievements.push({
        icon: "💰",
        title: "Big Spender",
        description: "Spent over ₱1,000"
      });
    }
    
    setAchievements(newAchievements);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white py-3 px-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-500">Smart Rewards</h1>
      </header>
      
      <main className="flex-grow p-4">
        <div className="space-y-6">
          <div className="card bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl">
            <h2 className="text-sm font-medium opacity-80">KachingPoints</h2>
            <p className="text-3xl font-bold mt-1">{points}</p>
            <p className="text-xs mt-2 opacity-80">Earn 1 point for every ₱10 spent</p>
          </div>
          
          <div className="card bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Your Achievements</h2>
            
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No achievements yet. Start scanning receipts to earn badges.
              </p>
            )}
          </div>
          
          <div className="card bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Available Rewards</h2>
            
            <div className="space-y-4">
              <div className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium">₱50 Cashback</h4>
                  <p className="text-sm text-gray-500">Redeem for real cash</p>
                </div>
                <button 
                  className={`px-3 py-1 rounded ${points >= 500 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                  disabled={points < 500}
                >
                  500 pts
                </button>
              </div>
              
              <div className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Coffee Voucher</h4>
                  <p className="text-sm text-gray-500">Free coffee at partner stores</p>
                </div>
                <button 
                  className={`px-3 py-1 rounded ${points >= 200 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                  disabled={points < 200}
                >
                  200 pts
                </button>
              </div>
              
              <div className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Budget Pro Upgrade</h4>
                  <p className="text-sm text-gray-500">Access premium features</p>
                </div>
                <button 
                  className={`px-3 py-1 rounded ${points >= 1000 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                  disabled={points < 1000}
                >
                  1000 pts
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}