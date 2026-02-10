
import React, { useState, useRef, useEffect } from 'react';
// Added missing X icon to lucide-react imports
import { Code2, Loader2, Copy, Check, Terminal, Brackets, Info, MessageSquare, ChevronDown, Zap, Search, X } from 'lucide-react';
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
  const [language, setLanguage] = useState('typescript');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const filteredLanguages = LANGUAGES.filter(l => l.includes(langSearch.toLowerCase()));

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');
    setExplanation('');
    setShowExplanation(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as an expert software architect. 
        Language/Framework: ${language}. 
        Task: ${prompt}. 
        
        Provide the output in JSON format with exactly two fields:
        1. 'code': The primary functional code snippet only.
        2. 'explanation': A detailed explanation of the architecture, including best practices and comments on complex parts.
        
        Do not wrap the code in additional text. Just return the valid JSON object.`,
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full min-h-0 animate-in fade-in slide-in-from-bottom-8 duration-700 relative w-full overflow-hidden">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col gap-6 shadow-sm min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Logic Input</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Specifications</p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLanguageList(!showLanguageList)}
              className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none min-w-[140px] hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2">
                 <Brackets className="w-3.5 h-3.5 text-blue-500" />
                 {language}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLanguageList ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLanguageList && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                >
                  <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <Search className="w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filter..." 
                      className="bg-transparent border-none outline-none text-[10px] w-full dark:text-white" 
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto language-select">
                    {filteredLanguages.map(lang => (
                      <button 
                        key={lang} 
                        onClick={() => { setLanguage(lang); setShowLanguageList(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${language === lang ? 'text-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'text-slate-500'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Architect your logic... (e.g. 'Build a secure JWT middleware for Express')" 
          className="flex-1 min-h-[250px] bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-800 transition-all text-[11px] font-mono resize-none custom-scrollbar shadow-inner dark:text-slate-200" 
        />

        <button 
          onClick={handleGenerate} 
          disabled={isLoading || !prompt.trim()} 
          className="py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brackets className="w-5 h-5" />}
          <span>Forge Module</span>
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl overflow-hidden relative min-h-0 border border-white/5">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center backdrop-blur-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight uppercase">Snippet Output</h3>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Isolated Context</p>
            </div>
          </div>
          <div className="flex gap-2">
            {response && (
              <>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`p-2 rounded-lg transition-all border ${showExplanation ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                  title="Explain Code"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={copyToClipboard} 
                  className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Acquired' : 'Capture'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 bg-black/40 rounded-[1.25rem] border border-white/5 overflow-y-auto custom-scrollbar p-6 font-mono text-[10px] sm:text-[11px] leading-relaxed text-white/90 whitespace-pre scroll-smooth min-h-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-white/60 animate-pulse gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <Loader2 className="w-10 h-10 animate-spin relative z-10" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing Logic...</span>
            </div>
          ) : response ? (
            <code className="block select-text">{response}</code>
          ) : (
            <div className="h-full flex items-center justify-center text-white/10 uppercase tracking-[0.2em] font-black text-center text-[10px]">
              Buffer Empty - Awaiting Specs
            </div>
          )}
        </div>

        {/* Side Floating Explanation Panel */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-y-0 right-0 w-full sm:w-2/3 bg-slate-900 border-l border-white/10 z-[110] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">Architectural Note</h4>
                </div>
                <button onClick={() => setShowExplanation(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar ai-output-text text-[11px] leading-relaxed text-slate-300">
                 {explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background decoration to fill full height if content is short */}
      <div className="absolute -z-10 bottom-0 right-0 p-20 opacity-[0.02] pointer-events-none">
         <Zap className="w-64 h-64 text-white" />
      </div>
    </div>
  );
};

export default CodeTool;
