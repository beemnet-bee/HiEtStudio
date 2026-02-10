
import React, { useState, useRef } from 'react';
import { Mic2, Loader2, Upload, Check, Clipboard, Sparkles, MicOff, FileAudio } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const STTTool: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const file = new File([new Blob(chunksRef.current, { type: 'audio/webm' })], "recording.webm", { type: 'audio/webm' });
        setAudioFile(file);
        processAudio(file);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTranscription('');
    } catch (err) { alert("Mic access denied."); }
  };

  const processAudio = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          contents: { parts: [{ inlineData: { data: base64, mimeType: file.type } }, { text: "Transcribe high-precision." }] }
        });
        setTranscription(result.text || "Null stream.");
      };
      reader.readAsDataURL(file);
    } catch (err) { setTranscription("Process failure."); } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 sm:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm text-center space-y-8 sm:space-y-12 transition-colors duration-300">
        <div className="space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-[2rem] flex items-center justify-center mx-auto"><Mic2 className="w-8 h-8 sm:w-10 sm:h-10" /></div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Audio Pulse</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-sm sm:text-base">Neural STT with hyper-precision decoding.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
           <button onClick={() => isRecording ? mediaRecorderRef.current?.stop() : startRecording()} className={`px-8 sm:px-12 py-5 rounded-3xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl ${isRecording ? 'bg-slate-900 dark:bg-white dark:text-slate-950 text-white animate-pulse' : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'}`}>
             {isRecording ? <MicOff className="w-5 h-5" /> : <Mic2 className="w-5 h-5" />}
             {isRecording ? 'Stop Capture' : 'Start Capture'}
           </button>
           <div className="relative">
             <input type="file" accept="audio/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { setAudioFile(f); setTranscription(''); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
             <button className="w-full px-8 sm:px-12 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-3xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4">
               <Upload className="w-5 h-5 text-slate-400 dark:text-slate-500" /> Upload
             </button>
           </div>
        </div>
        {audioFile && !isLoading && !isRecording && <button onClick={() => processAudio(audioFile)} className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-2 mx-auto"><Sparkles className="w-4 h-4" /> Ready: {audioFile.name} (Transcribe)</button>}
      </div>

      <div className="bg-white dark:bg-black rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden flex flex-col min-h-[400px] transition-colors duration-300">
        <div className="px-6 sm:px-10 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 shrink-0">
           <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transcription Log</span>
           </div>
           {transcription && <button onClick={() => { navigator.clipboard.writeText(transcription); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />} {copied ? 'Saved' : 'Copy'}</button>}
        </div>
        <div className="flex-1 p-8 sm:p-12 overflow-y-auto custom-scrollbar">
           {isLoading ? <div className="h-full flex flex-col items-center justify-center gap-8 text-rose-500 dark:text-rose-400 animate-pulse"><Loader2 className="w-16 h-16 animate-spin" /><p className="font-black text-xl uppercase tracking-[0.4em]">Decoding Pulse...</p></div> : transcription ? <div className="animate-in fade-in duration-700"><p className="text-base sm:text-xl leading-relaxed font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{transcription}</p></div> : <div className="h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 gap-4"><FileAudio className="w-20 h-20 stroke-[0.5]" /><p className="font-black text-[10px] uppercase tracking-[0.3em]">Buffer Empty</p></div>}
        </div>
      </div>
    </div>
  );
};

export default STTTool;
