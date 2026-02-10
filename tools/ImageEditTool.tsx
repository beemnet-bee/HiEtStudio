
import React, { useState } from 'react';
import { ImageIcon, Loader2, Wand2, Upload, X, ShieldCheck } from 'lucide-react';
import { editImage } from '../services/geminiService';

const ImageEditTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const editedUrl = await editImage(image, prompt);
      setResult(editedUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 flex-1 flex flex-col items-center justify-center relative overflow-hidden border-2 border-dashed hover:border-amber-400 transition-all group shadow-sm">
          {image ? (
            <div className="w-full h-full relative group">
              <img src={image} className="w-full h-full object-contain rounded-3xl" alt="Original" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-6 right-6 p-4 bg-white/90 text-red-600 rounded-full shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-xl shadow-amber-600/10">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">Source Asset</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Select photo to modify</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          )}
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] space-y-6 border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5 text-amber-600" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Modification Logic</p>
           </div>
           <div className="flex gap-4">
             <input
               type="text"
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="e.g. 'Add a neon sign that says AI'"
               className="flex-1 bg-slate-50 rounded-2xl px-6 py-5 border border-slate-100 focus:border-amber-300 focus:bg-white outline-none transition-all text-base font-semibold text-slate-900 shadow-inner"
             />
             <button
               onClick={handleEdit}
               disabled={isLoading || !image || !prompt.trim()}
               className="bg-slate-900 hover:bg-black disabled:opacity-50 px-6 rounded-2xl text-white transition-all shadow-xl active:scale-95"
             >
               {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] flex flex-col relative min-h-[400px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Studio Output</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Rendered Result</p>
          </div>
        </div>
        <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden border border-slate-100">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
               <Loader2 className="w-16 h-16 animate-spin text-amber-600" />
               <p className="mt-8 text-amber-600 font-black animate-pulse text-xl uppercase tracking-[0.2em]">Applying Logic...</p>
            </div>
          )}
          {result ? (
            <div className="p-8 h-full w-full flex items-center justify-center animate-in zoom-in duration-700">
              <img src={result} className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl shadow-slate-900/10" alt="Edited Result" />
            </div>
          ) : (
            <div className="text-slate-300 flex flex-col items-center gap-6 opacity-40">
              <ShieldCheck className="w-20 h-20 stroke-[1]" />
              <p className="font-black text-xs uppercase tracking-widest">Awaiting Command</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditTool;
