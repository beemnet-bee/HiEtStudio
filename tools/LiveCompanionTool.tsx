
import React, { useState, useRef, useEffect } from 'react';
import { Radio, Mic, MicOff, Video, VideoOff, Loader2, Volume2, Sparkles, X, Power, Waves } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

const LiveCompanionTool: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const frameIntervalRef = useRef<number | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: hasVideo 
      });
      
      if (videoRef.current && hasVideo) {
        videoRef.current.srcObject = stream;
      }

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Enhanced Visualization Level calculation
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              const level = Math.sqrt(sum / inputData.length) * 100;
              // Smooth transition for audioLevel
              setAudioLevel(prev => (level * 0.7 + prev * 0.3));

              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            if (hasVideo && canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              frameIntervalRef.current = window.setInterval(() => {
                if (!canvasRef.current || !videoRef.current || !ctx) return;
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                canvasRef.current.toBlob(async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = (reader.result as string).split(',')[1];
                      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.6);
              }, 1000);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64 && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-3), `Bot: ${text}`]);
            }
          },
          onclose: () => stopSession(),
          onerror: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          systemInstruction: 'You are a friendly and high-intelligent companion in the OmniTool Studio. Keep responses brief, witty, and engaging.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    setIsActive(false);
    setAudioLevel(0);
    nextStartTimeRef.current = 0;
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full min-h-[600px]">
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
          <div className="p-10 flex flex-col items-center justify-center flex-1 gap-10 text-center">
            <div className="relative">
              {/* Reactive Neural Rings */}
              <AnimatePresence>
                {isActive && (
                  <>
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1 + (audioLevel / 40), 
                        opacity: 0.15 + (audioLevel / 200),
                        borderColor: audioLevel > 15 ? 'rgba(192, 38, 211, 0.5)' : 'rgba(192, 38, 211, 0.2)'
                      }}
                      className="absolute inset-0 border-2 rounded-full -m-4 transition-colors duration-100"
                    />
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1.2 + (audioLevel / 25), 
                        opacity: 0.05 + (audioLevel / 400),
                        borderColor: audioLevel > 30 ? 'rgba(192, 38, 211, 0.3)' : 'rgba(192, 38, 211, 0.1)'
                      }}
                      className="absolute inset-0 border-2 rounded-full -m-8 transition-colors duration-200"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <div className={`absolute inset-0 bg-fuchsia-600/10 blur-3xl rounded-full transition-all duration-300 ${isActive ? 'opacity-100' : 'scale-0 opacity-0'}`}
                style={{ transform: isActive ? `scale(${3 + (audioLevel / 20)})` : 'scale(0)' }}
              ></div>
              
              <div 
                className={`w-28 h-28 rounded-full border-4 flex items-center justify-center relative z-10 transition-all duration-200 ${isActive ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_50px_rgba(192,38,211,0.4)]' : 'bg-white border-slate-100'}`}
                style={{ 
                  transform: isActive ? `scale(${1.1 + (audioLevel / 60)})` : 'scale(1)',
                  boxShadow: isActive ? `0 0 ${40 + audioLevel}px rgba(192,38,211,${0.3 + audioLevel/100})` : 'none'
                }}
              >
                {isActive ? (
                  <Waves className="w-12 h-12 text-white" />
                ) : (
                  <Power className="w-12 h-12 text-slate-200" />
                )}
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Companion Live</h3>
              <p className="text-slate-500 font-medium max-w-sm">Establish a zero-latency neural link for voice and vision interaction.</p>
            </div>

            <div className="flex gap-3 w-full max-w-xs relative z-10">
               <button 
                onClick={() => setHasVideo(!hasVideo)}
                disabled={isActive}
                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${hasVideo ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600' : 'bg-white border-slate-200 text-slate-400 hover:border-fuchsia-200'}`}
               >
                 {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{hasVideo ? 'Vision On' : 'Audio Only'}</span>
               </button>
            </div>

            <button 
              onClick={isActive ? stopSession : startSession}
              className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 relative z-10 ${isActive ? 'bg-slate-900 text-white' : 'bg-fuchsia-600 text-white shadow-fuchsia-600/20 hover:bg-fuchsia-700'}`}
            >
              {isActive ? (
                <>
                  <MicOff className="w-5 h-5" /> Terminate Link
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5" /> establish link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl flex items-center justify-center border border-slate-800">
             {isActive && hasVideo ? (
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50 grayscale contrast-125" />
             ) : (
               <div className="flex flex-col items-center gap-4 text-white/5">
                 <Radio className="w-24 h-24 stroke-[1]" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Atmosphere silent</p>
               </div>
             )}
             
             <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-10">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] text-white font-black uppercase tracking-widest">{isActive ? 'Session established' : 'Offline'}</span>
                   </div>
                   {isActive && (
                     <div className="flex flex-col items-end gap-3">
                        <div className="h-4 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm relative">
                           <div 
                            className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-75" 
                            style={{ 
                              width: `${Math.min(100, audioLevel * 2)}%`,
                              boxShadow: `0 0 ${10 + (audioLevel / 2)}px rgba(192,38,211,0.8)`
                            }}
                           ></div>
                        </div>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Input amplitude</p>
                     </div>
                   )}
                </div>

                <div className="space-y-3">
                   {transcription.map((t, i) => (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="animate-in slide-in-from-left-4 duration-500"
                      >
                        <p className="text-white/90 font-bold text-sm bg-black/40 backdrop-blur-md inline-block px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
                           {t}
                        </p>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCompanionTool;
