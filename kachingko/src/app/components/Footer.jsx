// components/Footer.jsx
"use client"

import { CameraIcon, ChartBarIcon, GiftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link 
          href="/"
          className={`flex flex-col items-center py-3 px-6 ${pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <CameraIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Scan</span>
        </Link>
        
        <Link 
          href="/smart-budget"
          className={`flex flex-col items-center py-3 px-6 ${pathname === '/smart-budget' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <ChartBarIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Budget</span>
        </Link>
        
        <Link 
          href="/smart-rewards"
          className={`flex flex-col items-center py-3 px-6 ${pathname === '/smart-rewards' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <GiftIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Rewards</span>
        </Link>
      </div>
    </div>
  );
}