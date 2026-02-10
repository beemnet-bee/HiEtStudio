
import React, { useState } from 'react';
import { Hammer, Sparkles, Loader2, Copy, Check, Wand2, Type, PenTool, Zap, History, LayoutPanelLeft, ArrowRight } from 'lucide-react';
import { generateTextForge, humanizeText } from '../services/geminiService';

type ForgeMode = 'generate' | 'humanize';
type ForgeTone = 'professional' | 'creative' | 'academic' | 'cyberpunk' | 'conversational';

const TONES: { id: ForgeTone; label: string; icon: React.ReactNode }[] = [
  { id: 'professional', label: 'Pro', icon: <LayoutPanelLeft className="w-3.5 h-3.5" /> },
  { id: 'creative', label: 'Story', icon: <PenTool className="w-3.5 h-3.5" /> },
  { id: 'academic', label: 'Theory', icon: <Type className="w-3.5 h-3.5" /> },
  { id: 'cyberpunk', label: 'Neo', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'conversational', label: 'Human', icon: <History className="w-3.5 h-3.5" /> },
];

const TextForgeTool: React.FC = () => {
  const [mode, setMode] = useState<ForgeMode>('generate');
  const [tone, setTone] = useState<ForgeTone>('professional');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleForge = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      let result = '';
      if (mode === 'generate') {
        result = await generateTextForge(input, tone);
      } else {
        result = await humanizeText(input);
      }
      setOutput(result || '');
    } catch (err) {
      console.error(err);
      setOutput('Forge failure. Matrix alignment error.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">HI<sub>ET</sub> Text Forge</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Neural Semantic Synthesis</p>
            </div>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => { setMode('generate'); setOutput(''); }}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-white dark:bg-white/10 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Generate
            </button>
            <button 
              onClick={() => { setMode('humanize'); setOutput(''); }}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'humanize' ? 'bg-white dark:bg-white/10 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Humanize
            </button>
          </div>
        </div>

        {mode === 'generate' && (
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${tone === t.id ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-amber-200'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'generate' ? "Enter a detailed prompt or topic for generation..." : "Paste AI-generated text to humanize..."}
            className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-xs md:text-sm leading-relaxed font-medium resize-none custom-scrollbar shadow-inner"
          />
        </div>

        <button
          onClick={handleForge}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Forge {mode === 'generate' ? 'Narrative' : 'Essence'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-5 shadow-sm min-h-[350px] overflow-hidden">
          <div className="flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Forged Output</h3>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Refined Result</p>
              </div>
            </div>
            {output && (
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 rounded-lg text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Stored' : 'Capture'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] p-6 md:p-8 border border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar ai-output-text whitespace-pre-wrap font-medium text-xs md:text-sm text-slate-800 dark:text-slate-200 relative">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-500 gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-600/10 blur-3xl rounded-full scale-[3] animate-pulse"></div>
                  <Loader2 className="w-12 h-12 animate-spin relative z-10" />
                </div>
                <p className="text-amber-600 font-black animate-pulse text-sm uppercase tracking-[0.2em]">Casting Semantic Layers...</p>
              </div>
            ) : output ? (
              <div className="animate-in fade-in duration-1000">
                {output}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-700 italic gap-4 opacity-30">
                <Wand2 className="w-12 h-12 stroke-[1]" />
                <p className="font-bold uppercase tracking-widest text-[9px]">Waiting for Forge ignition</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-6 overflow-hidden">
           <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl overflow-hidden relative shrink-0">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Hammer className="w-32 h-32 -rotate-12" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-extrabold uppercase tracking-tight">Forge Metrics</h4>
                </div>
                <div className="space-y-3">
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                         <span>Burstiness</span>
                         <span>88%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                         <div className="bg-amber-500 h-full w-[88%] transition-all duration-1000"></div>
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                         <span>Perplexity</span>
                         <span>94%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                         <div className="bg-indigo-500 h-full w-[94%] transition-all duration-1000"></div>
                      </div>
                   </div>
                </div>
              </div>
           </div>
           
           <div className="flex-1 bg-amber-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-amber-600/20 group hover:scale-[1.01] transition-all overflow-hidden">
              <div className="space-y-3">
                 <Sparkles className="w-10 h-10 text-white/40 group-hover:rotate-12 transition-transform duration-500" />
                 <h4 className="text-2xl font-black tracking-tighter leading-none">Craft Without Limits.</h4>
                 <p className="text-amber-100 font-medium leading-relaxed text-xs">
                   Adapting neural weight to your objective, from cyberpunk narratives to academic rigor.
                 </p>
              </div>
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest border-t border-white/20 pt-6 mt-4 shrink-0">
                 <span>Optimized for HIET 3.0</span>
                 <ArrowRight className="w-3.5 h-3.5" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TextForgeTool;
