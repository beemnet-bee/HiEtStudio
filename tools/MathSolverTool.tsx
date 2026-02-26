
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calculator, Loader2, Sparkles, Sigma, Copy, Check, TrendingUp, Grid, RefreshCw, Zap, Maximize, MousePointer2, Move, ZoomIn } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MathSolverTool: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [plotData, setPlotData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [view, setView] = useState<ViewState>({ scale: 40, offsetX: 0, offsetY: 0 });
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSolve = async () => {
    if (!problem.trim() || isLoading) return;
    setIsLoading(true);
    setSolution('');
    setPlotData(null);
    setView({ scale: 40, offsetX: 0, offsetY: 0 });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Solve this math problem step-by-step: ${problem}. 
        If the problem involves a function of x, provide a Javascript expression for plotting y = f(x). 
        The expression should be compatible with 'Math' object functions (e.g., 'Math.sin(x)', 'Math.pow(x, 2)').
        Format the response in JSON with 'steps' (string) and 'plot_expression' (string or null).`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.STRING },
              plot_expression: { type: Type.STRING, nullable: true }
            },
            required: ['steps']
          },
          thinkingConfig: { thinkingBudget: 8000 }
        }
      });

      const data = JSON.parse(response.text);
      setSolution(data.steps);
      setPlotData(data.plot_expression);
    } catch (err) {
      console.error(err);
      setSolution('Neural computation failure. Please verify the mathematical expression.');
    } finally {
      setIsLoading(false);
    }
  };

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { scale, offsetX, offsetY } = view;
    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    ctx.clearRect(0, 0, width, height);

    const step = scale > 150 ? 0.5 : scale < 20 ? 5 : 1;
    
    ctx.lineWidth = 1;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = Math.floor((-width / 2 - offsetX) / scale / step) * step; x <= (width / 2 - offsetX) / scale; x += step) {
      const px = centerX + x * scale;
      ctx.strokeStyle = x === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      if (x !== 0 && Math.abs(x % (step * 2)) < 0.01) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(x.toString(), px, centerY + 5);
      }
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.floor((-height / 2 + offsetY) / scale / step) * step; y <= (height / 2 + offsetY) / scale; y += step) {
      const py = centerY - y * scale;
      ctx.strokeStyle = y === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      if (y !== 0 && Math.abs(y % (step * 2)) < 0.01) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(y.toString(), centerX - 5, py);
      }
    }

    ctx.fillText('0', centerX - 5, centerY + 10);

    if (plotData) {
      try {
        const func = new Function('x', `try { return ${plotData}; } catch(e) { return NaN; }`);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(234, 179, 8, 0.4)';
        ctx.beginPath();

        let started = false;
        for (let px = 0; px <= width; px += 1) {
          const x = (px - centerX) / scale;
          const y = func(x);
          const py = centerY - y * scale;

          if (isNaN(y) || !isFinite(y) || py < -1000 || py > height + 1000) {
            started = false;
            continue;
          }

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (hoverPos) {
          const hX = (hoverPos.x - centerX) / scale;
          const hY = func(hX);
          const phY = centerY - hY * scale;

          if (!isNaN(hY) && isFinite(hY)) {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(hoverPos.x, phY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            const label = `(${hX.toFixed(2)}, ${hY.toFixed(2)})`;
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(hoverPos.x + 10, phY - 20, textWidth + 8, 16);
            ctx.fillStyle = '#fff';
            ctx.fillText(label, hoverPos.x + 14, phY - 12);
          }
        }
      } catch (e) {
        console.error("Plotting evaluation error:", e);
      }
    }
  }, [view, plotData, hoverPos]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const factor = Math.exp(-e.deltaY * zoomSpeed);
    const newScale = Math.max(5, Math.min(2000, view.scale * factor));
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const dx = (mouseX - (rect.width / 2 + view.offsetX)) / view.scale;
      const dy = (mouseY - (rect.height / 2 + view.offsetY)) / view.scale;
      
      setView(prev => ({
        scale: newScale,
        offsetX: mouseX - rect.width / 2 - dx * newScale,
        offsetY: mouseY - rect.height / 2 - dy * newScale,
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (isPanning && lastMousePos.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setView(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    lastMousePos.current = null;
  };

  const resetView = () => {
    setView({ scale: 40, offsetX: 0, offsetY: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-300 min-h-0 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col gap-6 shadow-sm transition-colors duration-300 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Math Studio</h3>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Grounded Symbolic Engine</p>
            </div>
          </div>
        </div>
        
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Solve x^2 - 4 = 0, Find derivative of sin(x)..."
          className="flex-1 min-h-[150px] bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100 resize-none shadow-inner custom-scrollbar"
        />
        
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button onClick={() => setProblem(prev => prev + " ∫ ")} className="py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Integral ∫</button>
          <button onClick={() => setProblem(prev => prev + " d/dx ")} className="py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Derivative ∂</button>
        </div>

        <button
          onClick={handleSolve}
          disabled={isLoading || !problem.trim()}
          className="py-4 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 group shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sigma className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
          <span>Synthesize Solution</span>
        </button>
      </div>

      <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-colors duration-300 min-h-0">
        <div className="flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">Logic Plotter</h3>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Interactive Spatial Map</p>
            </div>
          </div>
          <div className="flex gap-2">
            {plotData && (
              <button 
                onClick={resetView}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/5"
                title="Reset View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {solution && (
              <button 
                onClick={() => { navigator.clipboard.writeText(solution); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-4 py-2 bg-white text-slate-900 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Captured' : 'Export'}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 relative z-10 overflow-hidden min-h-0">
          <div 
            ref={containerRef}
            className={`h-[280px] shrink-0 bg-black/40 rounded-[1.5rem] border border-white/5 relative overflow-hidden cursor-${isPanning ? 'grabbing' : 'crosshair'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
             <canvas 
              ref={canvasRef} 
              width={800} 
              height={400} 
              className="w-full h-full object-cover"
             />
             
             <div className="absolute bottom-4 left-4 flex gap-1.5">
                <div className="px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 text-[8px] font-black text-white/60 uppercase tracking-widest">
                   <div className="flex items-center gap-1"><MousePointer2 className="w-2.5 h-2.5 text-yellow-500" /> Trace</div>
                   <div className="flex items-center gap-1"><Move className="w-2.5 h-2.5 text-blue-500" /> Pan</div>
                   <div className="flex items-center gap-1"><ZoomIn className="w-2.5 h-2.5 text-emerald-500" /> Scroll</div>
                </div>
             </div>

             {!plotData && !isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-3 pointer-events-none">
                  <Grid className="w-12 h-12" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em]">Grid Synchronized</p>
               </div>
             )}
             {isLoading && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">Computing Spatial Layers...</p>
                  </div>
               </div>
             )}
          </div>

          <div className="flex-1 bg-white/5 rounded-[1.5rem] p-6 border border-white/5 overflow-y-auto custom-scrollbar text-white/90 text-xs leading-relaxed whitespace-pre-wrap font-medium min-h-0 break-words">
            {isLoading ? (
               <div className="h-full flex flex-col items-center justify-center gap-5">
                 <div className="w-10 h-0.5 bg-yellow-500/20 rounded-full overflow-hidden">
                    <motion.div animate={{ x: [-40, 80] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-full h-full bg-yellow-500" />
                 </div>
                 <p className="text-white/20 font-black text-[9px] uppercase tracking-[0.4em]">Distilling Proof</p>
               </div>
            ) : solution ? (
               <div className="animate-in fade-in duration-1000">
                  <div className="flex items-center gap-1.5 mb-4">
                     <Zap className="w-2.5 h-2.5 text-yellow-500" />
                     <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Neural Proof v4.0</span>
                  </div>
                  {solution}
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-white/5 uppercase tracking-[0.4em] font-black text-center gap-3">
                  <Sigma className="w-10 h-10" />
                  <p className="text-[9px]">Awaiting Vector Input</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathSolverTool;
