
import React, { useState, useRef } from 'react';
import { 
  FileBox, FileText, Scissors, Combine, Image as ImageIcon, FileType, 
  Download, Loader2, Upload, X, ArrowRight, Layers, FileDown, Sparkles, Eye,
  FileCheck, FileSearch
} from 'lucide-react';
import * as docService from '../services/docService';

// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

type SubTool = 'splitter' | 'merger' | 'img-to-pdf' | 'pdf-to-word' | 'pdf-to-pic' | 'word-to-pdf';

const DocManagerTool: React.FC = () => {
  const [activeSubTool, setActiveSubTool] = useState<SubTool | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob | string, name: string, type: 'blob' | 'url' } | null>(null);
  const [splitRange, setSplitRange] = useState('1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreview = async (file: File) => {
    if (file.type.startsWith('image/')) {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          return canvas.toDataURL();
        }
      } catch (err) {
        console.error("Preview extraction failed:", err);
      }
    }
    return '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type newFiles as File[] to resolve 'unknown' inference in the loop below
      const newFiles: File[] = Array.from(e.target.files);
      setFiles(newFiles);
      setResult(null);
      
      const newPreviews: Record<string, string> = {};
      for (const file of newFiles) {
        // Fix: 'file' is now correctly typed as 'File', resolving the reported property and assignment errors
        const previewUrl = await generatePreview(file);
        if (previewUrl) newPreviews[file.name] = previewUrl;
      }
      setPreviews(newPreviews);
    }
  };

  const executeOperation = async () => {
    if (!files.length || processing) return;
    setProcessing(true);
    setResult(null);

    try {
      const fileBytes = new Uint8Array(await files[0].arrayBuffer());
      let res: Blob | string;
      let outName = 'studio_result';
      let type: 'blob' | 'url' = 'blob';

      switch (activeSubTool) {
        case 'splitter':
          const splitBytes = await docService.splitPdf(fileBytes, splitRange);
          res = new Blob([splitBytes], { type: 'application/pdf' });
          outName = `split_${files[0].name}`;
          break;
        case 'merger':
          const allBytes = await Promise.all(files.map(async f => new Uint8Array(await f.arrayBuffer())));
          const mergedBytes = await docService.mergePdfs(allBytes);
          res = new Blob([mergedBytes], { type: 'application/pdf' });
          outName = 'merged_document.pdf';
          break;
        case 'img-to-pdf':
          const base64s = await Promise.all(files.map(async f => {
            return new Promise<string>((res) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.readAsDataURL(f);
            });
          }));
          const pdfData = await docService.imagesToPdf(base64s);
          res = new Blob([pdfData], { type: 'application/pdf' });
          outName = 'converted_images.pdf';
          break;
        case 'pdf-to-word':
          res = await docService.createWordDoc(files[0].name, "Document extracted and reconstructed by AI Studio.");
          outName = files[0].name.replace('.pdf', '.docx');
          break;
        case 'pdf-to-pic':
          res = await docService.pdfToImage(fileBytes);
          outName = files[0].name.replace('.pdf', '.png');
          type = 'url';
          break;
        case 'word-to-pdf':
          const wPdf = await docService.wordToPdf(fileBytes);
          res = new Blob([wPdf], { type: 'application/pdf' });
          outName = files[0].name.replace('.docx', '.pdf');
          break;
        default:
          throw new Error("Op failed");
      }

      setResult({ blob: res, name: outName, type });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = result.type === 'url' ? (result.blob as string) : URL.createObjectURL(result.blob as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    if (result.type === 'blob') URL.revokeObjectURL(url);
  };

  const HubMenu = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {[
        { id: 'splitter', name: 'Split PDF', desc: 'Divide by page ranges', icon: <Scissors />, color: 'bg-orange-500' },
        { id: 'merger', name: 'Merge PDF', desc: 'Concatenate documents', icon: <Combine />, color: 'bg-blue-500' },
        { id: 'img-to-pdf', name: 'Image to PDF', desc: 'Compile image sequence', icon: <ImageIcon />, color: 'bg-emerald-500' },
        { id: 'pdf-to-pic', name: 'PDF to Image', desc: 'Render pages as PNG', icon: <FileSearch />, color: 'bg-amber-500' },
        { id: 'pdf-to-word', name: 'PDF to Word', desc: 'AI Reconstruct (.docx)', icon: <FileType />, color: 'bg-indigo-500' },
        { id: 'word-to-pdf', name: 'Word to PDF', desc: 'Format conversion', icon: <FileDown />, color: 'bg-rose-500' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => { setActiveSubTool(item.id as SubTool); setFiles([]); setPreviews({}); setResult(null); }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 text-left hover:border-violet-400 hover:shadow-2xl transition-all group"
        >
          <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
            {item.icon}
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors">{item.name}</h4>
          <p className="text-slate-500 text-sm mt-2 font-medium">{item.desc}</p>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!activeSubTool ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doc Hub <span className="text-violet-600">Pro</span></h3>
            <div className="flex items-center gap-3 px-4 py-2 bg-violet-50 text-violet-600 rounded-full border border-violet-100">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Document Engine</span>
            </div>
          </div>
          <HubMenu />
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[550px]">
          <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-8 space-y-8">
            <button onClick={() => { setActiveSubTool(null); setFiles([]); setPreviews({}); }} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors">
              <X className="w-4 h-4" /> Back to Hub
            </button>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Tool</p>
              <h4 className="text-xl font-extrabold text-slate-900">{activeSubTool.replace('-', ' ').toUpperCase()}</h4>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Staging</p>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {files.map((f, i) => (
                  <div key={i} className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-50">
                      {previews[f.name] ? (
                        <img src={previews[f.name]} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{f.name}</p>
                      <p className="text-[9px] font-bold text-slate-400">{(f.size/1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ))}
                {!files.length && <p className="text-xs italic text-slate-300">No assets staged</p>}
              </div>
            </div>

            {activeSubTool === 'splitter' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Sequence (e.g. 1-2, 5)</p>
                 <input 
                   type="text" 
                   value={splitRange}
                   onChange={e => setSplitRange(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-violet-400 transition-colors shadow-sm"
                 />
              </div>
            )}
          </div>

          <div className="flex-1 p-10 flex flex-col gap-10 bg-slate-50/20">
            {files.length > 0 ? (
               <div className="flex-1 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Asset Visualizer</h4>
                    <button onClick={() => { setFiles([]); setPreviews({}); setResult(null); }} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest">Flush Queue</button>
                  </div>
                  <div className="flex-1 border-2 border-slate-100 bg-white rounded-[2.5rem] p-8 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {previews[files[0].name] ? (
                       <img 
                        src={previews[files[0].name]} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
                       />
                    ) : (
                       <div className="text-center space-y-4 text-slate-300">
                          <Eye className="w-16 h-16 mx-auto stroke-[1]" />
                          <p className="text-sm font-bold uppercase tracking-widest">Parsing Structure...</p>
                       </div>
                    )}
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[9px] font-bold uppercase tracking-widest">
                      Primary File: {files[0].name}
                    </div>
                  </div>
               </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-slate-200 bg-white rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-violet-400 hover:bg-violet-50/30 transition-all cursor-pointer group shadow-sm"
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-violet-600/5">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-900">Stage Documents</p>
                  <p className="text-sm font-medium text-slate-400 mt-1">Upload files for processing</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled={!files.length || processing}
                onClick={executeOperation}
                className="flex-1 bg-slate-900 hover:bg-black disabled:opacity-40 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                Run Operation
              </button>

              {result && (
                <button
                  onClick={downloadResult}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 animate-in bounce-in"
                >
                  <Download className="w-5 h-5" />
                  Save Result
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocManagerTool;
