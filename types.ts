
import React from 'react';

export type ToolType = 
  | 'chat' 
  | 'summarizer' 
  | 'ocr' 
  | 'image-gen' 
  | 'image-edit' 
  | 'tts' 
  | 'stt' 
  | 'qr-scanner'
  | 'doc-hub'
  | 'video-gen'
  | 'live-companion'
  | 'global-search'
  | 'code-architect'
  | 'navigator'
  | 'audio-pulse'
  | 'text-forge'
  | 'logic-solver'
  | 'translate-matrix'
  | 'sentiment-analyst'
  | 'data-pulse'
  | 'math-solver';

export type ToolCategory = 'Text' | 'Vision' | 'Audio' | 'Utility' | 'Document' | 'Creative' | 'Engineering' | 'Analysis';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  groundingChunks?: any[];
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: ToolCategory;
}
