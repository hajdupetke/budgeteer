'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function AnimatedSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bg-white shadow-xl border right-4 top-4 z-40 rounded-md p-2 text-gray-700 hover:bg-gray-300 focus:outline-hidden focus:ring-2 focus:ring-gray-400"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={`fixed md:sticky h-full pt-6 w-full sm:w-[250px] shrink-0 flex justify-center bg-gray-50 drop-shadow-md rounded-xl inset-y-0 left-0 z-30 transform overflow-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div>{children}</div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-200/30 backdrop-blur-xs transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
