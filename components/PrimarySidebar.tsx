import React from 'react';
// FIX: Changed import path for Module type to where it's actually exported.
import type { Module } from './context/AppContext';

interface PrimarySidebarProps {
  activeModule: string;
  onNavigate: (module: Module) => void;
}

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  module: Module;
  isActive: boolean;
  onClick: (module: Module) => void;
}> = ({ icon, label, module, isActive, onClick }) => (
  <button
    onClick={() => onClick(module)}
    title={label}
    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 relative group transform hover:scale-110 ${
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    {icon}
    <span className="absolute left-full ml-4 px-2 py-1 bg-card border border-border text-foreground text-xs rounded-md invisible group-hover:visible whitespace-nowrap z-30">
      {label}
    </span>
    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-full"></div>}
  </button>
);

const PrimarySidebar: React.FC<PrimarySidebarProps> = ({ activeModule, onNavigate }) => {
  return (
    // Mobile view
    <nav className="h-full bg-background border-r border-border flex-col items-center justify-between p-2 flex-shrink-0 z-30 backdrop-blur-xl hidden md:flex">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 flex items-center justify-center mb-4">
            <img src="https://i.postimg.cc/59BYkdyG/Posta.png" alt="PostaGate Logo" className="w-10 rounded-lg" />
        </div>

        <NavButton
          icon={<i className="fa-solid fa-inbox w-6 h-6"></i>}
          label="Email"
          module="email"
          isActive={activeModule === 'email'}
          onClick={onNavigate}
        />
        <NavButton
          icon={<i className="fa-solid fa-wand-magic-sparkles w-6 h-6"></i>}
          label="WP Flag"
          module="copilot"
          isActive={activeModule === 'copilot'}
          onClick={onNavigate}
        />
        <NavButton
          icon={<i className="fa-solid fa-comment-dots w-6 h-6"></i>}
          label="Chat"
          module="chat"
          isActive={activeModule === 'chat'}
          onClick={onNavigate}
        />
        <NavButton
          icon={<i className="fa-solid fa-cloud w-6 h-6"></i>}
          label="Drive"
          module="drive"
          isActive={activeModule === 'drive'}
          onClick={onNavigate}
        />
         <NavButton
          icon={<i className="fa-solid fa-swatchbook w-6 h-6"></i>}
          label="Design System"
          module="design-system"
          isActive={activeModule === 'design-system'}
          onClick={onNavigate}
        />
      </div>

      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={() => onNavigate('settings')}
          title="Settings"
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 relative group transform hover:scale-110 ${
            activeModule === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <i className="fa-solid fa-gear w-6 h-6"></i>
           {activeModule === 'settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-full"></div>}
        </button>
        <div className="relative">
            <img className="w-10 h-10 rounded-full" src="https://api.dicebear.com/8.x/adventurer/svg?seed=You" alt="User Avatar" />
            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
        </div>
      </div>
    </nav>
  );
};

export default PrimarySidebar;
