
import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Search, Upload, X, FileSearch, Sparkles, Copy, Check } from 'lucide-react';
import { extractTextFromImage } from '../services/geminiService';

const OCRTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult('');
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!image || isLoading) return;
    setIsLoading(true);
    try {
      const text = await extractTextFromImage(image);
      setResult(text || 'System reported null data extraction.');
    } catch (error) {
      console.error(error);
      setResult('Error: Character recognition failure.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-dashed transition-all group cursor-pointer relative overflow-hidden shadow-sm flex flex-col items-center justify-center ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]' : 'border-slate-200 dark:border-white/10 hover:border-emerald-400'}`}
        >
          {image ? (
            <div className="w-full h-full relative group">
              <img src={image} className="w-full h-full object-contain rounded-2xl" alt="Preview" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                 <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="p-3 bg-white/90 dark:bg-slate-800/90 text-red-600 rounded-full shadow-2xl backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-emerald-600/10">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Drop Source</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">or click to browse local storage</p>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-6 shadow-sm transition-colors duration-300 overflow-hidden">
          <div className="flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Decoded Data</h3>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Output Buffer</p>
              </div>
            </div>
            {result && (
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 rounded-lg text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Saved' : 'Copy'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-50/50 dark:bg-white/5 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar ai-output-text text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-emerald-500 gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-600/10 blur-3xl rounded-full scale-[3] animate-pulse"></div>
                  <Loader2 className="w-12 h-12 animate-spin relative z-10" />
                </div>
                <p className="text-emerald-600 font-black animate-pulse text-sm uppercase tracking-[0.2em]">Extracting Characters...</p>
              </div>
            ) : result ? (
              <div className="animate-in fade-in duration-1000">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 italic gap-4 opacity-40">
                <Search className="w-16 h-16 stroke-[1]" />
                <p className="font-bold uppercase tracking-widest text-[9px]">Ready for Analysis</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleExtract}
            disabled={isLoading || !image}
            className="py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3 group shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Begin Vision Parse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OCRTool;
