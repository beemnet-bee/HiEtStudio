
import React, { useState, useRef, useEffect } from 'react';
import { Map as MapIcon, Search, Loader2, MapPin, Navigation, ExternalLink, Compass, Globe, Sparkles, Map as MapUI, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import L from 'leaflet';

const NavigatorTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [grounding, setGrounding] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [51.505, -0.09], // Default fallback
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const handleGeolocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          
          if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], 14);
            
            if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
            
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-pulse"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(mapRef.current);
            userMarkerRef.current.bindPopup('Your Current Location').openPopup();
          }
        },
        (err) => console.debug("Geolocation disabled"),
        { enableHighAccuracy: true }
      );
    };

    handleGeolocation();
  }, []);

  // Sync Markers with Grounding
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const newMarkers: any[] = [];
    const points: any[] = [];

    grounding.forEach((chunk, i) => {
      if (chunk.maps) {
        const title = chunk.maps.title || "Target";
        const mockLat = location ? location.lat + (Math.random() - 0.5) * 0.02 : 51.505 + (Math.random() - 0.5) * 0.02;
        const mockLng = location ? location.lng + (Math.random() - 0.5) * 0.02 : -0.09 + (Math.random() - 0.5) * 0.02;

        const placeIcon = L.divIcon({
          className: 'custom-place-marker',
          html: `<div class="w-8 h-8 bg-emerald-600 border-2 border-white rounded-2xl flex items-center justify-center text-white shadow-xl transform rotate-45"><div class="-rotate-45"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([mockLat, mockLng], { icon: placeIcon }).addTo(mapRef.current);
        marker.bindPopup(`<div class="p-2 font-bold text-slate-900">${title}</div>`);
        newMarkers.push(marker);
        points.push([mockLat, mockLng]);
      }
    });

    markersRef.current = newMarkers;

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (location) bounds.extend([location.lat, location.lng]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [grounding, location]);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setNeedsKey(false);
  };

  const handleNavigate = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResponse('');
    setGrounding([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        tools: [{ googleMaps: {} }, { googleSearch: {} }]
      };
      
      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: { latitude: location.lat, longitude: location.lng }
          }
        };
      }

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config
      });

      setResponse(result.text || '');
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setGrounding(chunks);
    } catch (err: any) {
      console.error(err);
      const isPermissionError = err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED");
      if (isPermissionError) {
        setNeedsKey(true);
      } else {
        setResponse('Spatial grounding failure. Failed to resolve coordinate data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (needsKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-10 bg-white rounded-[3rem] border border-slate-200">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
          <Key className="w-10 h-10" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Maps Permission Required</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Google Maps Grounding requires a paid API key from a Google Cloud Project with active billing.
          </p>
          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl"
          >
            Select Paid API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-600/5">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Spatial Navigator</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Grounded Place Intelligence</p>
          </div>
        </div>

        <div className="w-full max-w-4xl flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[2rem] p-3 shadow-inner focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all duration-300">
          <MapPin className="w-5 h-5 text-slate-400 ml-4" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="Search for restaurants, landmarks, or spatial info..."
            className="flex-1 bg-transparent border-none outline-none px-2 text-lg font-semibold text-slate-900 placeholder:text-slate-300"
          />
          <button 
            onClick={handleNavigate}
            disabled={isLoading || !query.trim()}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            <span className="font-black text-[10px] uppercase tracking-widest hidden sm:inline">Resolve</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 h-full min-h-[600px]">
        {/* Map View */}
        <div className="lg:col-span-2 bg-slate-100 rounded-[3rem] overflow-hidden shadow-inner border border-slate-200 relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="absolute top-6 left-6 z-[10] flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-xl">
            <MapUI className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Coordinate Feed</span>
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-[20] flex items-center justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
                 <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                 <span className="text-xs font-black uppercase tracking-widest text-slate-900">Syncing Geodata...</span>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence & Verified Places */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-extrabold text-slate-900">Intelligence</h4>
              </div>
              {location && (
                 <div className="text-[9px] font-black text-slate-400 uppercase px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                   POS: {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
                 </div>
              )}
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 overflow-y-auto custom-scrollbar text-base leading-relaxed font-medium text-slate-800">
               {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-emerald-600 opacity-60">
                     <Loader2 className="w-8 h-8 animate-spin" />
                     <p className="font-black text-[10px] uppercase tracking-widest">Querying Map Layers...</p>
                  </div>
               ) : response ? (
                  <div className="animate-in fade-in duration-700 prose max-w-none">
                    {response}
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
                     <MapIcon className="w-16 h-16 stroke-[1]" />
                     <p className="font-black text-[10px] uppercase tracking-widest">Awaiting spatial probe</p>
                  </div>
               )}
            </div>
          </div>

          <div className="h-1/3 bg-slate-900 rounded-[3rem] p-8 flex flex-col gap-6 shadow-2xl overflow-hidden">
             <div className="flex items-center gap-3 shrink-0">
               <Sparkles className="w-5 h-5 text-emerald-400" />
               <h4 className="text-lg font-extrabold text-white">Resolved Locations</h4>
             </div>
             <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {grounding.length > 0 ? grounding.map((chunk, i) => (
                  chunk.maps && (
                    <button 
                      key={i}
                      onClick={() => {}}
                      className="w-full text-left bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-2xl transition-all group animate-in slide-in-from-right-4"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                         <h5 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors truncate">{chunk.maps.title || "Target Identified"}</h5>
                         <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white transition-all shrink-0 ml-2" />
                      </div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Grounded Reference</p>
                    </button>
                  )
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/5 gap-3">
                     <MapPin className="w-8 h-8" />
                     <p className="text-[9px] font-black uppercase tracking-widest">Buffer Empty</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigatorTool;
