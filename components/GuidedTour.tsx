
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import Icon from './Icon';

interface GuidedTourProps {
  onClose: () => void;
}

const tourSteps = [
  {
    selector: '[data-tour="app-logo"]',
    title: "Bienvenue sur Findaphotographer Elite",
    content: "Découvrez l'écosystème ultime propulsé par Google Cloud et Vertex AI pour vos projets visuels.",
  },
  {
    selector: '[data-tour="sos-button"]',
    title: "Bouton SOS 'Last Minute'",
    content: "Un besoin urgent ? Géolocalisez instantanément les pros disponibles dans un rayon de 10km.",
  },
  {
    selector: '[data-tour="discover-tab"]',
    title: "Découverte Intelligente",
    content: "Basculez entre la vue Grille et la Carte pour trouver les talents près de chez vous.",
  },
  {
    selector: '[data-tour="bookings-tab"]',
    title: "Gestion des Réservations",
    content: "Suivez vos shootings, contrats et paiements en séquestre depuis cet onglet centralisé.",
  },
  {
    title: "Prêt pour l'excellence ?",
    content: "Testez vos connaissances avec notre Quiz IA pour débloquer des réductions sur vos premières réservations !",
  },
];

const GuidedTour: React.FC<GuidedTourProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const currentStep = tourSteps[stepIndex];
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  const updatePosition = useCallback(() => {
    const { selector } = currentStep;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (selector) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        const targetRect = element.getBoundingClientRect();
        
        // S'assurer que l'élément est bien visible et a une taille
        if (targetRect.width === 0 && targetRect.height === 0) {
            // Si l'élément est caché, on centre le tooltip par défaut
            setHighlightStyle({ opacity: 0 });
            setTooltipStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 });
            return;
        }

        element.classList.add('tour-highlight-active');
        lastActiveElementRef.current = element;

        const padding = 8;
        setHighlightStyle({
          width: targetRect.width + (padding * 2),
          height: targetRect.height + (padding * 2),
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          opacity: 1,
        });

        const tooltipWidth = 280;
        const tooltipHeight = 160;
        
        // Déterminer si on place au dessus ou en dessous
        let top: number;
        if (targetRect.top > tooltipHeight + 40) {
          top = targetRect.top - tooltipHeight - 20;
        } else {
          top = targetRect.bottom + 20;
        }

        // Déterminer le centrage horizontal
        let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        
        // Sécurité pour les bords de l'écran
        left = Math.max(20, Math.min(left, screenWidth - tooltipWidth - 20));
        top = Math.max(20, Math.min(top, screenHeight - tooltipHeight - 20));

        setTooltipStyle({ 
            top: `${top}px`, 
            left: `${left}px`, 
            opacity: 1, 
            transform: 'none',
            width: `${tooltipWidth}px` 
        });
      }
    } else {
      setHighlightStyle({ opacity: 0, width: 0, height: 0 });
      setTooltipStyle({ 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          opacity: 1,
          width: '300px'
      });
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    if (lastActiveElementRef.current) {
        lastActiveElementRef.current.classList.remove('tour-highlight-active');
    }
    
    // Un petit délai pour s'assurer que le DOM est stable (animations CSS en cours)
    const timeout = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition, stepIndex]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) setStepIndex(stepIndex + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] animate-fade-in pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={onClose}></div>
      
      {/* Zone de surbrillance */}
      <div 
        className="absolute border-2 border-cyan-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.4)] transition-all duration-500 ease-out" 
        style={highlightStyle}
      ></div>

      {/* Bulle d'information */}
      <div 
        className="absolute bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-6 text-center pointer-events-auto transition-all duration-300 ease-out" 
        style={tooltipStyle}
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <Icon name="sparkles" className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h3 className="font-bold text-base text-white mb-2">{currentStep.title}</h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">{currentStep.content}</p>
        <div className="flex justify-between items-center gap-4">
          <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Passer</button>
          <button onClick={handleNext} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-600/20">
            {stepIndex === tourSteps.length - 1 ? 'TERMINER' : 'SUIVANT'}
          </button>
        </div>
        <div className="flex justify-center gap-1 mt-5">
          {tourSteps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === stepIndex ? 'w-6 bg-cyan-500' : 'w-1 bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
