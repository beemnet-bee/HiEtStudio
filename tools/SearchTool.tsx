
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, Loader2, ExternalLink, ArrowRight, MessageSquare, Sparkles, Database, TrendingUp, Info, Key, Filter } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

type SearchCategory = 'All' | 'Tech' | 'News' | 'Academic' | 'Financial' | 'Science';

const SearchTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setNeedsKey(false);
  };

  const categories: { id: SearchCategory, label: string }[] = [
    { id: 'All', label: 'All Intel' },
    { id: 'Tech', label: 'Tech & AI' },
    { id: 'News', label: 'Global Events' },
    { id: 'Academic', label: 'Research' },
    { id: 'Financial', label: 'Markets' },
    { id: 'Science', label: 'Scientific' },
  ];

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    
    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const currentQuery = query;
    const currentCategory = activeCategory;
    setQuery('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextPrefix = currentCategory !== 'All' 
        ? `Focusing on ${currentCategory} sources: ` 
        : '';
        
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contextPrefix + currentQuery,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: response.text || "Neural search complete. Referencing real-time data.",
        groundingChunks
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const isPermissionError = err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED");
      if (isPermissionError) {
        setNeedsKey(true);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Neural bridge interrupted. Failed to retrieve real-time intelligence." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Latest AI breakthroughs 2024",
    "Current space mission status",
    "Real-time market trends",
    "Global weather anomalies"
  ];

  if (needsKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem]">
        <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/30 rounded-3xl flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Key className="w-10 h-10" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Grounding Permission Required</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Google Search Grounding requires a paid API key from a Google Cloud Project with active billing.
          </p>
          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-xl"
          >
            Select Paid API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-0">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center gap-6 shrink-0">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-600/5">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Global Search Grounding</h3>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">Live Web Intelligence Link</p>
          </div>
        </div>
        
        <div className="w-full max-w-3xl overflow-x-auto custom-scrollbar pb-2">
           <div className="flex items-center gap-1.5">
             <div className="flex items-center gap-2 mr-2 shrink-0">
               <Filter className="w-3.5 h-3.5 text-slate-400" />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
             </div>
             {categories.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 hover:text-sky-600 dark:hover:text-sky-400'}`}
               >
                 {cat.label}
               </button>
             ))}
           </div>
        </div>

        <div className="w-full max-w-3xl flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[1.75rem] p-1.5 shadow-inner focus-within:border-sky-400 dark:focus-within:border-sky-500 transition-all duration-300">
          <Search className="w-4 h-4 text-slate-400 ml-4" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${activeCategory !== 'All' ? activeCategory.toLowerCase() : 'real-time'} data...`}
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="p-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-colors duration-300 min-w-0">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar" ref={scrollRef}>
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 gap-4">
                 <Database className="w-16 h-16 stroke-[1]" />
                 <p className="font-bold text-[9px] uppercase tracking-[0.3em]">Query buffer initialized</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {msg.role === 'assistant' ? <Globe className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                  <div className={`p-5 rounded-[1.5rem] shadow-sm ${msg.role === 'assistant' ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-tr-none'}`}>
                    <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-medium tracking-tight ai-output-text break-words">
                      {msg.content}
                    </p>
                  </div>

                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 w-full">
                      {msg.groundingChunks.map((chunk, ci) => (
                        chunk.web && (
                          <a 
                            key={ci}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all shadow-sm group truncate max-w-full"
                          >
                            <ExternalLink className="w-2.5 h-2.5 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="truncate">{chunk.web.title || "Reference Source"}</span>
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                 <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shrink-0 shadow-lg">
                   <Globe className="w-4 h-4 text-white" />
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Grounding Real-time data...</span>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden xl:flex w-72 bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 flex-col gap-6 shadow-2xl transition-colors duration-300 shrink-0">
           <div className="space-y-1">
             <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <h4 className="text-base font-extrabold text-white">Discovery</h4>
             </div>
             <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Suggested Probes</p>
           </div>
           
           <div className="space-y-2 overflow-y-auto custom-scrollbar">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => { setQuery(s); handleSearch(); }}
                  className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-sky-500/50 transition-all group"
                >
                  <p className="text-[10px] font-bold text-white/80 group-hover:text-sky-400 transition-colors leading-relaxed line-clamp-2">{s}</p>
                </button>
              ))}
           </div>

           <div className="mt-auto bg-white/5 p-4 rounded-2xl border border-white/5 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                 <Info className="w-3 h-3 text-sky-400" />
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Grounding Note</span>
              </div>
              <p className="text-[9px] leading-relaxed text-white/60 font-medium">
                Information is dynamically synthesized from live web layers and cross-verified with official sources.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTool;
