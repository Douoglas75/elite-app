
import React, { useState } from 'react';
import Icon from './Icon';
import { applyAIRetouch } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';

const GalleryView: React.FC<{ isPaid: boolean }> = ({ isPaid: initialIsPaid }) => {
  const { setProjectingMedia } = useAppContext();
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [images, setImages] = useState([
    { id: 'img1', type: 'image' as const, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200', isFavorite: false, name: 'Portrait_Elite_01.jpg' },
    { id: 'img2', type: 'image' as const, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200', isFavorite: true, name: 'Portrait_Elite_02.jpg' },
    { id: 'img3', type: 'image' as const, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200', isFavorite: false, name: 'Portrait_Elite_03.jpg' }
  ]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleAIRetouch = async (id: string, url: string) => {
    setIsProcessing(id);
    try {
        const newUrl = await applyAIRetouch(url);
        setImages(prev => prev.map(img => img.id === id ? { ...img, url: newUrl } : img));
    } finally {
        setIsProcessing(null);
    }
  };

  const handleDownloadHD = async (img: typeof images[0]) => {
    if (!isPaid) return;
    setDownloadingId(img.id);
    
    // Simulate HD Download logic
    // In a real app, this would fetch the original file or a signed URL
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const link = document.createElement('a');
    link.href = img.url;
    link.download = img.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadingId(null);
  };

  const handleDownloadAll = async () => {
    if (!isPaid) return;
    setDownloadingId('all');
    
    // Simulate ZIP generation and download
    await new Promise(resolve => setTimeout(resolve, 3000));
    alert("Votre archive ZIP contenant toutes les photos en HD est prête !");
    
    setDownloadingId(null);
  };

  const handleReleaseEscrow = () => {
    if (confirm("Êtes-vous sûr de vouloir libérer les fonds ? Cela débloquera l'accès aux photos HD de manière permanente.")) {
        setIsPaid(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] pb-20 animate-fade-in relative">
      <header className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/60 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Livrables Shooting</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
            <span className={isPaid ? 'text-green-400' : 'text-yellow-400'}>
                {isPaid ? 'Contrat rempli • HD disponible' : 'Photos protégées • Escrow en attente'}
            </span>
          </p>
        </div>
        
        {isPaid ? (
            <button 
                onClick={handleDownloadAll}
                disabled={downloadingId === 'all'}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2"
            >
                {downloadingId === 'all' ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Icon name="download" className="w-4 h-4" />
                )}
                Tout télécharger
            </button>
        ) : (
            <button 
                onClick={handleReleaseEscrow}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition-all active:scale-95"
            >
                LIBÉRER LE PAIEMENT
            </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar">
        {images.map(img => (
          <div key={img.id} className="relative rounded-[2rem] overflow-hidden group shadow-2xl border border-gray-800 bg-gray-900">
            <div className={`relative transition-all duration-700 ${!isPaid ? 'grayscale blur-[2px] opacity-80' : 'grayscale-0 blur-0 opacity-100'}`}>
                <img src={img.url} className="w-full aspect-[4/5] object-cover" alt={img.name} />
                
                {/* Overlay Watermark si non payé */}
                {!isPaid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden rotate-[-25deg]">
                    <div className="text-white/5 text-[8vw] font-black whitespace-nowrap uppercase tracking-[1em] opacity-30">
                        PREVIEW ONLY • FINDAPHOTOGRAPHER ELITE • PREVIEW ONLY
                    </div>
                  </div>
                )}
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <div className="flex gap-2.5">
                <button className={`p-3.5 backdrop-blur-md rounded-2xl text-white transition-all shadow-xl ${img.isFavorite ? 'bg-red-500/80' : 'bg-black/40 hover:bg-black/60'}`}>
                    <Icon name="heart" className={img.isFavorite ? 'fill-white' : ''} />
                </button>
                <button 
                  onClick={() => handleAIRetouch(img.id, img.url)}
                  disabled={isProcessing === img.id}
                  className="p-3.5 bg-purple-600/80 backdrop-blur-md rounded-2xl text-white hover:bg-purple-500 transition-all shadow-xl"
                  title="Retouche IA"
                >
                  {isProcessing === img.id ? (
                    <div className="w-6 h-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Icon name="sparkles" />
                  )}
                </button>
                <button 
                  onClick={() => setProjectingMedia({ type: 'image', url: img.url })}
                  className="p-3.5 bg-cyan-600/80 backdrop-blur-md rounded-2xl text-white hover:bg-cyan-500 transition-all shadow-xl"
                  title="Projection AR Murale"
                >
                  <Icon name="map" />
                </button>
              </div>

              {isPaid && (
                  <button 
                    onClick={() => handleDownloadHD(img)}
                    disabled={downloadingId === img.id}
                    className="p-4 bg-white text-black rounded-2xl shadow-2xl hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
                    title="Télécharger HD"
                  >
                    {downloadingId === img.id ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Icon name="download" className="w-6 h-6" />
                    )}
                  </button>
              )}
            </div>

            {!isPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none">
                     <div className="p-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl text-center space-y-1 shadow-2xl">
                        <Icon name="shieldCheck" className="w-8 h-8 text-cyan-400 mx-auto" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Contenu Protégé</p>
                        <p className="text-[8px] text-gray-500 uppercase font-bold">Libérez l'escrow pour l'HD</p>
                     </div>
                </div>
            )}
          </div>
        ))}

        <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <Icon name="check" className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Fin de la galerie</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
