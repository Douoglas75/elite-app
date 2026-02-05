
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
        className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl duration-200 group ${isActive ? 'bg-[#E1C699]/10 text-[#E1C699]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
        aria-current={isActive ? 'page' : undefined}
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
        className="flex flex-col items-center justify-center gap-1 w-full h-full relative"
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon name={icon} className={`w-6 h-6 duration-300 ${isActive ? 'text-[#E1C699] -translate-y-1' : 'text-slate-500'}`} />
        <span className={`text-[10px] font-black uppercase tracking-tighter duration-300 ${isActive ? 'text-[#E1C699] opacity-100' : 'text-slate-500 opacity-60'}`}>{label}</span>
        {isActive && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#E1C699] shadow-[0_0_8px_rgba(225,198,153,0.8)]"></div>}
      </button>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { activeTab, viewingUser, activeChatThreadId, activeSubView } = useAppContext();
    const showNavBar = !viewingUser && !activeChatThreadId && !activeSubView;

    return (
        <div id="app-container" className="h-full bg-[#050B14] text-white md:grid md:grid-cols-[280px_1fr]">
            {/* Sidebar Desktop */}
            <aside className="h-full bg-[#0D1625]/95 flex-col p-6 border-r border-white/5 hidden md:flex backdrop-blur-xl">
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
                
                <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#E1C699] rounded-full animate-pulse shadow-[0_0_8px_#E1C699]"></div>
                        <span className="text-xs font-bold text-slate-300">Reseau Elite Actif</span>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="h-full flex flex-col relative overflow-hidden">
                <main className="flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        {children}
                    </div>
                </main>
                
                {/* Mobile Bottom Nav */}
                {showNavBar && (
                    <nav className="absolute bottom-0 left-0 right-0 bg-[#0D1625]/95 backdrop-blur-xl border-t border-white/5 grid grid-cols-5 h-20 px-2 z-[1000] md:hidden mobile-bottom-nav">
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
