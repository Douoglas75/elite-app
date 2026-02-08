
import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import type { QuizQuestion } from '../types';
import Icon from './Icon';

interface QuizModalProps {
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'loading' | 'active' | 'finished'>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const q = await generateQuizQuestions();
      setQuestions(q);
      setStatus(q.length > 0 ? 'active' : 'finished');
    };
    load();
  }, []);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[currentIndex].correctAnswerIndex) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
      } else {
        setStatus('finished');
      }
    }, 1200);
  };

  if (status === 'loading') return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 font-bold animate-pulse text-lg">Génération de questions Expert via Vertex AI...</p>
      </div>
    </div>
  );

  if (status === 'finished') {
    const discount = score === questions.length ? 7 : (score > 2 ? 5 : 0);
    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="check" className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Quiz Terminé !</h2>
          <p className="text-gray-400 mb-6">Vous avez obtenu un score de {score}/{questions.length}</p>
          
          {discount > 0 ? (
            <div className="bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-2xl p-6 mb-8">
              <p className="text-sm text-cyan-300 uppercase tracking-widest font-bold mb-1">Privilège Elite Débloqué</p>
              <p className="text-4xl font-black text-white mb-2">-{discount}%</p>
              <p className="text-xs text-gray-400 leading-relaxed">Réduction appliquée automatiquement sur les frais de service de votre prochaine réservation avec Escrow.</p>
            </div>
          ) : (
            <p className="text-gray-500 mb-8 italic">Entraînez-vous encore pour débloquer les remises pro !</p>
          )}

          <button onClick={onClose} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all">
            FERMER LE MODULE
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">ÉVALUATION TECHNIQUE</span>
          <span className="text-xs text-gray-500 font-mono">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="p-8">
          <h3 className="text-xl font-bold text-white mb-8 leading-snug">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`w-full p-4 rounded-2xl text-left text-sm font-medium border transition-all flex justify-between items-center ${
                  selected === i 
                    ? (i === q.correctAnswerIndex ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300')
                    : (selected !== null && i === q.correctAnswerIndex ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-cyan-500/50')
                }`}
              >
                {opt}
                {selected === i && (
                  <Icon name={i === q.correctAnswerIndex ? 'check' : 'close'} className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
