import React from 'react';
// FIX: Changed import path for Module type to where it's actually exported.
import type { Module } from './context/AppContext';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface MobileBottomNavProps {
  activeModule: Module;
  onNavigate: (module: Module) => void;
}

const NavButton: React.FC<{
  icon: string;
  label: string;
  module: Module;
  isActive: boolean;
  onClick: (module: Module) => void;
}> = ({ icon, label, module, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(module)}
      title={label}
      aria-label={label}
      className={cn(
        'flex items-center justify-center transition-all duration-300 ease-in-out h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        isActive 
          ? 'bg-primary text-primary-foreground px-4 space-x-2'
          : 'w-12 text-muted-foreground opacity-70 hover:opacity-100'
      )}
    >
      <i className={`${icon} text-xl w-6 h-6`}></i>
      {isActive && <span className="text-xs font-semibold whitespace-nowrap">{label}</span>}
    </button>
  );
};

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeModule, onNavigate }) => {
  // Mobile view
  return (
    <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm">
        <div className="flex justify-around items-center h-16 px-2 bg-card/60 backdrop-blur-xl rounded-full shadow-lg border border-border">
            <NavButton icon="fa-solid fa-inbox" label="Email" module="email" isActive={activeModule === 'email'} onClick={onNavigate} />
            <NavButton icon="fa-solid fa-wand-magic-sparkles" label="WP Flag" module="copilot" isActive={activeModule === 'copilot'} onClick={onNavigate} />
            <NavButton icon="fa-solid fa-comment-dots" label="Chat" module="chat" isActive={activeModule === 'chat'} onClick={onNavigate} />
            <NavButton icon="fa-solid fa-hard-drive" label="Drive" module="drive" isActive={activeModule === 'drive'} onClick={onNavigate} />
            <NavButton icon="fa-solid fa-gear" label="Settings" module="settings" isActive={activeModule === 'settings'} onClick={onNavigate} />
        </div>
    </nav>
  );
};

export default MobileBottomNav;
