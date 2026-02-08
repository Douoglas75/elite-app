
import React from 'react';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';

const Lightbox: React.FC = () => {
  const { fullScreenMedia, setFullScreenMedia } = useAppContext();

  if (!fullScreenMedia) return null;

  return (
    <div 
      className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setFullScreenMedia(null)}
    >
      <button 
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[3001]"
        onClick={() => setFullScreenMedia(null)}
      >
        <Icon name="close" className="w-6 h-6" />
      </button>
      
      <div className="max-w-full max-h-full flex items-center justify-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {fullScreenMedia.type === 'image' ? (
            <img 
                src={fullScreenMedia.url} 
                alt="Agrandissement" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
        ) : (
            <video 
                src={fullScreenMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-gray-800"
            />
        )}
      </div>
    </div>
  );
};

export default Lightbox;
