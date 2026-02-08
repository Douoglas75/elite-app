import React, { useState, useEffect, useRef } from 'react';
import type { MessageThread, User } from '../types';
import { generateChatSuggestion } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import Icon from './Icon';

interface ChatViewProps {
  thread: MessageThread;
  otherUser: User;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ thread, otherUser, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, addMessage, messages: allThreads } = useUser();

  // On récupère le thread à jour depuis le contexte
  const currentThread = allThreads.find(t => t.id === thread.id) || thread;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [currentThread.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    addMessage(currentThread.id, newMessage.trim());
    setNewMessage('');
    setSuggestions([]); 
  };
  
  const handleGetSuggestions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
        // Fix: Use 'types' array joined by slash instead of non-existent 'type' property
        const generatedSuggestions = await generateChatSuggestion(currentUser.types.join('/'), otherUser.types.join('/'));
        setSuggestions(generatedSuggestions);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSuggesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 animate-fade-in">
      <header className="flex items-center p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-cyan-400 hover:bg-gray-800 rounded-full transition-all">
           <Icon name="chevronRight" className="w-6 h-6 rotate-180" />
        </button>
        <img src={otherUser.avatarUrl} className="w-10 h-10 rounded-full object-cover ml-2 border border-cyan-500/50" />
        <div className="ml-3">
          <h2 className="font-bold text-white">{otherUser.name}</h2>
          <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">En ligne</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {currentThread.messages.length === 0 && (
            <div className="text-center py-10 opacity-40">
                <Icon name="sparkles" className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <p className="text-sm">Envoyez le premier message à {otherUser.name} pour démarrer la collaboration.</p>
            </div>
        )}
        {currentThread.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg ${
                msg.senderId === currentUser.id 
                ? 'bg-cyan-600 text-white rounded-br-none shadow-cyan-500/10' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none shadow-black/20'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
              <span className="text-[9px] opacity-40 mt-1 block text-right font-mono">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900/50 border-t border-gray-800">
          {suggestions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {suggestions.map((s, i) => (
                    <button 
                        key={i} 
                        onClick={() => { setNewMessage(s); setSuggestions([]); }} 
                        className="whitespace-nowrap px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs rounded-full font-bold transition-all hover:bg-purple-600/40"
                    >
                        {s}
                    </button>
                ))}
            </div>
          )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-gray-800 p-2 rounded-2xl border border-gray-700">
            <button
              type="button"
              onClick={handleGetSuggestions}
              className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
            >
              {isSuggesting ? <div className="w-5 h-5 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" /> : <Icon name="sparkles" className="w-6 h-6" />}
            </button>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message de collaboration..."
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
            />
            <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-2 bg-cyan-600 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-cyan-500/20"
            >
                <Icon name="bolt" className="w-5 h-5" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;