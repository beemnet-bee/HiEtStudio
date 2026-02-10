
import React, { useState } from 'react';
import { FileText, Loader2, Copy, Check, Sparkles, BrainCircuit, ListChecks, Type } from 'lucide-react';
import { summarizeText } from '../services/geminiService';

type SummaryStyle = 'bullets' | 'narrative' | 'abstract';

const SummarizerTool: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<SummaryStyle>('bullets');

  const handleSummarize = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    
    const prompts = {
      bullets: "Provide key bullet points and high-level insights from this text:",
      narrative: "Summarize this text in a professional, narrative-style paragraph:",
      abstract: "Provide a very short, academic-style abstract for this text:"
    };

    try {
      const fullPrompt = `${prompts[style]} \n\n${text}`;
      const result = await summarizeText(fullPrompt);
      setSummary(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Source Material</h3>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Input Stream</p>
          </div>
        </div>

        <div className="flex gap-1.5">
          {(['bullets', 'narrative', 'abstract'] as SummaryStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`flex-1 py-2 px-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                style === s 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/5 hover:border-indigo-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste high-volume data, research, or articles..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-indigo-300 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-xs md:text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-100 resize-none custom-scrollbar shadow-inner"
        />
        
        <button
          onClick={handleSummarize}
          disabled={isLoading || !text.trim()}
          className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <BrainCircuit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Generate Intelligence</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-6 shadow-sm transition-colors duration-300 overflow-hidden">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">AI Insights</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Refined Output</p>
            </div>
          </div>
          {summary && (
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 rounded-lg text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Stored' : 'Copy'}
            </button>
          )}
        </div>
        
        <div className="flex-1 bg-blue-50/20 dark:bg-white/5 rounded-[1.5rem] p-6 md:p-8 border border-blue-50 dark:border-white/5 overflow-y-auto custom-scrollbar whitespace-pre-wrap ai-output-text text-xs md:text-sm text-slate-800 dark:text-slate-200">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-500 gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full scale-[3] animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin relative z-10" />
              </div>
              <p className="text-indigo-600 font-black animate-pulse text-sm uppercase tracking-[0.2em]">Distilling Content...</p>
            </div>
          ) : summary ? (
            <div className="animate-in fade-in duration-1000">
              {summary}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 italic gap-4 opacity-40">
              <FileText className="w-16 h-16 stroke-[1]" />
              <p className="font-bold uppercase tracking-widest text-[9px]">Awaiting Analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarizerTool;
