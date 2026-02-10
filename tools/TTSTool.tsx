
import React, { useState, useRef } from 'react';
import { Volume2, Loader2, Play, Square, Settings2, Sparkles, Mic2 } from 'lucide-react';
import { textToSpeech, decodeBase64, decodeAudioData } from '../services/geminiService';

const TTSTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voice, setVoice] = useState('Kore');
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleSynthesize = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const base64Audio = await textToSpeech(text);
      const audioBytes = decodeBase64(base64Audio);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch (e) {}
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/10 dark:shadow-black/50 text-center space-y-10 transition-colors duration-300">
        <div className="space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-cyan-600/5">
             <Volume2 className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Voice Synthesis</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Hyper-realistic speech generation using Gemini Studio TTS.</p>
        </div>

        <div className="space-y-6 text-left">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your script for the AI to narrate..."
              className="w-full h-48 md:h-64 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 outline-none focus:border-cyan-300 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-base md:text-xl font-medium leading-relaxed resize-none custom-scrollbar shadow-inner"
            />
            <div className="absolute bottom-4 right-8 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              Gemini TTS Engine v2.5
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <div className="w-full sm:w-auto flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm focus-within:border-cyan-400 transition-colors">
                <Settings2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white cursor-pointer w-full sm:w-44"
                >
                  <option className="bg-white dark:bg-slate-800" value="Kore">Kore (Neutral)</option>
                  <option className="bg-white dark:bg-slate-800" value="Puck">Puck (Cheerful)</option>
                  <option className="bg-white dark:bg-slate-800" value="Charon">Charon (Deep)</option>
                  <option className="bg-white dark:bg-slate-800" value="Fenrir">Fenrir (Professional)</option>
                  <option className="bg-white dark:bg-slate-800" value="Zephyr">Zephyr (Light)</option>
                </select>
             </div>

             {isPlaying ? (
               <button 
                 onClick={stopAudio}
                 className="w-full sm:w-auto px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl shadow-red-600/20"
               >
                 <Square className="w-5 h-5 fill-current" /> Stop Broadcast
               </button>
             ) : (
               <button 
                 onClick={handleSynthesize}
                 disabled={isLoading || !text.trim()}
                 className="w-full sm:w-auto px-12 py-5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-2xl shadow-cyan-600/30"
               >
                 {isLoading ? (
                   <Loader2 className="w-6 h-6 animate-spin" />
                 ) : (
                   <Play className="w-5 h-5 fill-current" />
                 )}
                 Generate Audio
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         {[
           { label: 'Latency', value: '45ms', icon: <Sparkles className="w-4 h-4" /> },
           { label: 'Quality', value: '24kHz', icon: <Volume2 className="w-4 h-4" /> },
           { label: 'Engine', value: 'Studio', icon: <Mic2 className="w-4 h-4" /> }
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm hover:border-cyan-200 dark:hover:border-cyan-900 transition-colors duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:text-cyan-600">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default TTSTool;
