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

  // Add these state variables
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [financialGoal, setFinancialGoal] = useState({
    description: "Save ₱10,000 for Emergency Fund",
    target: 10000,
    current: 6500
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

  // Add this after your other useEffect hooks
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate total monthly expenses
  const totalMonthlyExpense = calendarDates.reduce((total, date) => total + date.amount, 0);
  
  // Modify the expensesByCategory calculation to filter by selectedDate when needed
const expensesByCategory = {};

// Add this function to calculate expenses by category
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

  // Handle individual item deletion
  const handleDeleteItem = (expenseIndex, itemIndex) => {
    // Create a deep copy of expenses
    const updatedExpenses = JSON.parse(JSON.stringify(expenses));
    
    // Get the expense and date
    const expense = updatedExpenses[expenseIndex];
    const dateToUpdate = expense.date;
    
    // Remove the specific item
    const deletedItemPrice = expense.items[itemIndex].price;
    expense.items.splice(itemIndex, 1);
    
    // Update the expense total
    expense.total -= deletedItemPrice;
    
    // If no items left, remove the entire expense
    if (expense.items.length === 0) {
      updatedExpenses.splice(expenseIndex, 1);
    }
    
    // Update localStorage
    localStorage.setItem('kachingko-expenses', JSON.stringify(updatedExpenses));
    
    // Update state
    setExpenses(updatedExpenses);
    
    // Calculate new total for this date
    const newDateTotal = updatedExpenses
      .filter(exp => exp.date === dateToUpdate)
      .reduce((sum, exp) => sum + exp.total, 0);
    
    // Update calendar data
    const updatedDates = calendarDates.map(dateInfo => {
      if (dateInfo.date === dateToUpdate) {
        return {
          ...dateInfo,
          amount: newDateTotal || dateInfo.amount
        };
      }
      return dateInfo;
    });
    
    setCalendarDates(updatedDates);
  };

  // Add this function to handle saving the edited goal
  const handleSaveGoal = (e) => {
    e.preventDefault();
    setIsEditingGoal(false);
    
    // Optional: Save to localStorage
    localStorage.setItem('kachingko-financial-goal', JSON.stringify(financialGoal));
  };

  // Function to generate random spending insights
  const getRandomInsights = () => {
    const insights = [
      "Your coffee spending is 80% over your monthly cap.",
      "You've spent 35% more on dining out this month compared to last month.",
      "Grocery expenses are 15% under budget this month. Great job!",
      "Entertainment spending has increased by 42% in the last two weeks.",
      "You're spending 28% more on transportation than your average.",
      "Online shopping expenses have doubled compared to last month.",
      "You could save ₱1,200 monthly by reducing takeout orders.",
      "Your utility bills are 12% higher than the seasonal average."
    ];

  return (
    <>
      <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
        <p className="text-black">{insights[0]}</p>
      </div>
      <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
        <p className="text-black">{insights[5]}</p>
      </div>
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
                          onClick={() => handleDeleteItem(expenseIndex, itemIndex)}
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
        <h2 className="text-lg font-medium mb-4 text-black">
          {selectedDate 
            ? `Expense Categories for ${isClient ? new Date(selectedDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric'}) : selectedDate}`
            : 'Overall Expense Categories'
          }
        </h2>
        <div className="h-64">
          {isClient && <Pie data={chartData} options={chartOptions} />}
          {!isClient && <div className="w-full h-full flex items-center justify-center text-black">Loading chart...</div>}
        </div>
      </div>

      {/* Financial Goal Progress */}
      <div className="m-4 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4 text-black">
          <h2 className="text-lg font-medium text-black">Financial Goal</h2>
          <button 
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="p-1 text-black hover:bg-gray-100 rounded-full"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
        
        {isEditingGoal ? (
          <form onSubmit={handleSaveGoal} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Goal Description
              </label>
              <input 
                type="text" 
                value={financialGoal.description}
                onChange={(e) => setFinancialGoal({...financialGoal, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Amount (₱)
                </label>
                <input 
                  type="number" 
                  value={financialGoal.target}
                  onChange={(e) => setFinancialGoal({...financialGoal, target: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Current Progress (₱)
                </label>
                <input 
                  type="number" 
                  value={financialGoal.current}
                  onChange={(e) => setFinancialGoal({...financialGoal, current: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  min="0"
                  max={financialGoal.target}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Goal
            </button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-black">{financialGoal.description}</p>
              <p className="text-black font-bold">
                {Math.round((financialGoal.current / financialGoal.target) * 100)}%
              </p>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div 
                className="h-3 bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(100, (financialGoal.current / financialGoal.target) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-black mt-2">
              ₱{financialGoal.current.toLocaleString()} saved of ₱{financialGoal.target.toLocaleString()} goal
            </p>
          </>
        )}
      </div>

      {/* Spending Insights */}
      <div className="m-4 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4 text-black">Spending Insights</h2>
        <div className="space-y-3">
          {getRandomInsights()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

