"use client"

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, ChartBarIcon, GiftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ClockIcon, CogIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scan');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptItems, setReceiptItems] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captureMethod, setCaptureMethod] = useState('camera'); // 'camera' or 'upload'
  
  // Initialize Gemini API - replace with your actual API key
  const genAI = new GoogleGenerativeAI("");

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setCaptureMethod('camera');
    setErrorMessage('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setCaptureMethod('upload');
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage('Please select a valid image file.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setReceiptItems([]);
    setShowResults(false);
    setErrorMessage('');
  };

  const confirmPhoto = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      await processReceiptWithGemini(capturedImage);
    } catch (error) {
      console.error("Error processing receipt:", error);
      setErrorMessage('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowResults(true);
    }
  };

  const processReceiptWithGemini = async (imageBase64) => {
    try {
      // Strip the data URL prefix to get just the base64 data
      const base64Data = imageBase64.split(',')[1];
      
      // Initialize the Gemini 1.5 Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prepare the image data
      const imageData = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };
      
      // Create a more explicit prompt for the model
      const prompt = `
        Extract the receipt information from this image.
        
        I need you to:
        1. Identify individual items purchased
        2. Extract the price for each item
        3. Categorize each item (e.g., Groceries, Electronics, Restaurant)
        
        Return ONLY a valid JSON object with this structure:
        {
          "items": [
            {
              "name": "Item name",
              "price": 10.99,
              "category": "Category name"
            },
            ...more items
          ]
        }
        
        Do not include any explanation or text outside of the JSON structure. 
        The response must be parseable as JSON.
      `;
      
      // Generate content from the image
      const result = await model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      
      console.log("Raw response from Gemini:", text);
      
      // Extract JSON using regex to handle various response formats
      let jsonData;
      try {
        // First try: Look for code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonData = JSON.parse(jsonMatch[1].trim());
        }
        // Second try: Look for raw JSON objects
        else if (text.includes('{') && text.includes('}')) {
          const jsonStr = text.substring(
            text.indexOf('{'),
            text.lastIndexOf('}') + 1
          );
          jsonData = JSON.parse(jsonStr);
        }
        // Third try: Try the entire text as JSON
        else {
          jsonData = JSON.parse(text.trim());
        }
        
        console.log("Successfully parsed JSON:", jsonData);
        
        if (jsonData && jsonData.items && Array.isArray(jsonData.items)) {
          setReceiptItems(jsonData.items);
        } else {
          // If JSON doesn't have the expected structure
          throw new Error("Unexpected JSON structure");
        }
      } catch (parseError) {
        console.error("Error parsing JSON from Gemini:", parseError);
        
        // As a fallback, try to extract data using a very simple approach
        // This is useful when the model doesn't return proper JSON
        const itemRegex = /[\w\s]+\s+\$?\d+\.\d+/g;
        const items = text.match(itemRegex);
        
        if (items && items.length > 0) {
          const extractedItems = items.map(item => {
            const parts = item.trim().split(/\s+(?=\$?\d+\.\d+$)/);
            const name = parts[0].trim();
            const priceStr = parts[1].replace('$', '').trim();
            const price = parseFloat(priceStr);
            
            return {
              name,
              price,
              category: "Uncategorized"
            };
          });
          
          setReceiptItems(extractedItems);
        } else {
          throw new Error("Failed to extract receipt data");
        }
      }
    } catch (error) {
      console.error("Error with Gemini API:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top header with icons */}
      <header className="bg-white py-3 px-4 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold text-blue-500">KachingKo</h1>
        <div className="flex items-center space-x-4">
          <Link href="/history" className="p-2">
            <ClockIcon className="w-6 h-6 text-gray-600" />
          </Link>
          <Link href="/settings" className="p-2">
            <CogIcon className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="flex-grow flex flex-col">
        {activeTab === 'scan' && (
          <>
            {!capturedImage ? (
              <div className="relative flex-grow flex flex-col items-center justify-center bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment" // Use the back camera if available
                  }}
                  className="w-full h-full object-cover"
                />
                
                {/* Hidden file input for image upload */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Capture and upload buttons */}
                <div className="absolute bottom-6 flex space-x-4 items-center">
                  <button 
                    onClick={triggerFileInput}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ArrowUpTrayIcon className="w-6 h-6 text-blue-500" />
                  </button>
                  <button 
                    onClick={capture}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CameraIcon className="w-8 h-8 text-blue-500" />
                  </button>
                </div>
                
                {/* Helper text */}
                <div className="absolute top-4 left-0 right-0 text-center">
                  <p className="text-white bg-black bg-opacity-50 inline-block px-4 py-2 rounded-lg">
                    Position receipt in frame or upload an image
                  </p>
                </div>
              </div>
            ) : showResults ? (
              <div className="flex-grow p-4 overflow-auto">
                <h2 className="text-xl font-bold mb-4">Receipt Items</h2>
                
                {errorMessage && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{errorMessage}</p>
                  </div>
                )}
                
                {receiptItems.length > 0 ? (
                  <div className="space-y-3">
                    {receiptItems.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <p className="font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t mt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${receiptItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={retakePhoto}
                      className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
                    >
                      Scan Another Receipt
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p>No items detected. Try scanning again.</p>
                    <button 
                      onClick={retakePhoto}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Scan Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative flex-grow">
                {/* Display captured image */}
                <img 
                  src={capturedImage} 
                  alt="Captured receipt" 
                  className="w-full h-full object-contain bg-black"
                />
                
                {/* Confirmation overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
                  <div className="flex justify-center space-x-8">
                    <button 
                      onClick={retakePhoto}
                      className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                      disabled={isProcessing}
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                    <button 
                      onClick={confirmPhoto}
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckIcon className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-white text-center mt-2">
                    {isProcessing ? "Processing receipt..." : "Use this photo?"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'budget' && (
          <div className="flex-grow p-6">
            <h2 className="text-2xl font-bold mb-4">Your Budget</h2>
            <p className="text-gray-600">Budget information will be displayed here.</p>
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="flex-grow p-6">
            <h2 className="text-2xl font-bold mb-4">Your Rewards</h2>
            <p className="text-gray-600">Rewards information will be displayed here.</p>
          </div>
        )}
      </main>
      
      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200">
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'scan' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <CameraIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Scan</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'budget' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <ChartBarIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Budget</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'rewards' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <GiftIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Rewards</span>
          </button>
        </div>
      </nav>
    </div>
  );
}