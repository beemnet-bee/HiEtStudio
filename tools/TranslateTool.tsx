
import React, { useState } from 'react';
import { Languages, Loader2, Sparkles, ArrowRightLeft, Copy, Check, Globe } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const TranslateTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [targetLang, setTargetLang] = useState('French');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text into ${targetLang}. Maintain tone and cultural nuance. Return only the translated text: \n\n${input}`
      });
      setOutput(result.text || '');
    } catch (err) {
      console.error(err);
      setOutput('Translation link failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Translate Matrix</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Multi-lingual Link</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
             <Globe className="w-3.5 h-3.5 text-slate-400" />
             <select 
               value={targetLang}
               onChange={(e) => setTargetLang(e.target.value)}
               className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500"
             >
                {['French', 'Spanish', 'German', 'Japanese', 'Chinese', 'Russian', 'Arabic', 'Hindi', 'Portuguese'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
           <textarea
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Source text in any language..."
             className="h-56 bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 outline-none focus:border-emerald-400 focus:bg-white transition-all text-xs md:text-sm font-semibold text-slate-800 resize-none shadow-inner"
           />
           <div className="h-56 bg-emerald-50/20 rounded-[1.5rem] p-6 border border-emerald-50 overflow-y-auto custom-scrollbar relative">
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : output ? (
                <div className="animate-in fade-in duration-500 text-xs md:text-sm font-semibold text-slate-800 leading-relaxed">
                   {output}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-40">
                   <ArrowRightLeft className="w-10 h-10" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Target Buffer</p>
                </div>
              )}
              {output && (
                <button 
                  onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="absolute top-3 right-3 p-2 bg-white text-emerald-600 rounded-lg shadow-lg hover:scale-110 transition-transform"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
           </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span>Synthesize Translation</span>
        </button>
      </div>
    </div>
  );
};

export default TranslateTool;
