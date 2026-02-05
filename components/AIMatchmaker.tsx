import React, { useState, useEffect } from 'react';
import { getAICollaborationSuggestions } from '../services/geminiService';
import type { User, AISuggestion } from '../types';
import Icon from './Icon';
import UserProfileCard from './UserProfileCard';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

interface AIMatchmakerProps {
  viewedUser: User;
}

const AIMatchmaker: React.FC<AIMatchmakerProps> = ({ viewedUser }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, users: allUsers } = useUser();
  const { viewProfile } = useAppContext();

  useEffect(() => {
    // Only fetch if not own profile and we have enough users to match
    if (currentUser.id === viewedUser.id || allUsers.length < 3) {
        return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Fix: getAICollaborationSuggestions expected only 2 arguments, but was passed 3.
        const result = await getAICollaborationSuggestions(currentUser, viewedUser);
        setSuggestions(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [viewedUser.id, currentUser.id, allUsers, currentUser, viewedUser]);

  const suggestedUsers = suggestions
    .map(suggestion => {
      const user = allUsers.find(u => u.id === suggestion.userId);
      return user ? { ...user, justification: suggestion.justification } : null;
    })
    .filter((u): u is User & { justification: string } => u !== null);

  if (currentUser.id === viewedUser.id) return null;

  return (
    <div className="mt-6 animate-fade-in">
        <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-purple-400"/>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Matchmaking IA</span>
        </h4>
        
        {isLoading ? (
             <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center animate-pulse">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-purple-300">Analyse des synergies en cours...</p>
             </div>
        ) : suggestedUsers.length > 0 ? (
            <div className="space-y-4">
                {suggestedUsers.map(user => (
                    <div key={user.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl opacity-30 group-hover:opacity-70 transition duration-300 blur-sm"></div>
                        <div className="relative bg-gray-900 p-4 rounded-xl border border-gray-700">
                            <p className="text-sm text-gray-300 mb-3 italic flex gap-2">
                                <Icon name="sparkles" className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5"/>
                                "{user.justification}"
                            </p>
                            <UserProfileCard user={user} onSelect={viewProfile} />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                <p className="text-sm text-gray-400">Pas de suggestion évidente trouvée pour le moment.</p>
            </div>
        )}
    </div>
  );
};

export default AIMatchmaker;