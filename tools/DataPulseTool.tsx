
import React, { useState } from 'react';
import { Binary, Loader2, Sparkles, Database, FileCode, Check, Copy, Table } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const DataPulseTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setReport('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a senior data analyst. Analyze the following raw data (JSON, CSV, or LOGS). Provide a clear, professional report with sections for:
        1. Structural Overview
        2. Identified Patterns/Anomalies
        3. Key Statistical Insights
        4. Suggested Transformations. 
        Format clearly using markdown principles: \n\n${input}`
      });
      setReport(result.text || '');
    } catch (err) {
      console.error(err);
      setReport('Data Pulse link failure. Input unreadable.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Data Pulse</h3>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Raw Stream Input</p>
          </div>
        </div>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON objects, CSV rows, or server logs..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-5 border border-slate-100 dark:border-white/5 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-[10px] font-mono text-slate-800 dark:text-slate-200 resize-none shadow-inner custom-scrollbar"
        />
        
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !input.trim()}
          className="py-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Table className="w-5 h-5" />}
          <span>Run Pulse Check</span>
        </button>
      </div>

      <div className="lg:col-span-2 bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">Insight Report</h3>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">Structural Discovery</p>
            </div>
          </div>
          {report && (
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Captured' : 'Export'}
            </button>
          )}
        </div>
        
        <div className="flex-1 bg-white/5 rounded-[1.5rem] p-6 md:p-8 border border-white/5 overflow-y-auto custom-scrollbar ai-output-text text-white/90 text-xs leading-relaxed whitespace-pre-wrap font-medium relative z-10">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
              <p className="text-cyan-400 font-black animate-pulse text-sm uppercase tracking-[0.3em]">Mapping Structure...</p>
            </div>
          ) : report ? (
            <div className="animate-in fade-in duration-700">
               {report}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/5 uppercase tracking-[0.4em] font-black text-center gap-4">
               <Database className="w-12 h-12" />
               <p className="text-[9px]">Structural Buffer Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPulseTool;
