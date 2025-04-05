// app/smart-budget/page.jsx
"use client"

// Add these to your imports
import { PencilIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';


// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function SmartBudget() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDates, setCalendarDates] = useState([]);

  // At the top of your component, add:
  const [isClient, setIsClient] = useState(false);

  // Updated state for budget limit
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState({
    description: "Monthly Spending Limit",
    target: 15000, // Budget limit
  });
  
  // Generate some mock data for the calendar
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate 10 random days in the current month
    const mockDates = [];
    const amounts = [150, 230, 450, 120, 780, 320, 540, 220, 180, 290];
    
    for (let i = 0; i < 10; i++) {
      const day = Math.floor(Math.random() * 28) + 1; // Random day between 1-28
      const date = new Date(currentYear, currentMonth, day);
      mockDates.push({
        date: date.toISOString().split('T')[0],
        amount: amounts[i]
      });
    }
    
    // Sort dates
    mockDates.sort((a, b) => new Date(a.date) - new Date(b.date));
    setCalendarDates(mockDates);
  }, []);
  
  // Load real expense data
  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('kachingko-expenses') || '[]');
    
    // Load real data without losing mock data
    if (savedExpenses.length > 0) {
      // Create a copy of existing calendar dates
      const updatedDates = [...calendarDates];
      
      // Process real expenses
      savedExpenses.forEach(expense => {
        const date = expense.date;
        const amount = expense.total;
        
        // Find if this date already exists in our calendar
        const existingIndex = updatedDates.findIndex(item => item.date === date);
        
        if (existingIndex >= 0) {
          // Update existing date
          updatedDates[existingIndex].amount = amount;
        } else {
          // Add new date
          updatedDates.push({ date, amount });
        }
      });
      
      // Sort dates chronologically
      updatedDates.sort((a, b) => new Date(a.date) - new Date(b.date));
      setCalendarDates(updatedDates);
    }
    
    setExpenses(savedExpenses);
  }, [calendarDates.length]);

  // Load saved budget limit
  useEffect(() => {
    const savedBudget = localStorage.getItem('kachingko-budget-limit');
    if (savedBudget) {
      setBudgetLimit(JSON.parse(savedBudget));
    }
  }, []);

  // Client-side rendering effect
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate total monthly expenses
  const totalMonthlyExpense = calendarDates.reduce((total, date) => total + date.amount, 0);
  
  // Function to calculate expenses by category
  const calculateCategoryData = () => {
    // Start with a clean object
    const categories = {};
    
    // Filter expenses by selectedDate if available
    const filteredExpenses = selectedDate 
      ? expenses.filter(expense => expense.date === selectedDate)
      : expenses;
    
    // Process each expense
    filteredExpenses.forEach(expense => {
      expense.items.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += item.price;
      });
    });
    
    // If we don't have any categorized expenses yet, use mock data
    if (Object.keys(categories).length === 0) {
      categories['Groceries'] = 450;
      categories['Restaurant'] = 320;
      categories['Shopping'] = 250;
      categories['Electronics'] = 180;
      categories['Entertainment'] = 120;
    }
    
    return categories;
  };

  // Use the function to get category data
  const categoryData = calculateCategoryData();

  // Update chart preparation
  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8AC926',
          '#1982C4'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'black',
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  // Handle date selection in calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  // Handle expense deletion
  const handleDeleteExpense = (expenseIndex) => {
    // Get the date of the expense to be deleted
    const expenseToDelete = expenses[expenseIndex];
    const dateToUpdate = expenseToDelete.date;
    
    // Filter out the expense to delete
    const updatedExpenses = expenses.filter((_, index) => index !== expenseIndex);
    
    // Update localStorage
    localStorage.setItem('kachingko-expenses', JSON.stringify(updatedExpenses));
    
    // Update state
    setExpenses(updatedExpenses);
    
    // Calculate new total for this date
    const remainingExpensesForDate = updatedExpenses.filter(exp => exp.date === dateToUpdate);
    const newDateTotal = remainingExpensesForDate.reduce((sum, exp) => sum + exp.total, 0);
    
    // Update calendar data
    const updatedDates = calendarDates.map(dateInfo => {
      if (dateInfo.date === dateToUpdate) {
        // If there are no more expenses for this date, either keep the mock data amount
        // or set to 0 if this wasn't a mock date
        const wasOriginallyMock = !expenses.some(e => e.date === dateToUpdate);
        return {
          ...dateInfo,
          amount: remainingExpensesForDate.length > 0 ? newDateTotal : 
                  (wasOriginallyMock ? dateInfo.amount : 0)
        };
      }
      return dateInfo;
    });
    
    setCalendarDates(updatedDates);
  };

  // Handle individual item deletion - fixed version
  const handleDeleteItem = (expenseIndex, itemIndex) => {
    try {
      // Get the expense object directly from the array
      const expense = expenses[expenseIndex];
      if (!expense) {
        console.error("Expense not found at index:", expenseIndex);
        return;
      }
      
      // Get the item directly from the array
      const item = expense.items[itemIndex];
      if (!item) {
        console.error("Item not found at index:", itemIndex);
        return;
      }
      
      // Store the date and price for updating later
      const dateToUpdate = expense.date;
      const deletedItemPrice = item.price || 0;
      
      // Create updated expenses array with deep copy
      const updatedExpenses = expenses.map((exp, idx) => {
        if (idx !== expenseIndex) return {...exp}; // Return copies of other expenses
        
        // For the target expense, filter out the item and update total
        const updatedItems = exp.items.filter((_, idx) => idx !== itemIndex);
        return {
          ...exp,
          items: updatedItems,
          total: exp.total - deletedItemPrice
        };
      });
      
      // Remove any expenses with no items
      const filteredExpenses = updatedExpenses.filter(exp => exp.items.length > 0);
      
      // Update localStorage
      localStorage.setItem('kachingko-expenses', JSON.stringify(filteredExpenses));
      
      // Update state
      setExpenses(filteredExpenses);
      
      // Calculate new total for this date
      const newDateTotal = filteredExpenses
        .filter(exp => exp.date === dateToUpdate)
        .reduce((sum, exp) => sum + exp.total, 0);
      
      // Update calendar data
      setCalendarDates(prev => 
        prev.map(dateInfo => {
          if (dateInfo.date === dateToUpdate) {
            return {
              ...dateInfo,
              amount: newDateTotal || dateInfo.amount
            };
          }
          return dateInfo;
        })
      );
      
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error, error.stack);
    }
  };

  // Handle saving budget limit
  const handleSaveBudget = (e) => {
    e.preventDefault();
    setIsEditingGoal(false);
    
    // Save to localStorage
    localStorage.setItem('kachingko-budget-limit', JSON.stringify(budgetLimit));
  };

  // Function to generate random spending insights
  // Function to generate data-driven spending insights
