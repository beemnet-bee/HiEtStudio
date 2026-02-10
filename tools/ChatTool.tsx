
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Mic, RefreshCcw, X, MicOff, Key, FileText, ImageIcon } from 'lucide-react';
import { GoogleGenAI, ChatSession } from "@google/genai";
import { Message } from '../types';

const ChatTool: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Neural link established. I'm connected to the Gemini 3.0 core. What objective shall we tackle today?" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<ChatSession | null>(null);
  const recognitionRef = useRef<any>(null);

  const getChatSession = useCallback(() => {
    if (!chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { 
          systemInstruction: 'You are a professional AI assistant in OmniTool Studio. You are helpful, precise, and creative. You can analyze images if provided. For other files, refer to the user input.' 
        }
      });
    }
    return chatRef.current;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setNeedsKey(false);
    chatRef.current = null; // Force recreation with new key
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment(event.target?.result as string);
        setAttachmentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isStreaming) return;
    const currentInput = input;
    const currentAttachment = attachment;
    const userMsg: Message = { role: 'user', content: currentInput || `Analyzed file: ${attachmentName}`, image: currentAttachment || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setAttachmentName(null);
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const chat = getChatSession();
      let messagePayload: any;
      if (currentAttachment) {
        const parts = currentAttachment.split(',');
        const base64Data = parts[1];
        const mimeType = currentAttachment.split(';')[0].split(':')[1];
        messagePayload = { 
          parts: [
            { text: currentInput || `Please analyze this file: ${attachmentName}` }, 
            { inlineData: { data: base64Data, mimeType } }
          ] 
        };
      } else {
        messagePayload = currentInput;
      }

      const responseStream = await chat.sendMessageStream({ message: messagePayload });
      let fullContent = '';
      for await (const chunk of responseStream) {
        fullContent += chunk.text || '';
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg) lastMsg.content = fullContent;
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error(error);
      const isKeyError = error.message?.includes("403") || error.message?.includes("PERMISSION_DENIED");
      if (isKeyError) {
        setNeedsKey(true);
      }
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg) lastMsg.content = isKeyError ? 'Neural link permission denied. A paid API key may be required for Gemini 3 Pro.' : 'Neural link failure. Please check connectivity.';
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  if (needsKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem]">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Key className="w-10 h-10" />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Neural Permissions Required</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
            Gemini 3 Pro access may be restricted. Please select a paid API key to continue using this module.
          </p>
          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl text-sm"
          >
            Authenticate with Paid Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Gemini Active</span>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: "Buffer cleared." }])} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><RefreshCcw className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 md:space-y-8 custom-scrollbar scroll-smooth bg-white dark:bg-slate-900 transition-colors duration-300" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.image && (
                 msg.image.startsWith('data:image') ? 
                 <img src={msg.image} alt="User upload" className="rounded-xl border border-slate-200 dark:border-white/10 shadow-sm max-w-full sm:max-w-xs h-auto" /> :
                 <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold truncate max-w-[150px]">Embedded File</span>
                 </div>
              )}
              {msg.content && (
                <div className={`p-3.5 sm:p-4.5 rounded-[1.25rem] md:rounded-[1.5rem] ${msg.role === 'assistant' ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl rounded-tr-none'}`}>
                  <p className={`whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-medium ${isStreaming && i === messages.length - 1 ? 'typing-cursor' : ''}`}>{msg.content}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 shrink-0 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-4">
          {attachment && (
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="relative">
                {attachment.startsWith('data:image') ? 
                  <img src={attachment} className="w-10 h-10 object-cover rounded-lg border border-blue-200 dark:border-blue-900/50" alt="Attachment" /> :
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800"><FileText className="w-5 h-5 text-blue-600" /></div>
                }
                <button onClick={() => {setAttachment(null); setAttachmentName(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"><X className="w-2.5 h-2.5" /></button>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest truncate max-w-[200px]">{attachmentName || 'Asset ready'}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[1.75rem] p-1.5 pr-1.5 sm:pr-2 shadow-xl focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-all duration-300">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-all"><Paperclip className="w-4.5 h-4.5" /></button>
            <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Send a command or upload a file..." className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none max-h-32 custom-scrollbar" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button onClick={toggleListening} className={`p-2.5 rounded-full transition-all hidden sm:flex ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600'}`}>{isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}</button>
              <button onClick={handleSend} disabled={isStreaming || (!input.trim() && !attachment)} className="p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition-all shadow-lg active:scale-95 flex items-center justify-center">{isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTool;
