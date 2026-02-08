
import React, { memo } from 'react';
import type { MessageThread, User } from '../types';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const MessagesView: React.FC = () => {
  const { messages, users } = useUser();
  const { selectThread, setActiveTab } = useAppContext();

  const findUser = (id: number) => users.find(u => u.id === id);

  return (
    <div className="flex flex-col h-full animate-fade-in bg-[#050B14]">
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D1625]/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => setActiveTab('discover')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#D2B48C] transition-all">
           <Icon name="chevronRight" className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tighter">Messages</h1>
      </header>
      <div className="flex-1 pb-24 md:pb-4 overflow-y-auto">
        {messages.length > 0 ? (
            messages.map(thread => {
            const user = findUser(thread.participantId);
            if (!user) return null;
            
            return (
                <div 
                key={thread.id} 
                className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => selectThread(thread.id)}
                >
                <div className="relative">
                    <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                    {thread.unread && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-cyan-400 border-2 border-[#050B14]" />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white truncate">{user.name}</h3>
                    <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{thread.timestamp}</span>
                    </div>
                    <p className={`truncate text-xs ${thread.unread ? 'text-[#D2B48C] font-bold' : 'text-gray-400'}`}>{thread.lastMessage}</p>
                </div>
                </div>
            )
            })
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <Icon name="message" className="w-16 h-16 text-gray-700 mb-4" />
                <h2 className="text-xl font-semibold text-white">Boîte vide</h2>
                <p className="mt-2 max-w-xs text-sm">Vos collaborations apparaîtront ici.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default memo(MessagesView);
