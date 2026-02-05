import React, { memo } from 'react';
import type { MessageThread, User } from '../types';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const MessagesView: React.FC = () => {
  const { messages, users } = useUser();
  const { selectThread } = useAppContext();

  const findUser = (id: number) => users.find(u => u.id === id);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="p-4 border-b border-gray-800/50 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Messages</h1>
      </header>
      <div className="flex-1 pb-24 md:pb-4">
        {messages.length > 0 ? (
            messages.map(thread => {
            const user = findUser(thread.participantId);
            if (!user) return null;
            
            return (
                <div 
                key={thread.id} 
                className="flex items-center gap-4 p-4 border-b border-gray-800/50 hover:bg-gray-800/20 cursor-pointer transition-colors"
                onClick={() => selectThread(thread.id)}
                >
                <div className="relative">
                    <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                    {thread.unread && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-cyan-400 border-2 border-gray-950" />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white truncate">{user.name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{thread.timestamp}</span>
                    </div>
                    <p className={`truncate text-sm ${thread.unread ? 'text-white font-medium' : 'text-gray-400'}`}>{thread.lastMessage}</p>
                </div>
                </div>
            )
            })
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <Icon name="message" className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white">Boîte de réception vide</h2>
                <p className="mt-2 max-w-xs">Lorsque vous contacterez un utilisateur, vos messages apparaîtront ici.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default memo(MessagesView);