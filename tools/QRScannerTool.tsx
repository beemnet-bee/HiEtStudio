
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, Camera, Copy, ExternalLink, Check, Upload, ClipboardPaste, ArrowRight, Scan, Shield } from 'lucide-react';

declare var jsQR: any;

const QRScannerTool: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number>();

  const processImageFromSource = useCallback((source: HTMLImageElement | HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    canvas.width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    canvas.height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
  }, []);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const code = processImageFromSource(img);
        if (code) {
          setResult(code.data);
          setError(null);
        } else {
          setError("Detection failed: Matrix patterns not found in image.");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleImageFile(blob);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const startScanner = async () => {
    try {
      setResult(null);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setScanning(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Security error: Camera initialization blocked.");
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const scanFrame = () => {
    if (!scanning) return;
    
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const code = processImageFromSource(video);
      if (code) {
        setResult(code.data);
        setError(null);
        stopScanner();
        return;
      }
    }
    requestRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (scanning) {
      requestRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [scanning]);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = (str: string) => {
    try { return new URL(str); } catch { return false; }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">QR Matrix Intel</h2>
        <p className="text-slate-500 font-medium">Ultra-fast detection across multiple input streams.</p>
      </div>

      <div className="bg-white p-4 rounded-[3.5rem] relative overflow-hidden w-full max-w-md aspect-square flex items-center justify-center border-4 border-slate-100 shadow-2xl shadow-slate-200/50 group">
        {scanning ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover rounded-[2.5rem]" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-3/4 h-3/4 border-2 border-emerald-500 rounded-[3rem] opacity-40 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scan_2.5s_infinite] shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
              </div>
            </div>
          </>
        ) : result ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 rounded-[2.5rem] p-10 text-center space-y-6">
             <div className="w-24 h-24 bg-white text-emerald-600 rounded-3xl flex items-center justify-center shadow-md">
                <Check className="w-12 h-12" />
             </div>
             <div>
               <p className="text-2xl font-black text-slate-900">Intelligence Acquired</p>
               <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Status: Decrypted</p>
             </div>
             <div className="w-full p-6 bg-white rounded-2xl border border-emerald-100 break-all text-sm font-bold text-slate-700 shadow-sm leading-relaxed">
                {result}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-6 transition-transform group-hover:scale-110 duration-500">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center">
              <Scan className="w-16 h-16" />
            </div>
            <p className="font-bold text-slate-400 tracking-tight">Awaiting Signal</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {!scanning ? (
          <>
            <button 
              onClick={startScanner}
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20"
            >
              <Camera className="w-6 h-6" />
              Start Live Feed
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-10 py-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-sm"
            >
              <Upload className="w-6 h-6 text-slate-400" />
              Upload Module
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </>
        ) : (
          <button 
            onClick={stopScanner}
            className="px-12 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/20"
          >
            Deactivate Camera
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
          <Shield className="w-5 h-5 text-blue-500" />
          <p className="text-xs font-bold text-slate-500">Secure Environment</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
          <ClipboardPaste className="w-5 h-5 text-indigo-500" />
          <p className="text-xs font-bold text-slate-500">Supports Paste (Ctrl+V)</p>
        </div>
      </div>

      {result && (
        <div className="bg-white w-full max-w-3xl p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-6">
           <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2">Decrypted Intel</p>
              <p className="text-lg font-bold truncate text-slate-900 leading-tight">{result}</p>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={copyToClipboard}
                className="px-6 py-4 bg-slate-900 hover:bg-black rounded-2xl text-white font-bold transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied' : 'Copy Result'}
              </button>
              {isUrl(result) && (
                <a 
                  href={result} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl font-bold transition-all flex items-center gap-2 border border-emerald-100"
                >
                  Visit Portal <ExternalLink className="w-5 h-5" />
                </a>
              )}
           </div>
        </div>
      )}

      {error && (
        <div className="px-6 py-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in shake">
          <Shield className="w-5 h-5" />
          {error}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(350px); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-in.shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default QRScannerTool;
