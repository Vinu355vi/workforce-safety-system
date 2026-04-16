'use client';
import Link from 'next/link';
import { ShieldIcon, ArrowRightIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 glass-effect border-b border-white/5 rounded-none px-6 py-4 flex justify-between items-center transition-all bg-[#0a0515]/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 ml-4">
        <ShieldIcon className="w-8 h-8 text-purple-500 glow-effect" />
        <span className="font-bold text-xl text-white tracking-widest">NEXVISI</span>
      </div>
      
      <div className="hidden md:flex space-x-12 absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="text-sm font-medium text-white hover:text-purple-400 transition tracking-wide">Home</Link>
        <Link href="#service" className="text-sm font-medium text-gray-400 hover:text-purple-400 transition tracking-wide">Service</Link>
        <Link href="#feature" className="text-sm font-medium text-gray-400 hover:text-purple-400 transition tracking-wide">Feature</Link>
        <Link href="#contact" className="text-sm font-medium text-gray-400 hover:text-purple-400 transition tracking-wide">Contact</Link>
      </div>

      <div className="flex items-center gap-6 mr-4">
        <Link href="/login" className="text-sm text-gray-400 font-medium hover:text-white transition">Log In</Link>
        <Link href="/signup" className="text-sm text-gray-400 font-medium hover:text-white transition">Sign Up</Link>
        <Link href="/dashboard" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all">
          Get Started
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </nav>
  );
}