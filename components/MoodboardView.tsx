
import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { generateVisualInspiration } from '../services/geminiService';
/* Import MoodboardItem from types to resolve conflict with local interface and fix type mismatch errors */
import type { MoodboardItem } from '../types';

const MoodboardView: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const { currentUser, moodboards, updateMoodboard, trackAction } = useUser();
  const { setFullScreenMedia } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // On récupère les items depuis le store global
  const bidStr = bookingId.toString();
  /* Fix: Added missing timestamp to initial fallback items to match MoodboardItem interface */
  const items = moodboards[bidStr] || [
    { 
      id: '1', 
      url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', 
      addedBy: 'Système', 
      comment: 'Inspiration : Direction artistique Minimaliste',
      timestamp: Date.now()
    }
  ];

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        /* Fix: Added missing timestamp property to newItem to satisfy the MoodboardItem interface */
        const newItem: MoodboardItem = {
          id: Date.now().toString(),
          url: event.target?.result as string,
          addedBy: currentUser.name,
          comment: 'Nouvelle inspiration...',
          timestamp: Date.now()
        };
        updateMoodboard(bidStr, [newItem, ...items]);
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
            /* Fix: Added missing timestamp property to AI generated newItem */
            const newItem: MoodboardItem = {
                id: Date.now().toString(),
                url: imageUrl,
                addedBy: 'Elite AI',
                comment: `Généré pour : ${aiPrompt}`,
                timestamp: Date.now()
            };
            updateMoodboard(bidStr, [newItem, ...items]);
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
        const newItems = items.filter(item => item.id !== id);
        updateMoodboard(bidStr, newItems);
        trackAction('MOODBOARD_REMOVE_ITEM', { bookingId, itemId: id });
    }
  };

  const updateComment = (id: string, newComment: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, comment: newComment } : item);
    updateMoodboard(bidStr, newItems);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] animate-view-transition">
      <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
        <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Icon name="grid" className="w-5 h-5 text-purple-400" />
                Moodboard Pro
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vision partagée</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className="p-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded-2xl text-purple-400 transition-all active:scale-90"
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
            <div className="flex gap-3">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Futurisme, néons, ambiance studio..."
                    className="flex-1 bg-slate-950/50 border border-purple-500/20 rounded-2xl px-5 py-3 text-sm text-white outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-purple-600 px-6 rounded-2xl font-black text-xs uppercase"
                >
                    {isGenerating ? '...' : 'Générer'}
                </button>
            </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.map(item => (
                <div key={item.id} className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 group relative shadow-2xl">
                    <div className="relative aspect-square overflow-hidden" onClick={() => setFullScreenMedia({ type: 'image', url: item.url })}>
                        <img src={item.url} className="w-full h-full object-cover" alt="Inspiration" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Icon name="close" className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="p-5">
                        <textarea 
                            value={item.comment}
                            onChange={(e) => updateComment(item.id, e.target.value)}
                            placeholder="Note..."
                            className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MoodboardView;
