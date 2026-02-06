
import React, { useRef } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import type { MoodboardItem } from '../types';

const MoodboardView: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const { currentUser, moodboards, updateMoodboard, trackAction } = useUser();
  const { setFullScreenMedia } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const bidStr = bookingId.toString();
  const items = moodboards[bidStr] || [
    { 
      id: '1', 
      url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', 
      addedBy: 'Direction Artistique', 
      comment: 'Inspiration : Minimalisme & Texture',
      timestamp: Date.now()
    }
  ];

  const handleAddItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
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

  const removeItem = (id: string) => {
    if (confirm("Supprimer cette référence ?")) {
        const newItems = items.filter(item => item.id !== id);
        updateMoodboard(bidStr, newItems);
    }
  };

  const updateComment = (id: string, newComment: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, comment: newComment } : item);
    updateMoodboard(bidStr, newItems);
  };

  return (
    <div className="flex flex-col h-full bg-[#050B14] animate-view-transition">
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0D1625]/80 backdrop-blur-2xl sticky top-0 z-20">
        <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Icon name="grid" className="w-5 h-5 text-[#D2B48C]" />
                Vision Collaborative
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Espace créatif partagé</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-xl transition-all active:scale-90"
        >
          <Icon name="plusCircle" className="w-6 h-6 text-[#D2B48C]" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleAddItem} className="hidden" accept="image/*" />
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.map(item => (
                <div key={item.id} className="bg-[#0D1625] rounded-[3rem] overflow-hidden border border-white/5 group relative shadow-2xl hover:border-[#D2B48C]/20 transition-all">
                    <div className="relative aspect-square overflow-hidden cursor-zoom-in" onClick={() => setFullScreenMedia({ type: 'image', url: item.url })}>
                        <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Reference" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            className="absolute top-5 right-5 p-3 bg-red-500/80 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Icon name="close" className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="p-6">
                        <textarea 
                            value={item.comment}
                            onChange={(e) => updateComment(item.id, e.target.value)}
                            placeholder="Notes artistiques..."
                            className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none font-medium leading-relaxed italic"
                        />
                        <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <span>{item.addedBy}</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MoodboardView;
