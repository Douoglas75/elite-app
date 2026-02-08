
import React from 'react';
import Logo from './Logo';
import Icon from './Icon';
import { type IconName } from '../constants';
import { useAppContext, ActiveTab } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const SideNavItem: React.FC<{ tab: ActiveTab; icon: IconName; label: string; }> = ({ tab, icon, label }) => {
  const { activeTab, viewingUser, activeChatThreadId, activeSubView, selectTab } = useAppContext();
  const isActive = activeTab === tab && !viewingUser && !activeChatThreadId && !activeSubView;
  return (
    <button
      onClick={() => selectTab(tab)}
      className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl duration-200 group ${isActive ? 'bg-[#D2B48C]/10 text-[#D2B48C]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
    >
      <Icon name={icon} className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
    </button>
  );
};

const BottomNavItem: React.FC<{ tab: ActiveTab; icon: IconName; label: string; }> = ({ tab, icon, label }) => {
  const { activeTab, viewingUser, activeChatThreadId, activeSubView, selectTab } = useAppContext();
  const isActive = activeTab === tab && !viewingUser && !activeChatThreadId && !activeSubView;
  return (
    <button
      onClick={() => selectTab(tab)}
      className="flex flex-col items-center justify-center gap-1 w-full h-full relative outline-none touch-manipulation z-[1000]"
    >
      <Icon name={icon} className={`w-6 h-6 duration-300 ${isActive ? 'text-[#D2B48C] -translate-y-1' : 'text-slate-500'}`} />
      <span className={`text-[9px] font-black uppercase tracking-tighter duration-300 ${isActive ? 'text-[#D2B48C] opacity-100' : 'text-slate-500 opacity-60'}`}>{label}</span>
      {isActive && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#D2B48C] shadow-[0_0_8px_rgba(210,180,140,0.8)]"></div>}
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { viewingUser, activeChatThreadId, activeSubView, activeTab } = useAppContext();
  const showNavBar = !viewingUser && !activeChatThreadId && !activeSubView;

  return (
    <div className="h-full w-full bg-[#050B14] flex flex-col md:flex-row overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside className="h-full bg-[#0D1625]/95 w-[260px] flex-col p-6 border-r border-white/5 hidden md:flex backdrop-blur-xl z-[100]">
        <div className="mb-12 px-2">
          <Logo className="h-10" />
        </div>
        <nav className="flex flex-col gap-2.5">
          <SideNavItem tab="discover" icon="search" label="Découvrir" />
          <SideNavItem tab="favorites" icon="heart" label="Favoris" />
          <SideNavItem tab="messages" icon="message" label="Messages" />
          <SideNavItem tab="bookings" icon="calendar" label="Workflows" />
          <SideNavItem tab="profile" icon="user" label="Mon Profil" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full z-0">
        <main key={activeTab} className={`flex-1 overflow-hidden relative h-full animate-fade-in ${showNavBar ? 'pb-[84px] md:pb-0' : ''}`}>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        {showNavBar && (
          <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1625]/95 backdrop-blur-3xl border-t border-white/5 h-[84px] pb-[env(safe-area-inset-bottom)] px-2 z-[900] md:hidden flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <BottomNavItem tab="discover" icon="search" label="Explorer" />
            <BottomNavItem tab="favorites" icon="heart" label="Favoris" />
            <BottomNavItem tab="messages" icon="message" label="Chats" />
            <BottomNavItem tab="bookings" icon="calendar" label="Séances" />
            <BottomNavItem tab="profile" icon="user" label="Profil" />
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
