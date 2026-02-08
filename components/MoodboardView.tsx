
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
      comment: 'Inspiration : Minimalisme & Contrastes profonds',
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
          comment: 'Nouveau concept ajouté...',
          timestamp: Date.now()
        };
        updateMoodboard(bidStr, [newItem, ...items]);
        trackAction('MOODBOARD_ADD_ITEM', { bookingId, itemId: newItem.id });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItem = (id: string) => {
    if (confirm("Supprimer cette référence du moodboard ?")) {
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
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0D1625]/60 backdrop-blur-3xl sticky top-0 z-20">
        <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                <Icon name="grid" className="w-6 h-6 text-[#D2B48C]" />
                Moodboard Pro
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Partagez votre vision artistique</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-[1.5rem] border border-white/10 shadow-2xl transition-all active:scale-90 flex items-center justify-center"
        >
          <Icon name="plusCircle" className="w-6 h-6 text-[#D2B48C]" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleAddItem} className="hidden" accept="image/*" />
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 pb-32 no-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {items.map(item => (
                <div key={item.id} className="bg-[#0D1625] rounded-[3.5rem] overflow-hidden border border-white/5 group relative shadow-2xl hover:border-[#D2B48C]/30 transition-all duration-700">
                    <div className="relative aspect-[4/5] overflow-hidden cursor-zoom-in" onClick={() => setFullScreenMedia({ type: 'image', url: item.url })}>
                        <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Reference" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1625] via-transparent to-transparent opacity-60" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            className="absolute top-6 right-6 p-4 bg-red-500/80 backdrop-blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <Icon name="close" className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="p-8">
                        <textarea 
                            value={item.comment}
                            onChange={(e) => updateComment(item.id, e.target.value)}
                            placeholder="Annotation artistique..."
                            className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none font-medium leading-relaxed italic border-none focus:ring-0 p-0"
                        />
                        <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#D2B48C] rounded-full" />
                                {item.addedBy}
                            </span>
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
