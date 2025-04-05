"use client"

import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { ArrowRightIcon, ArrowTrendingUpIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function SmartRewards() {
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'save', 'invest', or 'spendLess'
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  
  useEffect(() => {
    // Load expenses data
    const loadedExpenses = JSON.parse(localStorage.getItem('kachingko-expenses') || '[]');
    setExpenses(loadedExpenses);
    
    // Calculate total spent
    const total = loadedExpenses.reduce((sum, expense) => sum + expense.total, 0);
    setTotalSpent(total);
    
    // Calculate points based on expenses (1 point per ₱10 spent)
    const calculatedPoints = Math.floor(total / 10);
    setPoints(calculatedPoints);
    
    // Set achievements based on user activity
    const newAchievements = [];
    
    if (loadedExpenses.length >= 1) {
      newAchievements.push({
        icon: "🎯",
        title: "First Scan",
        description: "Scanned your first receipt"
      });
    }
    
    if (loadedExpenses.length >= 5) {
      newAchievements.push({
        icon: "📊",
        title: "Tracking Star",
        description: "Scanned 5 receipts"
      });
    }
    
    if (total > 1000) {
      newAchievements.push({
        icon: "💰",
        title: "Big Spender",
        description: "Spent over ₱1,000"
      });
    }
    
    setAchievements(newAchievements);
  }, []);
  
  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setShowActionModal(true);
  };
  
  const closeModal = () => {
    setShowActionModal(false);
    setSelectedAction(null);
  };
  
  // Get recommended save amount (10% of total spent)
  const recommendedSaveAmount = Math.round(totalSpent * 0.1);
  
  // Generate investment options
  const getInvestmentOptions = () => {
    const amount = Math.round(totalSpent * 0.05);
    return [
      {
        name: "Low Risk Fund",
        returns: "4-6% annually",
        amount: amount,
        risk: "Low"
      },
      {
        name: "Balanced Fund",
        returns: "7-9% annually",
        amount: amount,
        risk: "Medium"
      },
      {
        name: "Growth Stocks",
        returns: "10-15% annually",
        amount: amount,
        risk: "High"
      }
    ];
  };
  
  // Calculate average daily spending
  const avgDailySpending = Math.round(totalSpent / 30);
  
  // Handle spend less limits
  const [spendLessLimit, setSpendLessLimit] = useState(avgDailySpending);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white py-3 px-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-500">Smart Rewards</h1>
      </header>
      
      <main className="flex-grow p-4">
        <div className="space-y-6">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <h2 className="text-sm font-medium opacity-80">KachingPoints</h2>
            <p className="text-3xl font-bold mt-1">{points}</p>
            <p className="text-xs mt-2 opacity-80">Earn 1 point for every milestone of your financial journey.</p>
          </div>
          
          {/* Weekly Financial Choices */}
          <div className="card bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4 text-black">Weekly Financial Choices</h2>
            <p className="text-sm text-gray-600 mb-4">Make smart financial decisions each week to boost your rewards!</p>
            
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div 
                className="border border-blue-200 bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleActionSelect('save')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-blue-800">Save</h3>
                  <BanknotesIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600">AI recommends how much to move from e-wallet to bank.</p>
              </div>
              
              <div 
                className="border border-green-200 bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => handleActionSelect('invest')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-green-800">Invest</h3>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xs text-green-600">AI simulates investment options based on your budget.</p>
              </div>
              
              <div 
                className="border border-orange-200 bg-orange-50 p-4 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => handleActionSelect('spendLess')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-orange-800">Spend Less</h3>
                  <ArrowRightIcon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xs text-orange-600">Set spending limits and get alerts when you're close.</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4 text-black">Your Achievements</h2>
            
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{achievement.title}</h4>
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
            <h2 className="text-lg font-semibold mb-4 text-black">Available Rewards</h2>
            
            <div className="space-y-4">
              <div className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-black">₱50 Cashback</h4>
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
                  <h4 className="font-medium text-black">Coffee Voucher</h4>
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
                  <h4 className="font-medium text-black">Budget Pro Upgrade</h4>
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
      
      {/* Action Modals */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            {selectedAction === 'save' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Save Money</h2>
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">Based on your spending patterns, we recommend:</p>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-lg font-semibold text-blue-800">Transfer ₱{recommendedSaveAmount.toLocaleString()} to your savings</p>
                    <p className="text-sm text-blue-600 mt-1">This is 10% of your tracked expenses</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Potential monthly savings:</p>
                  <p className="font-bold text-black">₱{(recommendedSaveAmount * 4).toLocaleString()}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        // Add logic to process the saving
                        closeModal();
                        // Show confirmation toast or message
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Save Now
                    </button>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500">+50 points for saving money!</p>
                </div>
              </div>
            )}
            
            {selectedAction === 'invest' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Investment Options</h2>
                <p className="text-gray-700 mb-4">Based on your available budget, here are some investment options:</p>
                
                <div className="space-y-3 mb-6">
                  {getInvestmentOptions().map((option, index) => (
                    <div key={index} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-black">{option.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          option.risk === 'Low' ? 'bg-green-100 text-green-800' :
                          option.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {option.risk} Risk
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-gray-600">Amount: ₱{option.amount.toLocaleString()}</span>
                        <span className="font-medium text-black">Returns: {option.returns}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        // Add logic for investment selection
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                      Invest
                    </button>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500">+75 points for investing!</p>
                </div>
              </div>
            )}
            
            {selectedAction === 'spendLess' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Set Spending Limit</h2>
                <p className="text-gray-700 mb-2">Your average daily spending is ₱{avgDailySpending}.</p>
                <p className="text-gray-700 mb-4">Set a daily limit to help control your spending:</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Spending Limit (₱)
                  </label>
                  <input 
                    type="number" 
                    value={spendLessLimit}
                    onChange={(e) => setSpendLessLimit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                  />
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Savings vs Current</span>
                      <span>₱{((avgDailySpending - spendLessLimit) * 30).toLocaleString()}/month</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, (1 - spendLessLimit / avgDailySpending) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Add logic to set spending limit
                        localStorage.setItem('kachingko-spend-limit', spendLessLimit.toString());
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                      Set Limit
                    </button>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500">+25 points for setting a spending limit!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}