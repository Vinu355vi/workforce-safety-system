'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#0a0515]/90 border-t border-white/5 py-12 px-6 mt-20 relative z-10 glass-effect rounded-none mt-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-2xl text-white tracking-widest">NEXVISI</span>
          </div>
          <p className="text-gray-400 text-sm max-w-sm">
            Empowering the future of workforce safety with cutting edge AI and deep learning insights.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-12">
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-purple-400 transition">Dashboard</Link>
              <Link href="/live-monitoring" className="text-sm text-gray-400 hover:text-purple-400 transition">Live Monitoring</Link>
              <Link href="/video-analysis" className="text-sm text-gray-400 hover:text-purple-400 transition">Video Analysis</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="#service" className="text-sm text-gray-400 hover:text-purple-400 transition">Service</Link>
              <Link href="#feature" className="text-sm text-gray-400 hover:text-purple-400 transition">Features</Link>
              <a href="mailto:contact@nexvisi.ai" className="text-sm text-gray-400 hover:text-purple-400 transition">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between items-center px-4">
        <p className="text-xs text-gray-500">© 2026 NEXVISI. All rights reserved.</p>
        <p className="text-xs text-gray-500">Developed by Vinushree</p>
        <div className="flex gap-4">
          <Link href="#" className="text-xs text-gray-500 hover:text-white transition">Privacy Policy</Link>
          <Link href="#" className="text-xs text-gray-500 hover:text-white transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}