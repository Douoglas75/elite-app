import React from 'react';

interface SubViewScreenProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const SubViewScreen: React.FC<SubViewScreenProps> = ({ title, onBack, children }) => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="p-4 border-b border-gray-800/50 flex-shrink-0 flex items-center gap-4">
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300">
          &larr; Retour
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default SubViewScreen;