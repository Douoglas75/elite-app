import React from 'react';
import Logo from './Logo';
import Icon from './Icon';
import { type IconName } from '../constants';
import { useAppContext, ActiveTab } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const SideNavItem: React.FC<{ tab: ActiveTab; icon: IconName; label: string; tourId?: string; }> = ({ tab, icon, label, tourId }) => {
    const { activeTab, viewingUser, activeChatThreadId, activeSubView, selectTab } = useAppContext();
    const isActive = activeTab === tab && !viewingUser && !activeChatThreadId && !activeSubView;
    return (
      <button
        data-tour={tourId}
        onClick={() => selectTab(tab)}
        className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl duration-200 group ${isActive ? 'bg-[#D2B48C]/10 text-[#D2B48C]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
      >
        <Icon name={icon} className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
      </button>
    );
};
  
const BottomNavItem: React.FC<{ tab: ActiveTab; icon: IconName; label: string; tourId?: string; }> = ({ tab, icon, label, tourId }) => {
    const { activeTab, viewingUser, activeChatThreadId, activeSubView, selectTab } = useAppContext();
    const isActive = activeTab === tab && !viewingUser && !activeChatThreadId && !activeSubView;
    return (
      <button
        data-tour={tourId}
        onClick={() => selectTab(tab)}
        className="flex flex-col items-center justify-center gap-1 w-full h-full relative outline-none"
      >
        <Icon name={icon} className={`w-6 h-6 duration-300 ${isActive ? 'text-[#D2B48C] -translate-y-1' : 'text-slate-500'}`} />
        <span className={`text-[9px] font-black uppercase tracking-tighter duration-300 ${isActive ? 'text-[#D2B48C] opacity-100' : 'text-slate-500 opacity-60'}`}>{label}</span>
        {isActive && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#D2B48C] shadow-[0_0_8px_rgba(210,180,140,0.8)]"></div>}
      </button>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { activeTab, viewingUser, activeChatThreadId, activeSubView } = useAppContext();
    // On masque la nav globale SI on est dans une vue spécifique qui a sa propre barre d'action
    const showNavBar = !viewingUser && !activeChatThreadId && !activeSubView;

    return (
        <div className="h-full w-full bg-[#050B14] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="h-full bg-[#0D1625]/95 w-[280px] flex-col p-6 border-r border-white/5 hidden md:flex backdrop-blur-xl">
                <div className="mb-12 px-2">
                    <Logo className="h-10" />
                </div>
                <nav className="flex flex-col gap-2.5">
                    <SideNavItem tab="discover" icon="search" label="Découvrir" tourId="discover-tab" />
                    <SideNavItem tab="favorites" icon="heart" label="Favoris" tourId="favorites-tab" />
                    <SideNavItem tab="messages" icon="message" label="Messages" tourId="messages-tab" />
                    <SideNavItem tab="bookings" icon="calendar" label="Réservations" tourId="bookings-tab" />
                    <SideNavItem tab="profile" icon="user" label="Profil" tourId="profile-tab" />
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>
                
                {/* Mobile Bottom Nav - STRICTLY FIXED AND CONDITIONAL */}
                {showNavBar && (
                    <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1625]/90 backdrop-blur-2xl border-t border-white/5 h-[84px] pb-[env(safe-area-inset-bottom)] px-2 z-[1000] md:hidden flex justify-around items-center">
                        <BottomNavItem tab="discover" icon="search" label="Explorer" />
                        <BottomNavItem tab="favorites" icon="heart" label="Favoris" />
                        <BottomNavItem tab="messages" icon="message" label="Chats" />
                        <BottomNavItem tab="bookings" icon="calendar" label="Séances" />
                        <BottomNavItem tab="profile" icon="user" label="Moi" />
                    </nav>
                )}
            </div>
        </div>
    );
};

export default Layout;