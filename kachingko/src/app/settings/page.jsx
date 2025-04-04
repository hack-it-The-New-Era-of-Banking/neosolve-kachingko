"use client"

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, ChartBarIcon, GiftIcon } from '@heroicons/react/24/solid';
import { ClockIcon, CogIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scan');
  const webcamRef = useRef(null);
  
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Here you would process the image with your receipt scanning logic
    console.log("Image captured:", imageSrc);
    // For a hackathon demo, you could navigate to a "processing" screen
    // or simulate receipt analysis
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
      
      {/* Rest of your component remains the same */}
      <main className="flex-grow flex flex-col">
        {activeTab === 'scan' ? (
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
            
            {/* Capture button */}
            <div className="absolute bottom-6">
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
                Position receipt in frame and tap the camera button
              </p>
            </div>
          </div>
        ) : activeTab === 'budget' ? (
          <div className="flex-grow p-6">
            <h2 className="text-2xl font-bold mb-4">Your Budget</h2>
            <p className="text-gray-600">Budget information will be displayed here.</p>
          </div>
        ) : (
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