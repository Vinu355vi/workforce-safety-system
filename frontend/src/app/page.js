'use client';

import { motion } from 'framer-motion';
import { 
  ShieldIcon, 
  VideoIcon, 
  FileTextIcon, 
  ActivityIcon,
  CheckCircleIcon,
  UsersIcon,
  CameraIcon,
  BarChart3Icon
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const services = [
    {
      icon: CameraIcon,
      title: 'Live CCTV Monitoring',
      description: 'Connect to your existing camera infrastructure for real-time safety monitoring of active work zones.',
      color: 'blue'
    },
    {
      icon: VideoIcon,
      title: 'Video Analysis',
      description: 'Upload pre-recorded project footage for detailed post-incident analysis and reporting.',
      color: 'green'
    },
    {
      icon: FileTextIcon,
      title: 'Automated Reporting',
      description: 'Generate comprehensive daily, weekly, and monthly safety compliance reports.',
      color: 'purple'
    },
    {
      icon: ActivityIcon,
      title: 'Instant Alerts',
      description: 'Receive immediate notifications when workers enter hazardous zones or remove PPE.',
      color: 'red'
    }
  ];

  const features = [
    'Real-time PPE Detection (Helmets, Vests)',
    'Restricted Zone Intrusion Alerts',
    'Worker Posture and Fall Detection',
    'WebSocket-based Live Updates',
    'YOLOv8 AI Vision Integration',
    'Historical Analytics Dashboard'
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888081622-3a562479dc0a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#0F172A]/80 to-[#1E293B]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <ShieldIcon className="w-10 h-10 text-blue-500 glow-effect" />
              <span className="text-xl font-bold tracking-widest">
                <span className="text-blue-400">Safety</span>
                <span className="text-emerald-400">Monitor</span>
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Intelligent <span className="gradient-text">Workforce</span> Monitoring
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              Empower your site management with AI-driven computer vision. Automatically detect missing PPE, hazardous zone entry, and worker safety incidents in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
                Start Free Trial
              </Link>
              <Link href="#service" className="px-8 py-4 rounded-full glass-effect font-semibold text-lg hover:bg-white/10 transition-all">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="service" className="py-20 bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Our <span className="text-blue-400">Services</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Tailored computer vision solutions designed specifically for industrial, construction, and manufacturing environments.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${service.color}-500/20 to-${service.color}-600/20 flex items-center justify-center mb-6`}>
                  <service.icon className={`w-8 h-8 text-${service.color}-400`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="feature" className="py-20 relative">
        <div className="absolute inset-0 bg-[#0F172A]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">Powerful <span className="text-purple-400">Features</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Built on top of cutting-edge neural networks, NEXVISI ensures your workforce remains compliant with safety protocols without requiring constant manual oversight.
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 glass-effect p-4 rounded-lg"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
                    <span className="text-gray-200 font-medium">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] w-full rounded-2xl overflow-hidden glass-effect border border-white/10 p-2"
            >
              <div className="w-full h-full bg-[#1E293B] rounded-xl flex items-center justify-center flex-col gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                
                {/* Simulated UI Overlay */}
                <div className="absolute top-4 left-4 glass-effect px-4 py-2 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm font-bold">LIVE CAMERA 01</span>
                </div>
                
                {/* Simulated AI Boxes */}
                <div className="absolute top-1/3 left-1/4 w-32 h-48 border-2 border-green-500 rounded-lg flex flex-col justify-end p-1">
                  <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 w-fit rounded">Helmet 98%</span>
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-48 border-2 border-red-500 rounded-lg flex flex-col justify-end p-1">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 w-fit rounded">No Vest 95%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldIcon className="w-16 h-16 text-blue-500 mx-auto mb-6 glow-effect" />
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Workspace?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join leading construction and manufacturing companies who trust NEXVISI to keep their teams safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              Create an Account
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-full border border-gray-600 font-semibold text-lg hover:bg-gray-800 transition-all">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
