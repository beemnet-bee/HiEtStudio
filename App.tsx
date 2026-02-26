
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard,
  Zap,
  Bot,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Video,
  Radio,
  Globe,
  Code2,
  Mic2,
  Map as MapIcon,
  Menu,
  FileBox,
  FileText,
  Search,
  Sparkles,
  Image as ImageIcon,
  Volume2,
  QrCode,
  LogOut,
  Hammer,
  Sparkle,
  Bell,
  BrainCircuit,
  Languages,
  Thermometer,
  Binary,
  Calculator,
  Moon,
  Sun,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ToolType, ToolConfig } from './types';
import ChatTool from './tools/ChatTool';
import SummarizerTool from './tools/SummarizerTool';
import OCRTool from './tools/OCRTool';
import ImageGenTool from './tools/ImageGenTool';
import ImageEditTool from './tools/ImageEditTool';
import TTSTool from './tools/TTSTool';
import QRScannerTool from './tools/QRScannerTool';
import DocManagerTool from './tools/DocManagerTool';
import VideoGenTool from './tools/VideoGenTool';
import LiveCompanionTool from './tools/LiveCompanionTool';
import SearchTool from './tools/SearchTool';
import CodeTool from './tools/CodeTool';
import NavigatorTool from './tools/NavigatorTool';
import STTTool from './tools/STTTool';
import TextForgeTool from './tools/TextForgeTool';
import LogicSolverTool from './tools/LogicSolverTool';
import TranslateTool from './tools/TranslateTool';
import SentimentTool from './tools/SentimentTool';
import DataPulseTool from './tools/DataPulseTool';
import MathSolverTool from './tools/MathSolverTool';
import LandingPage from './components/LandingPage';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert';
  read: boolean;
}

const TOOLS: ToolConfig[] = [
  { id: 'chat', name: 'AI Chat', description: 'Conversational core', icon: <Bot className="w-3.5 h-3.5" />, color: 'bg-blue-600', category: 'Text' },
  { id: 'logic-solver', name: 'Logic Solver', description: 'Deep reasoning engine', icon: <BrainCircuit className="w-3.5 h-3.5" />, color: 'bg-purple-600', category: 'Engineering' },
  { id: 'math-solver', name: 'Math Studio', description: 'Calculus & spatial plotting', icon: <Calculator className="w-3.5 h-3.5" />, color: 'bg-yellow-600', category: 'Engineering' },
  { id: 'code-architect', name: 'Code Architect', description: 'Engineering assistant', icon: <Code2 className="w-3.5 h-3.5" />, color: 'bg-indigo-600', category: 'Engineering' },
  { id: 'translate-matrix', name: 'Translate Matrix', description: 'Multi-lingual synthesis', icon: <Languages className="w-3.5 h-3.5" />, color: 'bg-emerald-600', category: 'Text' },
  { id: 'data-pulse', name: 'Data Pulse', description: 'Structural data analysis', icon: <Binary className="w-3.5 h-3.5" />, color: 'bg-cyan-600', category: 'Analysis' },
  { id: 'sentiment-analyst', name: 'Sentiment Analyst', description: 'Psychological profiling', icon: <Thermometer className="w-3.5 h-3.5" />, color: 'bg-rose-600', category: 'Analysis' },
  { id: 'text-forge', name: 'Text Forge', description: 'Neural content generation', icon: <Hammer className="w-3.5 h-3.5" />, color: 'bg-amber-600', category: 'Text' },
  { id: 'video-gen', name: 'Video Studio', description: 'Veo 3.1 Synthesis', icon: <Video className="w-3.5 h-3.5" />, color: 'bg-rose-600', category: 'Creative' },
  { id: 'live-companion', name: 'Live Companion', description: 'Real-time vision link', icon: <Radio className="w-3.5 h-3.5" />, color: 'bg-fuchsia-600', category: 'Creative' },
  { id: 'global-search', name: 'Global Search', description: 'Live web grounding', icon: <Globe className="w-3.5 h-3.5" />, color: 'bg-sky-500', category: 'Utility' },
  { id: 'navigator', name: 'Navigator', description: 'Spatial intelligence', icon: <MapIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-600', category: 'Utility' },
  { id: 'doc-hub', name: 'Doc Hub', description: 'Document processing', icon: <FileBox className="w-3.5 h-3.5" />, color: 'bg-violet-600', category: 'Document' },
  { id: 'audio-pulse', name: 'Audio Pulse', description: 'Transcription core', icon: <Mic2 className="w-3.5 h-3.5" />, color: 'bg-rose-500', category: 'Audio' },
  { id: 'summarizer', name: 'Summarizer', description: 'Content distillation', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-indigo-500', category: 'Text' },
  { id: 'ocr', name: 'Vision OCR', description: 'Image text extraction', icon: <Search className="w-3.5 h-3.5" />, color: 'bg-teal-600', category: 'Vision' },
  { id: 'image-gen', name: 'Studio Art', description: 'High-fidelity synthesis', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'bg-orange-600', category: 'Vision' },
  { id: 'image-edit', name: 'Photo Logic', description: 'Semantic editing', icon: <ImageIcon className="w-3.5 h-3.5" />, color: 'bg-amber-500', category: 'Vision' },
  { id: 'tts', name: 'Voice Lab', description: 'Realistic TTS engine', icon: <Volume2 className="w-3.5 h-3.5" />, color: 'bg-cyan-600', category: 'Audio' },
  { id: 'qr-scanner', name: 'Matrix Scan', description: 'Pattern identification', icon: <QrCode className="w-3.5 h-3.5" />, color: 'bg-emerald-500', category: 'Utility' },
];

const staggerVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 25 } }
};

const SidebarTooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-2xl pointer-events-none border border-white/5">
    {text}
  </div>
);

const Dashboard: React.FC<{ onSelect: (id: ToolType) => void; usage: Record<string, number> }> = ({ onSelect, usage }) => {
  const totalInvocations = (Object.values(usage) as number[]).reduce((a, b) => a + b, 0);
  const chartBars = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 80 + 20)), []);
  
  return (
    <motion.div variants={staggerVariants} initial="initial" animate="animate" className="space-y-6 pb-12 w-full max-w-full min-h-0 flex-1 overflow-y-auto custom-scrollbar">
      <motion.div variants={itemVariants} className="max-w-full space-y-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/10">
          <Sparkle className="w-2.5 h-2.5 text-blue-500" />
          <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Neural Nexus v4.2.0</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase truncate">SYSTEM <span className="gradient-text">INTELLIGENCE.</span></h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed line-clamp-2">Multimodal studio monitor. Analyzing logical synthesis in real-time across the HIET core network.</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full shrink-0">
        <div className="md:col-span-2 lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col justify-between h-40 group border-l-4 border-blue-500 overflow-hidden relative">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Compute Cycles</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalInvocations}</h4>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-end justify-between h-12 gap-1 px-1">
            {chartBars.map((val, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="flex-1 bg-blue-500/20 rounded-t-sm relative overflow-hidden"
              >
                <motion.div 
                  animate={{ y: [0, -100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
                  className="absolute inset-0 bg-gradient-to-t from-blue-500/0 via-blue-500/30 to-blue-500/0"
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-1 lg:col-span-1 glass-card p-5 rounded-2xl flex flex-col justify-between h-40 border-l-4 border-emerald-500">
           <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Node Status</p>
              <h4 className="text-xl font-black text-emerald-500 uppercase mt-1">Operational</h4>
           </div>
           <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                 <span>Latency</span>
                 <span>24ms</span>
              </div>
              <div className="w-full bg-emerald-500/10 h-1 rounded-full overflow-hidden">
                 <div className="bg-emerald-500 h-full w-[20%]"></div>
              </div>
           </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {TOOLS.map((tool) => (
          <button key={tool.id} onClick={() => onSelect(tool.id)} className="glass-card group p-3.5 rounded-2xl text-left hover:scale-[1.02] transition-all flex flex-col h-32 overflow-hidden border border-black/5 dark:border-white/5">
            <div className={`w-7 h-7 ${tool.color} text-white rounded-lg flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 transition-transform`}>{tool.icon}</div>
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{tool.name}</h3>
            <p className="text-slate-500 dark:text-slate-600 text-[9px] mt-0.5 line-clamp-2 leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'landing' | 'app'>('splash');
  const [activeTool, setActiveTool] = useState<ToolType | 'dashboard'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'Neural Link Established', message: 'HIET Core 4.2.0 synchronized.', timestamp: '2m ago', type: 'success', read: false },
  ]);

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('hiet_theme') === 'dark');
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => JSON.parse(localStorage.getItem('omnitool_usage_v4') || '{}'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('hiet_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => setAppState('landing'), 3500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleToolSelect = (id: ToolType) => {
    setUsageStats(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setActiveTool(id);
    setMobileMenuOpen(false);
    setShowNotifications(false);
  };

  const categories = useMemo(() => Array.from(new Set(TOOLS.map(t => t.category))), []);

  return (
    <AnimatePresence mode="wait">
      {appState === 'splash' && (
        <motion.div key="splash" exit={{ opacity: 0 }} className="fixed inset-0 bg-white dark:bg-[#01040a] z-[100] flex flex-col items-center justify-center p-6">
          <Zap className="w-10 h-10 text-slate-900 dark:text-white mb-4 animate-pulse" />
          <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">HI<span className="text-blue-600">ET</span></h1>
        </motion.div>
      )}

      {appState === 'landing' && <LandingPage onGetStarted={() => setAppState('app')} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}

      {appState === 'app' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen bg-slate-50 dark:bg-[#01040a] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
          <AnimatePresence>
            {mobileMenuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setMobileMenuOpen(false)} />}
          </AnimatePresence>

          <aside className={`fixed lg:relative inset-y-0 left-0 z-[70] p-2 ${sidebarOpen ? 'w-[210px]' : 'w-[72px]'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden`}>
            <div className="flex-1 glass-card rounded-2xl flex flex-col p-2 border border-black/5 dark:border-white/5 overflow-hidden">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex absolute -right-2.5 top-10 w-5 h-5 glass-card rounded-full items-center justify-center shadow-lg hover:bg-white/10 z-[80] border border-black/5 dark:border-white/5">
                {sidebarOpen ? <ChevronLeft className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
              </button>

              <div className="p-3 flex items-center shrink-0 mb-6 cursor-pointer" onClick={() => setActiveTool('dashboard')}>
                <div className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-lg"><Zap className="w-4 h-4 fill-current" /></div>
                {sidebarOpen && <p className="font-black text-sm ml-3 tracking-tighter uppercase leading-none truncate">HI<span className="text-blue-600">ET</span></p>}
              </div>

              <nav className="flex-1 space-y-5 overflow-y-auto custom-scrollbar px-1 min-h-0">
                <button onClick={() => setActiveTool('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${activeTool === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/10 text-slate-400'}`}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest truncate">Dashboard</span>}
                  {!sidebarOpen && <SidebarTooltip text="Dashboard" />}
                </button>

                {categories.map(cat => (
                  <div key={cat} className="space-y-1">
                    {sidebarOpen ? (
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] px-3 mb-2 truncate">{cat}</p>
                    ) : (
                      <div className="h-px bg-black/5 dark:bg-white/5 mx-2 my-4" />
                    )}
                    {TOOLS.filter(t => t.category === cat).map(tool => (
                      <button key={tool.id} onClick={() => handleToolSelect(tool.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative ${activeTool === tool.id ? 'bg-white dark:bg-white text-slate-950 sidebar-item-pulse shadow-sm' : 'hover:bg-white/10 text-slate-400 dark:text-slate-500'}`}>
                        <div className="shrink-0">{tool.icon}</div>
                        {sidebarOpen && <span className="truncate text-[10px] font-bold tracking-tight">{tool.name}</span>}
                        {!sidebarOpen && <SidebarTooltip text={tool.name} />}
                        {activeTool === tool.id && !sidebarOpen && <div className="absolute left-0 w-1 h-4 bg-blue-600 rounded-r-full" />}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>

              <button onClick={() => setAppState('landing')} className="mt-4 p-3 text-slate-400 hover:text-rose-600 transition-all rounded-xl flex items-center gap-3 shrink-0 group relative">
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="text-[9px] font-black uppercase tracking-widest truncate">Disconnect</span>}
                {!sidebarOpen && <SidebarTooltip text="Disconnect" />}
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col relative h-full min-w-0 overflow-hidden">
            <header className="h-14 sm:h-16 flex items-center justify-between px-6 sm:px-10 shrink-0 bg-white/50 dark:bg-[#01040a]/50 backdrop-blur-xl border-b border-black/5 dark:border-white/5 z-40">
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 glass-card rounded-lg" onClick={() => setMobileMenuOpen(true)}><Menu className="w-4 h-4" /></button>
                <h2 className="text-sm font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white truncate">
                  {activeTool === 'dashboard' ? 'Studio Overview' : TOOLS.find(t => t.id === activeTool)?.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 glass-card rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm border border-black/5 dark:border-white/5">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 glass-card rounded-xl transition-all shadow-sm relative border border-black/5 dark:border-white/5 ${showNotifications ? 'text-blue-500' : 'text-slate-400'}`}>
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>}
                  </button>
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-80 glass-card rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl z-[100] overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/50">
                           <h4 className="text-[10px] font-black uppercase tracking-widest">Logs</h4>
                           <button onClick={() => setNotifications([])} className="text-[8px] font-bold text-slate-400 hover:text-red-500">Clear</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                          {notifications.length ? notifications.map(n => (
                            <div key={n.id} className="p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 mb-1 transition-colors">
                              <p className="text-[10px] font-black text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400">{n.message}</p>
                            </div>
                          )) : <p className="text-[9px] text-center py-8 text-slate-500 uppercase tracking-widest font-black opacity-30">Buffer Empty</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div className="flex-1 relative min-h-0">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 sm:px-10 py-6">
                <motion.div key={activeTool} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto h-full min-h-0 flex flex-col">
                  {activeTool === 'dashboard' && <Dashboard onSelect={handleToolSelect} usage={usageStats} />}
                  {activeTool === 'chat' && <ChatTool />}
                  {activeTool === 'summarizer' && <SummarizerTool />}
                  {activeTool === 'ocr' && <OCRTool />}
                  {activeTool === 'image-gen' && <ImageGenTool />}
                  {activeTool === 'image-edit' && <ImageEditTool />}
                  {activeTool === 'tts' && <TTSTool />}
                  {activeTool === 'qr-scanner' && <QRScannerTool />}
                  {activeTool === 'doc-hub' && <DocManagerTool />}
                  {activeTool === 'video-gen' && <VideoGenTool />}
                  {activeTool === 'live-companion' && <LiveCompanionTool />}
                  {activeTool === 'global-search' && <SearchTool />}
                  {activeTool === 'code-architect' && <CodeTool />}
                  {activeTool === 'navigator' && <NavigatorTool />}
                  {activeTool === 'audio-pulse' && <STTTool />}
                  {activeTool === 'text-forge' && <TextForgeTool />}
                  {activeTool === 'logic-solver' && <LogicSolverTool />}
                  {activeTool === 'translate-matrix' && <TranslateTool />}
                  {activeTool === 'sentiment-analyst' && <SentimentTool />}
                  {activeTool === 'data-pulse' && <DataPulseTool />}
                  {activeTool === 'math-solver' && <MathSolverTool />}
                </motion.div>
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
