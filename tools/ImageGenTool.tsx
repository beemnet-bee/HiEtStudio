
import React, { useState } from 'react';
import { Sparkles, Loader2, Download, RefreshCw, Layers, Monitor, Square, Smartphone } from 'lucide-react';
import { generateImage } from '../services/geminiService';

type AspectRatio = '1:1' | '16:9' | '9:16';

const ImageGenTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ratio, setRatio] = useState<AspectRatio>('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const url = await generateImage(`${prompt} --ar ${ratio}`);
      setResult(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `studio-art-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-10 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Studio Art Engine</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Prompt Synthesis</p>
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 relative group">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic architectural blueprint in soft morning light, hyper-realistic, 8k..."
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] px-8 py-6 border border-slate-100 dark:border-white/5 focus:border-rose-300 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-base font-semibold text-slate-900 dark:text-slate-100 resize-none shadow-inner"
            />
          </div>
          
          <div className="flex flex-row xl:flex-col gap-3">
             <div className="flex gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setRatio('1:1')}
                  className={`p-3 rounded-xl transition-all ${ratio === '1:1' ? 'bg-white dark:bg-white/10 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}`}
                  title="Square"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setRatio('16:9')}
                  className={`p-3 rounded-xl transition-all ${ratio === '16:9' ? 'bg-white dark:bg-white/10 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}`}
                  title="Landscape"
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setRatio('9:16')}
                  className={`p-3 rounded-xl transition-all ${ratio === '9:16' ? 'bg-white dark:bg-white/10 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}`}
                  title="Portrait"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
             </div>
             <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 disabled:opacity-50 px-10 py-4 xl:py-2 rounded-2xl font-black text-white dark:text-slate-900 text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                Render
              </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-black border border-slate-200 dark:border-white/5 rounded-[3.5rem] overflow-hidden relative min-h-[500px] shadow-sm transition-colors duration-300">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-xl z-10 animate-in fade-in duration-500">
            <div className="w-24 h-24 relative">
               <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full scale-125 animate-pulse"></div>
               <Loader2 className="w-16 h-16 animate-spin text-rose-600 dark:text-rose-400 absolute inset-4" />
            </div>
            <p className="mt-12 text-rose-600 dark:text-rose-400 font-black animate-pulse text-xl uppercase tracking-[0.2em]">Synthesizing Pixels...</p>
          </div>
        ) : result ? (
          <div className="w-full h-full group relative flex items-center justify-center p-10 bg-slate-50 dark:bg-black transition-colors duration-300">
            <img 
              src={result} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
              alt="Generated Intelligence" 
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
              <button 
                onClick={handleGenerate}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 px-6 py-4 rounded-2xl border border-white dark:border-white/10 shadow-2xl transition-all font-bold text-slate-900 dark:text-white flex items-center gap-3"
              >
                <RefreshCw className="w-5 h-5 text-rose-600" />
                Iterate
              </button>
              <button 
                onClick={downloadImage}
                className="bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 px-6 py-4 rounded-2xl text-white dark:text-slate-900 shadow-2xl transition-all font-bold flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                Capture
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 space-y-8 bg-slate-50/50 dark:bg-black">
             <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center rotate-6 shadow-xl opacity-40">
                <Sparkles className="w-16 h-16" />
             </div>
             <div className="text-center">
                <p className="font-black text-xs uppercase tracking-[0.3em]">No Visual Generated</p>
                <p className="text-sm font-medium mt-2 text-slate-400 dark:text-slate-600">Initialize the engine to start synthesis</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenTool;
