
import React, { useState, useMemo } from 'react';
import { Code2, Loader2, Copy, Check, Terminal, Brackets, Info, MessageSquare, ChevronDown, Zap, Search, X, Eye } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  'typescript', 'javascript', 'python', 'rust', 'go', 'cpp', 'csharp', 'java', 'ruby', 'php', 'swift', 'kotlin', 'react', 'vue', 'svelte', 'sql', 'html', 'css', 'yaml', 'bash'
];

const CodeTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('react');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [langSearch, setLangSearch] = useState('');

  const filteredLanguages = LANGUAGES.filter(l => l.includes(langSearch.toLowerCase()));

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');
    setExplanation('');
    setShowExplanation(false);
    setViewMode('code');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as a senior software architect. 
        Language/Framework: ${language}. 
        Task: ${prompt}. 
        
        Important: 
        1. Write production-ready, clean, well-commented code.
        2. If the request is for a web UI (react, html, css, js), make sure the code is self-contained for a single-file preview. Use CDN links for any dependencies like Tailwind CSS if appropriate.
        
        Provide the output in JSON format with exactly two fields:
        1. 'code': The primary functional code snippet only.
        2. 'explanation': A detailed architectural breakdown.`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['code', 'explanation']
          },
          thinkingConfig: { thinkingBudget: 32768 } 
        }
      });

      const data = JSON.parse(result.text);
      setResponse(data.code || '');
      setExplanation(data.explanation || '');
    } catch (err) {
      console.error(err);
      setResponse('// Neural architecture failure.\n// Unable to forge logic at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple token-based highlighter for UI presentation
  const highlightedCode = useMemo(() => {
    if (!response) return null;
    const tokens = response.split(/(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\b(?:class|const|let|var|function|return|import|export|if|else|for|while|await|async|try|catch|new|this|extends|from|true|false|null|undefined)\b|\b\d+\b|[{}[\]().,;=+\-*/!&|<>?:])/g);
    
    return tokens.map((token, i) => {
      if (!token) return null;
      if (token.startsWith('//') || token.startsWith('/*')) return <span key={i} className="text-slate-500 italic">{token}</span>;
      if (token.startsWith('"') || token.startsWith("'")) return <span key={i} className="text-emerald-400">{token}</span>;
      if (/^(class|const|let|var|function|return|import|export|if|else|for|while|await|async|try|catch|new|this|extends|from|true|false|null|undefined)$/.test(token)) return <span key={i} className="text-purple-400 font-bold">{token}</span>;
      if (/^\d+$/.test(token)) return <span key={i} className="text-orange-400">{token}</span>;
      if (/^[{}[\]().,;=+\-*/!&|<>?:]+$/.test(token)) return <span key={i} className="text-blue-400 opacity-80">{token}</span>;
      return <span key={i} className="text-slate-200">{token}</span>;
    });
  }, [response]);

  const previewContent = useMemo(() => {
    if (viewMode !== 'preview' || !response) return null;
    let html = '';
    const isWeb = ['html', 'javascript', 'react', 'typescript', 'css'].includes(language);
    
    if (!isWeb) {
      return `<!DOCTYPE html><html><body style="background:#0f172a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><p style="opacity:0.5;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Synthesis Error</p><h3 style="margin:0;">Preview Not Supported</h3><p style="color:#94a3b8;font-size:14px;">The language [${language}] cannot be executed in this sandbox.</p></div></body></html>`;
    }

    if (language === 'html') {
      html = response.includes('<html>') ? response : `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${response}</body></html>`;
    } else {
      // Very basic "runnable" wrapper for JS/React snippets
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { margin: 0; background: #0f172a; color: #fff; font-family: sans-serif; }</style>
        </head>
        <body>
          <div id="preview-root"></div>
          <script>
            try {
              const root = document.getElementById('preview-root');
              ${response.includes('console.log') ? '' : 'console.log = (m) => root.innerHTML += "<div>> " + m + "</div>";'}
              ${response}
              if (root.innerHTML === '') root.innerHTML = '<div style="padding:20px;color:#64748b;font-family:monospace;font-size:12px;">Logic executed successfully.<br/>(No DOM changes detected)</div>';
            } catch(e) {
              document.getElementById('preview-root').innerHTML = '<div style="padding:20px;color:#f43f5e;font-family:monospace;">Runtime Error: ' + e.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
    }
    return html;
  }, [viewMode, response, language]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0 relative w-full overflow-hidden pb-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col gap-5 shadow-sm min-h-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><Terminal className="w-5 h-5" /></div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Specification</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Architecture Core</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowLanguageList(!showLanguageList)} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none min-w-[140px] hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2"><Brackets className="w-3.5 h-3.5 text-indigo-500" />{language}</div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLanguageList ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLanguageList && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50 dark:bg-slate-900"><Search className="w-3 h-3 text-slate-400" /><input type="text" placeholder="Filter..." className="bg-transparent border-none outline-none text-[10px] w-full dark:text-white font-bold" value={langSearch} onChange={(e) => setLangSearch(e.target.value)} /></div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredLanguages.map(lang => (
                      <button key={lang} onClick={() => { setLanguage(lang); setShowLanguageList(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${language === lang ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400 dark:text-slate-600'}`}>{lang}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Architect your logic... (e.g. 'Build a glassy React card with hover animations')" className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-indigo-500 transition-all text-xs font-mono resize-none custom-scrollbar shadow-inner dark:text-slate-200" />
        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 shrink-0">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brackets className="w-4 h-4" />} Forge Logic
        </button>
      </div>

      <div className="bg-slate-950 p-6 rounded-[2.5rem] flex flex-col gap-5 shadow-2xl overflow-hidden relative min-h-0 border border-white/5">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'code' ? 'bg-white text-slate-900' : 'text-white/40 hover:text-white'}`}><Terminal className="w-3 h-3" /> Code</button>
             <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-white text-slate-900' : 'text-white/40 hover:text-white'}`}><Eye className="w-3 h-3" /> Preview</button>
          </div>
          <div className="flex gap-2">
            {response && (
              <>
                <button onClick={() => setShowExplanation(!showExplanation)} className={`p-2 rounded-xl transition-all border ${showExplanation ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}><MessageSquare className="w-4 h-4" /></button>
                <button onClick={copyToClipboard} className="px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 active:scale-95">{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Saved' : 'Copy'}</button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 bg-black/40 rounded-[1.5rem] border border-white/5 overflow-hidden relative min-h-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-white/60 animate-pulse gap-5">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Casting Neural Geometry...</span>
            </div>
          ) : (
            <div className="w-full h-full">
              {viewMode === 'code' ? (
                <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words scroll-smooth">
                  {response ? <code className="block select-text">{highlightedCode}</code> : <div className="h-full flex flex-col items-center justify-center text-white/10 uppercase tracking-[0.3em] font-black text-[10px] gap-4"><Zap className="w-12 h-12 stroke-[0.5]" />Buffer Offline</div>}
                </div>
              ) : (
                <div className="w-full h-full bg-slate-900"><iframe srcDoc={previewContent || ''} title="Logic Preview" className="w-full h-full border-none" sandbox="allow-scripts" /></div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-y-0 right-0 w-full sm:w-2/3 bg-slate-900 border-l border-white/10 z-[110] shadow-[-20px_0_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
                <div className="flex items-center gap-3"><Info className="w-4 h-4 text-indigo-400" /><h4 className="text-[10px] font-black uppercase tracking-widest text-white">Architectural Link</h4></div>
                <button onClick={() => setShowExplanation(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar ai-output-text text-[11px] leading-relaxed text-slate-300">{explanation || "Neural analysis data pending..."}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodeTool;
