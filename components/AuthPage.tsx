
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowLeft, Loader2, Sparkles, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2, UserPlus, Globe, ChevronLeft } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  password?: string;
  provider: 'neural' | 'google' | 'guest';
  picture?: string;
}

const AuthPage: React.FC<{ onSuccess: (user: UserData) => void; onBack: () => void }> = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showGooglePortal, setShowGooglePortal] = useState(false);
  const [googlePortalView, setGooglePortalView] = useState<'select' | 'add'>('select');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [customGoogleAccount, setCustomGoogleAccount] = useState({ name: '', email: '' });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getUsers = (): UserData[] => {
    const data = localStorage.getItem('hiet_users');
    return data ? JSON.parse(data) : [];
  };

  const saveUser = (user: UserData) => {
    const users = getUsers();
    if (!users.find(u => u.email === user.email)) {
      users.push(user);
      localStorage.setItem('hiet_users', JSON.stringify(users));
    }
  };

  const handleGuestLogin = () => {
    setGuestLoading(true);
    setError(null);
    setTimeout(() => {
      const guestUser: UserData = {
        name: "Guest Operative",
        email: "guest@hiet.nexus",
        picture: "https://api.dicebear.com/7.x/bottts/svg?seed=guest",
        provider: 'guest'
      };
      setGuestLoading(false);
      onSuccess(guestUser);
    }, 1000);
  };

  const handleGoogleAccountSelect = (account: { name: string, email: string, pic: string }) => {
    setLoading(true);
    setShowGooglePortal(false);
    setTimeout(() => {
      const googleUser: UserData = {
        name: account.name,
        email: account.email,
        picture: account.pic,
        provider: 'google'
      };
      saveUser(googleUser);
      onSuccess(googleUser);
    }, 1200);
  };

  const handleAddCustomGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleAccount.name.trim() || !validateEmail(customGoogleAccount.email)) return;
    
    handleGoogleAccountSelect({
      name: customGoogleAccount.name,
      email: customGoogleAccount.email,
      pic: `https://api.dicebear.com/7.x/initials/svg?seed=${customGoogleAccount.name}`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid intelligence address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Access Key must be at least 6 characters.");
      return;
    }
    if (mode === 'signup' && formData.name.trim().length < 2) {
      setError("Designation is too short.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getUsers();
      if (mode === 'signup') {
        const exists = users.find(u => u.email === formData.email);
        if (exists) {
          setError("Account already initialized. Try syncing instead.");
          setLoading(false);
          return;
        }
        const newUser: UserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          provider: 'neural'
        };
        saveUser(newUser);
        setLoading(false);
        onSuccess(newUser);
      } else {
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        if (!user) {
          setError("Access denied. Credentials not recognized.");
          setLoading(false);
          return;
        }
        setLoading(false);
        onSuccess(user);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-4 sm:p-6 z-[80] overflow-hidden font-sans">
      {/* Background FX */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px]"
      >
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-3 text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Abort to Terminal
        </button>

        <div className="bg-slate-900/70 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] border border-white/10 relative flex flex-col max-h-[85vh] overflow-hidden">
          
          <div className="overflow-y-auto custom-auth-scrollbar p-10 sm:p-14 flex flex-col gap-12">
            
            <div className="absolute top-0 right-0 p-14 opacity-[0.03] pointer-events-none">
              <ShieldCheck className="w-28 h-28 text-white" />
            </div>

            <div className="text-center space-y-5">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 12 }}
                className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(37,99,235,0.5)]"
              >
                <Zap className="w-10 h-10 text-white fill-white" />
              </motion.div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-white tracking-tight leading-none">
                  {mode === 'login' ? 'Nexus Auth' : 'Initialize Node'}
                </h2>
                <p className="text-slate-400 text-sm font-semibold tracking-wide">Enter the HIET intelligence ecosystem</p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Login Providers */}
              <div className="space-y-4">
                <button 
                  onClick={() => { setShowGooglePortal(true); setGooglePortalView('select'); }}
                  disabled={loading || guestLoading}
                  className="w-full h-18 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 rounded-full font-bold text-base transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] border-b-4 border-slate-200"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <button 
                  onClick={handleGuestLogin}
                  disabled={loading || guestLoading}
                  className="w-full h-18 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold text-base transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                >
                  {guestLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : <UserPlus className="w-6 h-6 text-slate-400" />}
                  {guestLoading ? 'Provisioning...' : 'Enter as Guest'}
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-6 bg-[#0a142d] text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] rounded-full border border-white/5">Neural Sync</span>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-400 text-xs font-bold shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div 
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="relative flex items-center group">
                        <User className="absolute left-8 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                          required
                          type="text"
                          placeholder="Operative Designation"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-18 pr-8 py-7 bg-white/5 border border-white/10 rounded-[2.2rem] outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-base font-bold text-white placeholder:text-slate-600 shadow-inner"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative flex items-center group">
                  <Mail className="absolute left-8 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    required
                    type="email"
                    placeholder="Intelligence Address (Email)"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-18 pr-8 py-7 bg-white/5 border border-white/10 rounded-[2.2rem] outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-base font-bold text-white placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <div className="relative flex items-center group">
                  <Lock className="absolute left-8 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Access Key"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-18 pr-18 py-7 bg-white/5 border border-white/10 rounded-[2.2rem] outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-base font-bold text-white placeholder:text-slate-600 shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-8 p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={loading || guestLoading}
                  className="w-full mt-6 py-7 bg-white hover:bg-slate-100 text-slate-950 rounded-[2.2rem] font-black uppercase text-sm tracking-[0.5em] shadow-[0_30px_60px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                >
                  {loading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-blue-600 group-hover:scale-125 transition-transform" />
                  )}
                  {mode === 'login' ? 'Establish Link' : 'Deploy Node'}
                </button>
              </form>

              <div className="text-center pt-4 pb-4">
                <button 
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                  className="text-[11px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-[0.5em] transition-all relative group inline-block"
                >
                  {mode === 'login' ? "Initialize New Operative Node" : "Existing Node? Sync Here"}
                  <span className="absolute -bottom-2 left-0 w-0 h-px bg-blue-500 transition-all group-hover:w-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Simulated Google Portal - Bypasses Origin Auth Mismatch */}
      <AnimatePresence>
        {showGooglePortal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-[440px] shadow-2xl overflow-hidden text-slate-900"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <svg className="w-10 h-10" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <button onClick={() => setShowGooglePortal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><XIcon /></button>
                </div>
                
                <AnimatePresence mode="wait">
                  {googlePortalView === 'select' ? (
                    <motion.div 
                      key="select"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Choose an account</h3>
                        <p className="text-sm text-slate-500 font-medium">to continue to <span className="font-bold text-blue-600">HIET Studio</span></p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { name: "Beemnet Bee", email: "beemnet.bee@gmail.com", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" },
                          { name: "Nexus Operative", email: "operative.nexus@gmail.com", pic: "https://api.dicebear.com/7.x/bottts/svg?seed=nexus" }
                        ].map((acc) => (
                          <button 
                            key={acc.email}
                            onClick={() => handleGoogleAccountSelect(acc)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
                          >
                            <img src={acc.pic} className="w-10 h-10 rounded-full border border-slate-100" />
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-sm leading-none">{acc.name}</p>
                              <p className="text-xs text-slate-500 mt-1 truncate">{acc.email}</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => setGooglePortalView('add')}
                          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-sm"
                        >
                          <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          Use another account
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="add"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <button 
                        onClick={() => setGooglePortalView('select')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs transition-colors mb-2"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Account Choice
                      </button>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Sign in</h3>
                        <p className="text-sm text-slate-500 font-medium">Use your Google Account</p>
                      </div>

                      <form onSubmit={handleAddCustomGoogleAccount} className="space-y-4">
                        <div className="space-y-4">
                          <input 
                            required
                            type="text"
                            placeholder="Full name"
                            value={customGoogleAccount.name}
                            onChange={e => setCustomGoogleAccount({ ...customGoogleAccount, name: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-slate-900"
                          />
                          <input 
                            required
                            type="email"
                            placeholder="Email or phone"
                            value={customGoogleAccount.email}
                            onChange={e => setCustomGoogleAccount({ ...customGoogleAccount, email: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-slate-900"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button 
                            type="submit"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
                          >
                            Next
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  To continue, Google will share your name, email address, language preference and profile picture with HIET.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        input::placeholder { color: #94a3b8; font-weight: 500; opacity: 1; }
        .h-18 { height: 4.5rem; }
        .pl-18 { padding-left: 4.5rem; }
        .pr-18 { padding-right: 4.5rem; }
        .py-7 { padding-top: 1.75rem; padding-bottom: 1.75rem; }
        
        .custom-auth-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-auth-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-auth-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-auth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default AuthPage;
