import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { generateVisualInspiration } from '../services/geminiService';

interface MoodboardItem {
  id: string;
  url: string;
  addedBy: string;
  comment: string;
}

const MoodboardView: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const { currentUser, trackAction } = useUser();
  const { setFullScreenMedia } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [items, setItems] = useState<MoodboardItem[]>(() => {
    const saved = localStorage.getItem(`elite_moodboard_${bookingId}`);
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', 
        addedBy: 'Système', 
        comment: 'Inspiration : Direction artistique Minimaliste' 
      }
    ];
  });

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem(`elite_moodboard_${bookingId}`, JSON.stringify(items));
  }, [items, bookingId]);

  const handleAddItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem: MoodboardItem = {
          id: Date.now().toString(),
          url: event.target?.result as string,
          addedBy: currentUser.name,
          comment: 'Nouvelle inspiration...'
        };
        setItems(prev => [newItem, ...prev]);
        trackAction('MOODBOARD_ADD_ITEM', { bookingId, itemId: newItem.id });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
        const imageUrl = await generateVisualInspiration(aiPrompt);
        if (imageUrl) {
            const newItem: MoodboardItem = {
                id: Date.now().toString(),
                url: imageUrl,
                addedBy: 'Elite AI',
                comment: `Généré pour : ${aiPrompt}`
            };
            setItems(prev => [newItem, ...prev]);
            setAiPrompt('');
            setIsAiPanelOpen(false);
            trackAction('MOODBOARD_AI_GENERATE', { prompt: aiPrompt });
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const removeItem = (id: string) => {
    if (confirm("Supprimer cette inspiration du moodboard ?")) {
        setItems(prev => prev.filter(item => item.id !== id));
        trackAction('MOODBOARD_REMOVE_ITEM', { bookingId, itemId: id });
    }
  };

  const updateComment = (id: string, newComment: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, comment: newComment } : item));
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] animate-view-transition">
      <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
        <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Icon name="grid" className="w-5 h-5 text-purple-400" />
                Moodboard Collaboratif
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Partage de vision créative</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className="p-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded-2xl text-purple-400 transition-all active:scale-90"
              title="Générer par IA"
            >
              <Icon name="sparkles" className="w-6 h-6" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 shadow-lg transition-all active:scale-90"
            >
              <Icon name="plusCircle" className="w-6 h-6 text-white" />
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleAddItem} className="hidden" accept="image/*" />
      </header>

      {isAiPanelOpen && (
        <div className="p-6 bg-purple-900/10 border-b border-purple-500/20 animate-fade-in-down">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-3">Elite AI Concept Generator</h3>
            <div className="flex gap-3">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Décrivez un concept visuel (ex: Cyberpunk Paris au crépuscule...)"
                    className="flex-1 bg-slate-950/50 border border-purple-500/20 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white px-6 rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2"
                >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Icon name="bolt" className="w-4 h-4"/>}
                    {isGenerating ? 'Calcul...' : 'Créer'}
                </button>
            </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
        {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.map(item => (
                <div key={item.id} className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 group relative shadow-2xl hover:border-cyan-500/30 transition-all duration-500">
                    <div 
                        className="relative cursor-zoom-in aspect-square overflow-hidden"
                        onClick={() => setFullScreenMedia({ type: 'image', url: item.url })}
                    >
                        <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Mood inspiration" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                className="p-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-all"
                            >
                                <Icon name="close" className="w-4 h-4" />
                            </button>
                        </div>
                        {item.addedBy === 'Elite AI' && (
                            <div className="absolute top-4 left-4">
                                <span className="bg-purple-600/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest">AI Generated</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 bg-slate-900/90 backdrop-blur-md">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Ajouté par {item.addedBy}</p>
                        <textarea 
                            value={item.comment}
                            onChange={(e) => updateComment(item.id, e.target.value)}
                            placeholder="Éditer la note..."
                            rows={2}
                            className="w-full bg-transparent text-sm text-slate-300 outline-none border-b border-slate-800 focus:border-cyan-500 pb-2 transition-colors resize-none"
                        />
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-20">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 opacity-20 border-2 border-dashed border-slate-700">
                    <Icon name="grid" className="w-10 h-10" />
                </div>
                <p className="font-black uppercase tracking-widest text-xs">Moodboard prêt</p>
                <p className="text-xs mt-2 max-w-[200px] leading-relaxed opacity-50">Appuyez sur le bouton + ou IA pour partager vos premières inspirations.</p>
            </div>
        )}
      </div>

      <div className="fixed bottom-24 left-6 right-6 md:left-[280px] md:right-10 z-30">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-3 flex gap-3 shadow-2xl">
          <input 
            placeholder="Discuter de la DA..." 
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" 
          />
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white p-3.5 rounded-2xl shadow-xl shadow-cyan-600/20 transition-all active:scale-95">
            <Icon name="message" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodboardView;