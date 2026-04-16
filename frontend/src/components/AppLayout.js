'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout({ children }) {
  const pathname = usePathname();

  // Pages that don't need the dashboard sidebar
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  const isHomePage = pathname === '/';

  if (isPublicPage) {
    return (
      <div className="flex flex-col min-h-screen">
        {isHomePage && <Navbar />}
        <main className={`flex-grow ${isHomePage ? 'pt-20' : ''}`}>
          {children}
        </main>
        {isHomePage && <Footer />}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar for Dashboard Routes */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-12 lg:pt-0 lg:ml-64 transition-all duration-300">
        <Header />
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}