
import React, { useState } from 'react';
import { Code2, Loader2, Copy, Check, Terminal, Brackets } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const CodeTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('typescript');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as an expert software architect. Technical stack: ${language}. Task: ${prompt}. Provide clean code with technical documentation.`,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });
      setResponse(result.text || '');
    } catch (err) {
      console.error(err);
      setResponse('Neural architecture failure.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Logic Input</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Config</p>
            </div>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none">
            {['typescript', 'python', 'rust', 'go', 'cpp', 'react'].map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your logic..." className="flex-1 min-h-[200px] xl:min-h-0 bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 outline-none focus:border-slate-900 focus:bg-white transition-all text-xs font-mono resize-none custom-scrollbar" />
        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="py-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brackets className="w-5 h-5" />}
          <span>Forge Logic</span>
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center backdrop-blur-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">Output</h3>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Refined</p>
            </div>
          </div>
          {response && <button onClick={copyToClipboard} className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-2">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Saved' : 'Copy'}</button>}
        </div>
        <div className="flex-1 bg-white/5 rounded-[1.25rem] border border-white/5 overflow-y-auto custom-scrollbar p-6 font-mono text-[10px] sm:text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-white/60 animate-pulse"><Loader2 className="w-8 h-8 animate-spin mb-3" /><span>Synthesize...</span></div> : response || <div className="h-full flex items-center justify-center text-white/10 uppercase tracking-[0.2em] font-black text-center">Buffer Empty</div>}
        </div>
      </div>
    </div>
  );
};

export default CodeTool;
