
import React from 'react';
import Icon from './Icon';

interface QuizNotificationPopupProps {
  onStartQuiz: () => void;
  onClose: () => void;
}

const QuizNotificationPopup: React.FC<QuizNotificationPopupProps> = ({ onStartQuiz, onClose }) => {
  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 animate-popup-transition z-[1020]">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Icon name="sparkles" className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-white text-lg tracking-tight">Challenge Vertex AI</h4>
            <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Testez votre expertise et économisez <span className="text-cyan-400 font-bold">7% sur les frais Escrow</span> de votre prochain shooting.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={onStartQuiz}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black py-3 rounded-xl transition-all shadow-lg shadow-cyan-600/20 uppercase tracking-widest"
            >
              Lancer le défi
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold rounded-xl transition-all"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
    </div>
  );
};

export default QuizNotificationPopup;
