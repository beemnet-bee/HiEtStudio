
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, Cpu, Sparkles, ArrowRight, Shield, Globe, Radio, Network, Database, ChevronRight, Layout, Moon, Sun } from 'lucide-react';

const LandingPage: React.FC<{ onGetStarted: () => void; isDarkMode: boolean; toggleDarkMode: () => void }> = ({ onGetStarted, isDarkMode, toggleDarkMode }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01040a] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-300">
      {/* Precision Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Neural Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-violet-500/5 dark:bg-violet-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Studio Navigation */}
      <nav className="fixed top-0 left-0 w-full h-16 px-8 md:px-16 flex items-center justify-between z-50 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#01040a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="text-lg font-black tracking-tighter">HI<span className="text-blue-600 dark:text-blue-500">ET</span> <span className="text-xs text-slate-400 dark:text-slate-600 ml-1 font-bold uppercase tracking-[0.2em]">Studio</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
           {['Modules', 'Network', 'Compliance', 'Pricing'].map(link => (
             <button key={link} className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">{link}</button>
           ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            Initialize Protocol
          </button>
        </div>
      </nav>

      {/* Main Terminal Area */}
      <main className="pt-32 pb-24 px-8 md:px-16 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-16">
          
          <div className="space-y-6 max-w-4xl">
            <motion.div variants={item} className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/10">
              <Sparkles className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">HIET Core 3.2.0 Deploying</span>
            </motion.div>

            <motion.h1 variants={item} className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-slate-900 dark:text-white">
              ENGINEERING <br /> <span className="gradient-text">COGNITIVE SYNC.</span>
            </motion.h1>

            <motion.p variants={item} className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
              A high-precision studio for designers and engineers. HIET integrates neural logic layers into a unified command center for advanced synthesis.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={onGetStarted}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-600/20 hover:scale-105 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
              >
                Enter Studio <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-10 py-5 bg-white dark:bg-white/5 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-black/5 dark:border-white/5 active:scale-95 shadow-sm">
                View Protocol Specs
              </button>
            </motion.div>
          </div>

          {/* Module Preview Bento */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Neural Logic", desc: "Unified high-fidelity processing of vision, audio, and textual logic streams.", icon: <Cpu />, color: 'bg-blue-500' },
              { title: "Zero Latency", desc: "Optimized for real-time human interaction using the 3.0 cognitive sync.", icon: <Zap />, color: 'bg-emerald-500' },
              { title: "Grounded Intel", desc: "Synthesized intelligence derived from real-time global data points.", icon: <Globe />, color: 'bg-sky-500' },
              { title: "Live Synthesis", desc: "Dynamic vision-sync companion for complex multi-modal task execution.", icon: <Radio />, color: 'bg-fuchsia-500' }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] flex flex-col group hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                <div className={`w-10 h-10 ${feature.color} text-white rounded-xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-black mb-3 text-slate-900 dark:text-white uppercase tracking-widest">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-600 text-[11px] font-medium leading-relaxed">{feature.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-[8px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Network Visualization Section */}
          <motion.div variants={item} className="relative glass-card rounded-[3rem] p-12 overflow-hidden flex flex-col items-center text-center gap-8">
             <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500 rounded-full animate-[ping_10s_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-violet-500 rounded-full animate-[ping_7s_infinite_reverse]"></div>
             </div>
             
             <div className="space-y-4 relative z-10">
                <h4 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">PRECISION <span className="text-slate-400 dark:text-slate-600">IN EVERY BIT.</span></h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.4em]">Optimized Neural Architecture</p>
             </div>

             <div className="flex flex-wrap justify-center gap-10 opacity-20 dark:opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 relative z-10">
                <div className="flex items-center gap-2"><Network className="w-5 h-5 text-blue-600 dark:text-blue-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Neural Link</span></div>
                <div className="flex items-center gap-2"><Database className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Core Storage</span></div>
                <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-rose-600 dark:text-rose-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">AES-256 Auth</span></div>
                <div className="flex items-center gap-2"><Layout className="w-5 h-5 text-violet-600 dark:text-violet-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Studio UI</span></div>
             </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Studio Footer */}
      <footer className="py-20 bg-white dark:bg-[#01040a] border-t border-black/5 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">HIET Studio</span>
            </div>
            <p className="text-slate-500 dark:text-slate-600 text-[11px] font-medium leading-relaxed">The high-fidelity multimodal laboratory for next-generation intelligence synthesis.</p>
          </div>
          <div>
            <h4 className="font-black mb-6 text-slate-300 dark:text-white/20 uppercase text-[9px] tracking-widest">Workspace</h4>
            <ul className="space-y-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Modules</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Node Status</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 text-slate-300 dark:text-white/20 uppercase text-[9px] tracking-widest">Ecosystem</h4>
            <ul className="space-y-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Link</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Global Terms</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Audit Logs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 text-slate-300 dark:text-white/20 uppercase text-[9px] tracking-widest">Support</h4>
            <ul className="space-y-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terminal Help</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Incident Sync</li>
              <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Contact Hub</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 md:px-16 pt-20 flex justify-between items-center text-[8px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em]">
           <span>© 2024 HIET Studio Neural Group</span>
           <span>v3.2.0 stable build</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
