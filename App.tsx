
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard,
  ArrowRight,
  Zap,
  Bot,
  Cpu,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
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
  User as UserIcon,
  Hammer,
  ShieldCheck,
  Sparkle,
  Network,
  Database,
  Bell,
  HardDrive,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BrainCircuit,
  Languages,
  Thermometer,
  Binary,
  Calculator,
  Sigma,
  Moon,
  Sun,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const staggerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
};

// --- Animated Visualization Components ---

const AnimatedLineChart: React.FC<{ color: string; height?: number }> = ({ color, height = 40 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const points = useMemo(() => Array.from({ length: 15 }, (_, i) => ({ x: i * 20, y: 10 + Math.random() * 60 })), []);
  const path = useMemo(() => `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`, [points]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 280;
    const index = Math.round(x / 20);
    if (index >= 0 && index < points.length) setHoverIndex(index);
  };

  return (
    <div className="w-full overflow-hidden relative" style={{ height: `${height}px` }}>
      <svg 
        viewBox="0 0 280 100" 
        className="w-full h-full preserve-3d cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d={`${path} L 280 100 L 0 100 Z`}
          fill={`url(#grad-${color.replace('#', '')})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        <AnimatePresence>
          {hoverIndex !== null && (
            <motion.circle
              key="hover-point"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].y}
              r="6"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          )}
        </AnimatePresence>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      {hoverIndex !== null && (
        <div className="absolute top-0 right-0 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-[8px] font-black border border-black/5 dark:border-white/10 shadow-xl pointer-events-none">
          VAL: {Math.round(100 - points[hoverIndex].y)}%
        </div>
      )}
    </div>
  );
};

const AnimatedBarChart: React.FC<{ bars?: number }> = ({ bars = 8 }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const data = useMemo(() => Array.from({ length: bars }, () => Math.random() * 100), [bars]);
  
  return (
    <div className="flex items-end justify-between gap-1 w-full h-16 px-1 relative">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${val}%` }}
          transition={{ delay: i * 0.05, duration: 0.8, ease: "backOut" }}
          onMouseEnter={() => setHoveredBar(i)}
          onMouseLeave={() => setHoveredBar(null)}
          className="flex-1 bg-blue-500/40 dark:bg-blue-500/30 rounded-t-sm relative group cursor-pointer"
        >
          <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
          {hoveredBar === i && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -25 }}
              className="absolute left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[6px] font-black px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-20"
            >
              {Math.round(val)}%
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const AnimatedPieChart: React.FC = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const segments = [
    { label: 'Engineering', value: 45, color: '#3b82f6' },
    { label: 'Analysis', value: 25, color: '#6366f1' },
    { label: 'Creative', value: 20, color: '#10b981' },
    { label: 'Vision', value: 10, color: '#f43f5e' },
  ];

  let cumulativePercent = 0;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
        {segments.map((s, i) => {
          const dashArray = `${s.value} 100`;
          const dashOffset = -cumulativePercent;
          cumulativePercent += s.value;
          return (
            <motion.circle
              key={i}
              cx="20"
              cy="20"
              r="15.9155"
              fill="transparent"
              stroke={s.color}
              strokeWidth={hoveredSegment === i ? "6" : "4"}
              strokeDasharray={dashArray}
              strokeDashoffset="100"
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ delay: 0.5 + i * 0.2, duration: 1, ease: "circOut" }}
              onMouseEnter={() => setHoveredSegment(i)}
              onMouseLeave={() => setHoveredSegment(null)}
              className="cursor-pointer transition-all duration-200"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 bg-white dark:bg-[#01040a] rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center text-center">
          {hoveredSegment !== null ? (
            <div className="animate-in fade-in zoom-in duration-300">
               <p className="text-[5px] font-black text-slate-400 uppercase leading-none">{segments[hoveredSegment].label}</p>
               <p className="text-[9px] font-black text-slate-900 dark:text-white leading-tight">{segments[hoveredSegment].value}%</p>
            </div>
          ) : (
            <PieChartIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---

const Dashboard: React.FC<{ onSelect: (id: ToolType) => void; usage: Record<string, number> }> = ({ onSelect, usage }) => {
  const totalInvocations = (Object.values(usage) as number[]).reduce((a, b) => a + b, 0);

  return (
    <motion.div variants={staggerVariants} initial="initial" animate="animate" className="space-y-6 pb-12 w-full max-w-full">
      {/* Header Info */}
      <motion.div variants={itemVariants} className="max-w-full space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/10">
          <Sparkle className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
          <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Neural Nexus v4.1.0</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
          SYSTEM <span className="gradient-text">INTELLIGENCE.</span>
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
          High-precision multi-modal dashboard. Monitoring neural pathing and logical synthesis in real-time.
        </p>
      </motion.div>

      {/* Analytics Bento Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
        {/* Main Cycle Count */}
        <div className="md:col-span-2 lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col justify-between h-40 group border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Compute Cycles</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalInvocations}</h4>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 dark:text-blue-400 group-hover:rotate-12 transition-transform">
               <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <AnimatedLineChart color="#3b82f6" height={50} />
            <p className="text-[7px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1">
              <Activity className="w-2.5 h-2.5" /> Synchronized Feed
            </p>
          </div>
        </div>

        {/* Neural Pathing Fidelity */}
        <div className="md:col-span-1 lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col justify-between h-40">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pathing Fidelity</p>
          <div className="flex items-center justify-between gap-4">
             <div className="space-y-1">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white">99.9<span className="text-lg opacity-50">%</span></h4>
                <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Lossless Sync</p>
             </div>
             <AnimatedPieChart />
          </div>
          <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '99.9%' }}
               transition={{ duration: 2 }}
               className="h-full bg-emerald-500"
             />
          </div>
        </div>

        {/* Load Distribution */}
        <div className="md:col-span-1 lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col justify-between h-40">
           <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Load Distribution</p>
              <BarChart3 className="w-3 h-3 text-slate-400 dark:text-slate-600" />
           </div>
           <AnimatedBarChart bars={10} />
           <div className="flex justify-between text-[7px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              <span>Engr</span>
              <span>Vis</span>
              <span>Creative</span>
           </div>
        </div>
      </motion.div>

      {/* Integrated Modules Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[9px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.4em]">Integrated Logic Modules</h2>
          <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {TOOLS.map((tool) => (
            <motion.button
              key={tool.id}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(tool.id)}
              className="glass-card bento-grid-item group p-3.5 rounded-2xl text-left relative overflow-hidden flex flex-col h-32"
            >
              <div className={`w-7 h-7 ${tool.color} text-white rounded-lg flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {tool.icon}
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-tight">{tool.name}</h3>
              <p className="text-slate-500 dark:text-slate-600 text-[9px] font-medium mt-0.5 leading-relaxed line-clamp-2">{tool.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[7px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Connect <ArrowRight className="w-1.5 h-1.5" />
                </span>
                <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[6px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                  {tool.category}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 bg-white dark:bg-[#01040a] z-[100] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg flex items-center justify-center shadow-2xl mb-4"
      >
        <Zap className="w-5 h-5 fill-current" />
      </motion.div>
      <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white mb-1 uppercase">HI<span className="text-blue-600 dark:text-blue-500">ET</span></h1>
      <p className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.6em]">Neural Access</p>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'landing' | 'app'>('splash');
  const [activeTool, setActiveTool] = useState<ToolType | 'dashboard'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'Neural Link Established', message: 'HIET Core 4.1.0 synchronized with operative node.', timestamp: '2m ago', type: 'success', read: false },
    { id: '2', title: 'Security Alert', message: 'Encryption layer updated. Zero-trust protocol active.', timestamp: '15m ago', type: 'info', read: false },
    { id: '3', title: 'Cycle Threshold', message: 'Compute cycles reaching daily optimization peak.', timestamp: '1h ago', type: 'alert', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('hiet_theme');
    return saved ? saved === 'dark' : false;
  });
  
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('omnitool_usage_v4');
    return saved ? JSON.parse(saved) : TOOLS.reduce((acc, t) => ({ ...acc, [t.id]: 0 }), {});
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hiet_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hiet_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('omnitool_usage_v4', JSON.stringify(usageStats));
  }, [usageStats]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleToolSelect = (id: ToolType) => {
    setUsageStats(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setActiveTool(id);
    setMobileMenuOpen(false);
    setShowNotifications(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterApp = () => {
    setAppState('app');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {appState === 'splash' && (
        <SplashScreen key="splash" onComplete={() => setAppState('landing')} />
      )}

      {appState === 'landing' && (
        <LandingPage 
          key="landing" 
          onGetStarted={handleEnterApp} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        />
      )}

      {appState === 'app' && (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-screen bg-slate-50 dark:bg-[#01040a] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300"
        >
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/70 backdrop-blur-md z-[60]" 
                onClick={() => setMobileMenuOpen(false)} 
              />
            )}
          </AnimatePresence>

          <aside className={`
            fixed lg:relative inset-y-0 left-0 z-[70] p-2
            ${sidebarOpen ? 'w-[200px]' : 'w-[72px]'} 
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col h-full
          `}>
            <div className="flex-1 glass-card rounded-2xl flex flex-col p-2 border border-black/5 dark:border-white/5 relative overflow-hidden">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex absolute -right-2.5 top-8 w-5 h-5 glass-card rounded-full items-center justify-center shadow-lg hover:bg-black/5 dark:hover:bg-white/10 z-[80]"
              >
                {sidebarOpen ? <ChevronLeft className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
              </button>

              <div className="p-2 flex items-center justify-center shrink-0 mb-4">
                <button onClick={() => setActiveTool('dashboard')} className="flex items-center gap-2 group relative">
                  <div className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md transition-colors duration-300">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  {sidebarOpen && (
                    <div className="text-left">
                      <p className="font-black text-sm tracking-tighter text-slate-900 dark:text-white leading-none uppercase">HI<span className="text-blue-600 dark:text-blue-500">ET</span></p>
                    </div>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                      HIET Home
                    </div>
                  )}
                </button>
              </div>

              <nav className="flex-1 px-0.5 space-y-0.5 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTool('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group relative ${activeTool === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                      Dashboard
                    </div>
                  )}
                </button>

                <div className="py-2 px-3"><div className="h-px bg-black/5 dark:bg-white/5 w-full"></div></div>

                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all group relative ${activeTool === tool.id ? 'bg-white dark:bg-white text-slate-950 shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                  >
                    <div className="flex-shrink-0">{tool.icon}</div>
                    {sidebarOpen && <span className="truncate text-[10px] font-bold">{tool.name}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                        {tool.name}
                      </div>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-4 p-0.5 space-y-0.5 border-t border-black/5 dark:border-white/5 pt-3">
                <button onClick={() => setAppState('landing')} className={`w-full flex items-center gap-2.5 p-2.5 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-500 transition-all rounded-xl group relative ${!sidebarOpen && 'justify-center'}`}>
                  <LogOut className="w-3.5 h-3.5" />
                  {sidebarOpen && <span className="text-[8px] font-black uppercase tracking-widest">Disconnect</span>}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                      Disconnect
                    </div>
                  )}
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col relative h-full w-full">
            <header className="h-14 sm:h-16 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50 bg-slate-50/80 dark:bg-[#01040a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors duration-300 w-full shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden p-2 glass-card rounded-lg text-slate-900 dark:text-white" 
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-3.5 h-3.5" />
                </button>
                <div className="space-y-0">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    {activeTool === 'dashboard' ? 'Studio Overview' : TOOLS.find(t => t.id === activeTool)?.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none">Protocol Secure</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                <button className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white bg-white dark:bg-white/5 shadow-sm rounded-lg">Operational</button>
                <button className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">Performance</button>
                <button className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">Resources</button>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 glass-card rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 glass-card rounded-xl transition-all shadow-sm relative ${showNotifications ? 'bg-blue-500/10 text-blue-600' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse ring-2 ring-white dark:ring-[#01040a]"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass-card rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden z-[100]"
                      >
                        <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/50">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                             <Activity className="w-3 h-3 text-blue-600" /> System Buffer
                           </h4>
                           <div className="flex gap-2">
                             <button onClick={markAllRead} className="text-[8px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Mark read</button>
                             <button onClick={clearNotifications} className="text-[8px] font-bold text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
                           </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                           {notifications.length > 0 ? notifications.map((n) => (
                             <div key={n.id} className={`p-3.5 rounded-2xl mb-1 transition-all group relative ${n.read ? 'opacity-50' : 'bg-blue-500/5 border border-blue-500/10'}`}>
                                <div className="flex items-start gap-3">
                                   <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'alert' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-start gap-2">
                                         <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{n.title}</p>
                                         <span className="text-[7px] font-bold text-slate-400 dark:text-slate-600 whitespace-nowrap uppercase tracking-widest">{n.timestamp}</span>
                                      </div>
                                      <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                   </div>
                                </div>
                             </div>
                           )) : (
                             <div className="py-12 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-3">
                                <Zap className="w-8 h-8 opacity-20" />
                                <p className="text-[9px] font-black uppercase tracking-widest">Buffer Empty</p>
                             </div>
                           )}
                        </div>
                        <div className="p-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 text-center">
                           <button onClick={() => setShowNotifications(false)} className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Close Protocol</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-hidden relative w-full">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 sm:px-10 py-6">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTool}
                    initial={{ opacity: 0, scale: 0.99, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.99, y: -5 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="max-w-6xl mx-auto h-full flex flex-col"
                  >
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
                </AnimatePresence>
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
