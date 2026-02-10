
import React, { useState } from 'react';
import { BrainCircuit, Loader2, Sparkles, Binary, Check, Copy, ArrowRight, Activity } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const LogicSolverTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSolve = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Solve the following complex logic problem step-by-step. Use first-principles reasoning and provide a final verified conclusion: \n\n${input}`,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });
      setResponse(result.text || '');
    } catch (err) {
      console.error(err);
      setResponse('Neural reasoning failure. Problem too complex for current cycle.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col gap-6 shadow-sm transition-colors duration-300 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">The Oracle</h3>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Deep Reasoning Input</p>
          </div>
        </div>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Present a complex paradox, mathematical proof, or architectural dilemma..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100 resize-none shadow-inner custom-scrollbar"
        />
        
        <button
          onClick={handleSolve}
          disabled={isLoading || !input.trim()}
          className="py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 group shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Binary className="w-5 h-5 group-hover:rotate-45 transition-transform" />}
          <span>Initiate Reasoning</span>
        </button>
      </div>

      <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity className="w-24 h-24 text-white" />
        </div>
        <div className="flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">Conclusion</h3>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">Verified Logic Path</p>
            </div>
          </div>
          {response && (
            <button 
              onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Acquired' : 'Export'}
            </button>
          )}
        </div>
        
        <div className="flex-1 bg-white/5 rounded-[1.5rem] p-6 border border-white/5 overflow-y-auto custom-scrollbar ai-output-text text-white/90 text-xs leading-relaxed whitespace-pre-wrap font-mono relative z-10">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-8">
              <div className="relative">
                 <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-[3] animate-pulse"></div>
                 <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
              </div>
              <p className="text-purple-400 font-black animate-pulse text-base uppercase tracking-[0.3em]">Casting Neural Nets...</p>
            </div>
          ) : response ? (
            <div className="animate-in fade-in duration-700">
               {response}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/5 uppercase tracking-[0.4em] font-black text-center gap-4">
               <Binary className="w-12 h-12" />
               <p className="text-[9px]">Logic Buffer Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogicSolverTool;