const getSpendingInsights = () => {
  // Get current month and previous month
  const today = new Date();
  const currentMonth = today.getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentYear = today.getFullYear();
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Function to check if a date is in the specified month and year
  const isInMonth = (dateStr, month, year) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  };
  
  // Group expenses by month and category
  const currentMonthExpenses = expenses.filter(expense => 
    isInMonth(expense.date, currentMonth, currentYear)
  );
  
  // Calculate category totals for current month
  const currentCategoryTotals = {};
  currentMonthExpenses.forEach(expense => {
    expense.items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!currentCategoryTotals[category]) {
        currentCategoryTotals[category] = 0;
      }
      currentCategoryTotals[category] += item.price;
    });
  });
  
  // Calculate total spent this month
  const totalCurrentMonth = Object.values(currentCategoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  // Initialize insights array
  const insights = [];
  
  // 1. Check if total spending exceeds budget
  if (totalCurrentMonth > budgetLimit.target) {
    const percentage = Math.round((totalCurrentMonth / budgetLimit.target - 1) * 100);
    insights.push(`Your spending is ${percentage}% over your monthly budget limit.`);
  } else if (totalCurrentMonth > 0) {
    const percentage = Math.round((budgetLimit.target - totalCurrentMonth) / budgetLimit.target * 100);
    insights.push(`You're under budget by ${percentage}%. Great job managing your finances!`);
  }
  
  // 2. Find the largest expense category
  if (Object.keys(currentCategoryTotals).length > 0) {
    const largestCategory = Object.entries(currentCategoryTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    const percentOfTotal = Math.round((largestCategory[1] / totalCurrentMonth) * 100);
    insights.push(`${largestCategory[0]} is your largest expense category at ${percentOfTotal}% of your monthly spending.`);
  }
  
  // 3. Look for frequently occurring merchants
  const merchantCounts = {};
  currentMonthExpenses.forEach(expense => {
    expense.items.forEach(item => {
      // Use the item name as a proxy for merchant
      if (!merchantCounts[item.name]) {
        merchantCounts[item.name] = 0;
      }
      merchantCounts[item.name]++;
    });
  });
  
  const frequentMerchants = Object.entries(merchantCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);
  
  if (frequentMerchants.length > 0) {
    const [merchantName, count] = frequentMerchants[0];
    insights.push(`You've made ${count} purchases from ${merchantName} this month. Consider a loyalty program if available.`);
  }
  
  // 4. Check for daily spending averages
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverage = totalCurrentMonth / daysInMonth;
  
  if (dailyAverage > 200) {
    insights.push(`Your daily spending average is ₱${dailyAverage.toFixed(0)}, which adds up to ₱${(dailyAverage * 30).toFixed(0)} monthly.`);
  }
  
  // If we don't have enough real insights, add some generic ones
  if (insights.length < 2) {
    const genericInsights = [
      "Tracking expenses consistently is the first step toward financial freedom.",
      "Consider creating separate budgets for essentials and discretionary spending.",
      "Setting up automatic transfers to savings can help you reach your financial goals faster.",
      "Review your subscriptions regularly to avoid paying for services you don't use."
    ];
    
    // Add generic insights until we have at least 2
    while (insights.length < 2 && genericInsights.length > 0) {
      const randomIndex = Math.floor(Math.random() * genericInsights.length);
      insights.push(genericInsights.splice(randomIndex, 1)[0]);
    }
  }
  
  // Return formatted insights (limit to 2)
  return (
    <>
      {insights.slice(0, 2).map((insight, index) => (
        <div key={index} className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
          <p className="text-black">{insight}</p>
        </div>
      ))}
    </>
  );
};
  
  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      {/* Wallet-style header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <h1 className="text-lg font-medium mb-1">Total Monthly Expenses</h1>
        <p className="text-3xl font-bold">₱{totalMonthlyExpense.toFixed(2)}</p>
        <p className="text-sm mt-2 opacity-80">April 2025</p>
      </div>
      
      {/* Date picker */}
      <div className="p-4 bg-white">
        <label className="block text-sm font-medium text-black mb-1">
          Select Date
        </label>
        <input 
          type="date" 
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-black"
        />
      </div>
      
      {/* Calendar strip */}
      <div className="bg-white p-4 overflow-x-auto">
        <div className="flex space-x-3 min-w-max">
          {calendarDates.map((dateInfo, index) => {
            const date = new Date(dateInfo.date);
            const day = date.getDate();
            const isSelected = selectedDate === dateInfo.date;
            
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center p-2 rounded-lg cursor-pointer min-w-16 ${
                  isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
                }`}
                onClick={() => isClient && handleDateSelect(dateInfo.date)}
              >
                <span className="text-xs text-gray-500">
                  {isClient ? date.toLocaleDateString('en-US', { month: 'short' }) : dateInfo.date.split('-')[1]}
                </span>
                <span className="text-lg font-medium">{day}</span>
                <span className="text-xs font-medium mt-1 text-black">
                  ₱{dateInfo.amount.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
     {/* Selected date details */}
      {selectedDate && (
        <div className="m-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-3 text-black">
            Expenses on {isClient ? new Date(selectedDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            }) : selectedDate}
          </h2>
          
          {expenses
            .filter(expense => expense.date === selectedDate)
            .map((expense, expenseIndex) => (
              <div key={expenseIndex} className="mb-4 relative">
                {/* Your expense item content */}
                {expense.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between py-2 border-b text-black relative">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="font-semibold mr-3">₱{item.price.toFixed(2)}</p>
                      {isClient && (
                        <button 
                          onClick={() => handleDeleteItem(
                            expenses.findIndex(e => e === expense),
                            expense.items.findIndex(i => i === item)
                          )}
                          className="text-red-500 p-1 hover:bg-red-50 rounded-full"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          
          {expenses.filter(expense => expense.date === selectedDate).length === 0 && (
            <p className="text-gray-500 text-center py-3">
              No detailed expenses available for this date.
            </p>
          )}
        </div>
      )}
      
      {/* Expense categories pie chart */}
        <div className="m-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 text-black text-center">
            {selectedDate 
              ? `Expense Categories for ${isClient ? new Date(selectedDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric'}) : selectedDate}`
              : 'Overall Expense Categories'
            }
          </h2>
          <div className="h-64 flex justify-center items-center">
            {isClient && <Pie data={chartData} options={chartOptions} />}
            {!isClient && <div className="w-full h-full flex items-center justify-center text-black">Loading chart...</div>}
          </div>
        </div>

      {/* Budget Limit instead of Financial Goal */}
      <div className="m-4 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4 text-black">
          <h2 className="text-lg font-medium text-black">Monthly Budget Limit</h2>
          <button 
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="p-1 text-black hover:bg-gray-100 rounded-full"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
        
        {isEditingGoal ? (
          <form onSubmit={handleSaveBudget} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Monthly Budget Limit (₱)
              </label>
              <input 
                type="number" 
                value={budgetLimit.target}
                onChange={(e) => setBudgetLimit({
                  ...budgetLimit, 
                  target: parseFloat(e.target.value),
                  description: "Monthly Spending Limit"
                })}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                min="1"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Budget Limit
            </button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-black">{budgetLimit.description}</p>
              <div className="flex items-center">
                <p className={`font-bold ${totalMonthlyExpense > budgetLimit.target ? 'text-red-500' : 'text-green-500'}`}>
                  {totalMonthlyExpense > budgetLimit.target ? 
                    `${Math.round((totalMonthlyExpense / budgetLimit.target) * 100)}% Over` : 
                    `${Math.round((totalMonthlyExpense / budgetLimit.target) * 100)}%`
                  }
                </p>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div 
                className={`h-3 rounded-full ${totalMonthlyExpense > budgetLimit.target ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (totalMonthlyExpense / budgetLimit.target) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-black mt-2">
              <p>Current: ₱{totalMonthlyExpense.toLocaleString()}</p>
              <p>Budget: ₱{budgetLimit.target.toLocaleString()}</p>
            </div>
            
            {/* Category breakdown */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-black mb-2">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(categoryData).map(([category, amount], index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-black">{category}</span>
                      <span className="text-black">₱{amount.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (amount / totalMonthlyExpense) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spending Insights */}
      <div className="m-4 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4 text-black">Spending Insights</h2>
        <div className="space-y-3">
          {getSpendingInsights()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}