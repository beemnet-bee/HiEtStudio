
import React, { useState, useEffect } from 'react';
import { Video, Loader2, Download, Sparkles, Play, Monitor, Square, Smartphone, AlertCircle, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const VideoGenTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const messages = [
    "Initializing cinematic engine...",
    "Synthesizing neural keyframes...",
    "Rendering visual complexity...",
    "Finalizing temporal consistency...",
    "Injecting atmospheric details...",
    "Exporting high-fidelity motion data..."
  ];

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let i = 0;
      setLoadingMessage(messages[0]);
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const generateVideo = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution,
          aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      const isKeyError = error.message?.includes("403") || 
                        error.message?.includes("PERMISSION_DENIED") || 
                        error.message?.includes("Requested entity was not found");
      
      if (isKeyError) {
        setHasKey(false);
      } else {
        alert(`Video synthesis failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
        <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 shadow-inner">
          <Key className="w-12 h-12" />
        </div>
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Veo Studio requires a **paid API key** from a Google Cloud Project with active billing to generate video content.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Requirements:</h4>
             <ul className="text-xs font-bold text-slate-600 space-y-2">
                <li className="flex items-start gap-2">• Google Cloud Project with Billing</li>
                <li className="flex items-start gap-2">• Vertex AI / Gemini API enabled</li>
                <li className="flex items-start gap-2">• Paid tier (Free of charge keys are blocked for Video)</li>
             </ul>
          </div>
          <button 
            onClick={handleOpenKey}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95"
          >
            Authenticate with Paid Key
          </button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-blue-600">View Billing Documentation</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Veo Studio</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Next-Gen Video Synthesis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`p-2 rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-white shadow-sm text-zinc-900' : 'text-slate-400'}`}
                title="Landscape"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`p-2 rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-white shadow-sm text-zinc-900' : 'text-slate-400'}`}
                title="Portrait"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <select 
              value={resolution}
              onChange={(e: any) => setResolution(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-zinc-500"
            >
              <option value="720p">720P</option>
              <option value="1080p">1080P</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a futuristic metropolis emerging from the clouds, cyberpunk aesthetic, neon accents, golden hour lighting, hyper-realistic 8k..."
            className="w-full bg-slate-50 rounded-[2rem] px-8 py-8 border border-slate-100 focus:border-zinc-300 focus:bg-white outline-none transition-all text-lg font-semibold text-slate-900 resize-none min-h-[160px]"
          />
          <button
            onClick={generateVideo}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-6 bg-zinc-900 hover:bg-black disabled:opacity-50 text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 group"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
            {isLoading ? "Synthesizing Motion..." : "Generate Cinematic Sequence"}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900 rounded-[3.5rem] overflow-hidden relative min-h-[500px] shadow-2xl flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-[3] animate-pulse"></div>
              <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-4">
               <p className="text-white font-black text-xl uppercase tracking-[0.4em] animate-pulse">{loadingMessage}</p>
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Temporal engine processing (~1-2 mins)</p>
            </div>
          </div>
        ) : videoUrl ? (
          <div className="w-full h-full relative group">
            <video 
              src={videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay 
              loop
            />
            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all">
              <a 
                href={videoUrl} 
                download="studio_export.mp4"
                className="flex items-center gap-3 bg-white text-zinc-900 px-6 py-4 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all"
              >
                <Download className="w-5 h-5" /> Export MP4
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 opacity-20">
             <Video className="w-32 h-32 text-white stroke-[0.5]" />
             <div className="text-center">
                <p className="text-white font-black text-xs uppercase tracking-[0.3em]">No Buffer Active</p>
                <p className="text-white/60 text-sm mt-2">Neural engine awaiting temporal prompt</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenTool;
