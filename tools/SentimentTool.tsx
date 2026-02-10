
import React, { useState } from 'react';
import { Thermometer, Loader2, Sparkles, BarChart2, Check, Copy, Activity } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SentimentTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following text for psychological sentiment and tone. Provide a detailed report including: 
        1. Primary Emotion 
        2. Tone Intensity (0-100)
        3. Underlying Intent
        4. Psychological Profile summary. \n\n${input}`,
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Sentiment Analyst</h3>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Tone Analysis Link</p>
          </div>
        </div>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste emails, social posts, or logs for emotional profiling..."
          className="flex-1 bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 outline-none focus:border-rose-400 focus:bg-white transition-all text-xs font-semibold text-slate-800 resize-none shadow-inner"
        />
        
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !input.trim()}
          className="py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 group"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5 group-hover:scale-125 transition-transform" />}
          <span>Profile Sentiment</span>
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">Psych Profiler</h3>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">Tone Breakdown</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-4 relative z-10">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-rose-400 animate-pulse">
               <Loader2 className="w-10 h-10 animate-spin mb-3" />
               <p className="font-black text-[10px] uppercase tracking-[0.4em]">Analyzing Psyche...</p>
            </div>
          ) : result ? (
            <div className="space-y-4 animate-in fade-in duration-700">
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Primary Emotion</p>
                  <p className="text-xl font-black text-rose-400">{result["Primary Emotion"] || result["primary_emotion"] || "Neutral"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                     <span>Tone Intensity</span>
                     <span>{result["Tone Intensity"] || result["tone_intensity"] || "50"}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${result["Tone Intensity"] || 50}%` }}></div>
                  </div>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Inferred Intent</p>
                  <p className="text-xs font-bold text-white/80">{result["Underlying Intent"] || result["intent"] || "Undetermined"}</p>
               </div>
               <div className="p-4 bg-rose-600/10 rounded-xl border border-rose-500/20 space-y-1">
                  <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Executive Summary</p>
                  <p className="text-[10px] font-medium text-white/60 leading-relaxed italic">
                    {result["Psychological Profile summary"] || result["summary"] || "Analysis complete."}
                  </p>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/5 gap-3 opacity-40">
               <Activity className="w-16 h-16 stroke-[1]" />
               <p className="font-black text-[9px] uppercase tracking-[0.4em]">Awaiting Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentTool;
