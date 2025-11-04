import React, { useState } from 'react';

type Domain = 'hogwarts' | 'liverpool';

interface SidebarProps {
  isSidebarOpen: boolean;
  activeView: string;
  activeDomain: Domain;
  onNavigate: (view: string, domain?: Domain) => void;
  snoozedCount: number;
  unreadCounts: { hogwarts: number; liverpool: number; };
  totalUnread: number;
  onComposeClick: () => void;
  width: number;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: string;
  activeView: string;
  onNavigate: (view: string, domain?: Domain) => void;
  count?: number;
  domain?: Domain;
  activeDomain?: Domain;
}> = ({ icon, label, view, activeView, onNavigate, count, domain, activeDomain }) => {
  const isDomainSpecific = !!domain;
  const isActive = isDomainSpecific
    ? activeView === view && activeDomain === domain
    : activeView === view;

  return (
    <button onClick={() => onNavigate(view, domain)} className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 text-left ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>{count}</span>}
    </button>
  );
};

const DomainNavItem: React.FC<{ label: string; domain: Domain; activeView: string; activeDomain: string; onNavigate: (view: string, domain: Domain) => void; count?: number; }> = ({ label, domain, activeView, activeDomain, onNavigate, count }) => {
  const active = activeView === 'inbox' && activeDomain === domain;
  return (
    <button onClick={() => onNavigate('inbox', domain)} className={`w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm font-medium rounded-full transition-all duration-200 text-left ${active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
      <div className="flex items-center space-x-3">
        <span className={`w-2 h-2 rounded-full ${domain === 'hogwarts' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-muted-foreground/20 text-secondary-foreground' : 'bg-secondary text-muted-foreground'}`}>{count}</span>}
    </button>
  );
};

const LabelItem: React.FC<{ label: string; }> = ({ label }) => {
  return (
    <button className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm font-medium rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground text-left">
        <span>{label}</span>
    </button>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <h2 className="px-3 pt-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</h2>
);

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, activeView, activeDomain, onNavigate, snoozedCount, onComposeClick, unreadCounts, totalUnread, width }) => {
  const [isInboxOpen, setIsInboxOpen] = useState(true);
  const [isHogwartsOpen, setIsHogwartsOpen] = useState(true);
  const [isLiverpoolOpen, setIsLiverpoolOpen] = useState(true);
  const [isHogwartsLabelsOpen, setIsHogwartsLabelsOpen] = useState(false);
  const [isLiverpoolLabelsOpen, setIsLiverpoolLabelsOpen] = useState(false);
  
  return (
    <aside 
      style={{ width: `${width}px` }}
      // Mobile view
      className={`absolute md:relative z-50 h-full bg-background border-r border-border flex-shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 backdrop-blur-xl`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground">PostaGate</h1>
        </div>
        <div className="px-4 pb-4 hidden md:block">
          <button onClick={onComposeClick} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-full shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2">
            <i className="fa-solid fa-pencil w-5 h-5"></i>
            <span>Compose</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
          <div>
            <button onClick={() => setIsInboxOpen(!isInboxOpen)} className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 text-left ${activeView === 'inbox' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-inbox w-5 h-5"></i>
                <span>All Inbox</span>
              </div>
              <div className="flex items-center space-x-2">
                 {totalUnread > 0 && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeView === 'inbox' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>{totalUnread}</span>}
                 <i className={`fa-solid fa-chevron-right w-3 h-3 transition-transform ${isInboxOpen ? 'rotate-90' : ''}`}></i>
              </div>
            </button>
            {isInboxOpen && (
              <div className="pt-1 pl-6 space-y-1 animate-fadeInDown" style={{animationDuration: '0.2s'}}>
                <DomainNavItem label="Hogwarts" domain="hogwarts" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={unreadCounts.hogwarts} />
                <DomainNavItem label="Liverpool FC" domain="liverpool" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={unreadCounts.liverpool} />
              </div>
            )}
          </div>

          <SectionHeader label="Smart Folders" />
          <NavItem icon={<i className="fa-regular fa-circle-check w-5 h-5"></i>} label="Todos" view="todos" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={2} />
          <NavItem icon={<i className="fa-regular fa-star w-5 h-5"></i>} label="Starred" view="starred" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={2} />
          <NavItem icon={<i className="fa-regular fa-clock w-5 h-5"></i>} label="Snoozed" view="snoozed" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={snoozedCount > 0 ? snoozedCount : undefined} />
          <NavItem icon={<i className="fa-regular fa-paper-plane w-5 h-5"></i>} label="All Sent" view="all-sent" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />

          <div>
              <button onClick={() => setIsHogwartsOpen(!isHogwartsOpen)} className="w-full flex items-center justify-between px-3 pt-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-left hover:text-accent-foreground">
                  <span>Hogwarts</span>
                  <i className={`fa-solid fa-chevron-right w-3 h-3 transition-transform ${isHogwartsOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {isHogwartsOpen && (
                  <div className="pl-3 space-y-1 animate-fadeInDown" style={{animationDuration: '0.2s'}}>
                      <NavItem icon={<i className="fa-regular fa-paper-plane w-5 h-5"></i>} label="Sent" view="sent" domain="hogwarts" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <NavItem icon={<i className="fa-regular fa-file-lines w-5 h-5"></i>} label="Drafts" view="drafts" domain="hogwarts" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <NavItem icon={<i className="fa-solid fa-archive w-5 h-5"></i>} label="Archive" view="archive" domain="hogwarts" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <div>
                          <button onClick={() => setIsHogwartsLabelsOpen(!isHogwartsLabelsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                              <div className="flex items-center space-x-3">
                                <i className="fa-solid fa-tag w-5 h-5"></i>
                                <span>Labels</span>
                              </div>
                              <i className={`fa-solid fa-chevron-right w-3 h-3 transition-transform ${isHogwartsLabelsOpen ? 'rotate-90' : ''}`}></i>
                          </button>
                          {isHogwartsLabelsOpen && (
                              <div className="pt-1 pl-6 space-y-1 animate-fadeInDown" style={{animationDuration: '0.2s'}}>
                                  <LabelItem label="Gryffindor" />
                                  <LabelItem label="Order of the Phoenix" />
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
          
          <div>
              <button onClick={() => setIsLiverpoolOpen(!isLiverpoolOpen)} className="w-full flex items-center justify-between px-3 pt-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-left hover:text-accent-foreground">
                  <span>Liverpool FC</span>
                  <i className={`fa-solid fa-chevron-right w-3 h-3 transition-transform ${isLiverpoolOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {isLiverpoolOpen && (
                  <div className="pl-3 space-y-1 animate-fadeInDown" style={{animationDuration: '0.2s'}}>
                      <NavItem icon={<i className="fa-regular fa-paper-plane w-5 h-5"></i>} label="Sent" view="sent" domain="liverpool" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <NavItem icon={<i className="fa-regular fa-file-lines w-5 h-5"></i>} label="Drafts" view="drafts" domain="liverpool" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <NavItem icon={<i className="fa-solid fa-archive w-5 h-5"></i>} label="Archive" view="archive" domain="liverpool" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} />
                      <div>
                          <button onClick={() => setIsLiverpoolLabelsOpen(!isLiverpoolLabelsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                              <div className="flex items-center space-x-3">
                                <i className="fa-solid fa-tag w-5 h-5"></i>
                                <span>Labels</span>
                              </div>
                              <i className={`fa-solid fa-chevron-right w-3 h-3 transition-transform ${isLiverpoolLabelsOpen ? 'rotate-90' : ''}`}></i>
                          </button>
                          {isLiverpoolLabelsOpen && (
                              <div className="pt-1 pl-6 space-y-1 animate-fadeInDown" style={{animationDuration: '0.2s'}}>
                                  <LabelItem label="Transfers" />
                                  <LabelItem label="Sponsorship" />
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>


          <SectionHeader label="Bundles" />
          <NavItem icon={<span className="text-lg w-5 h-5 text-center">💰</span>} label="Finance" view="finance" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={4} />
          <NavItem icon={<span className="text-lg w-5 h-5 text-center">👍</span>} label="Feedback" view="feedback" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={5} />
          <NavItem icon={<span className="text-lg w-5 h-5 text-center">✈️</span>} label="Travel" view="travel" activeView={activeView} activeDomain={activeDomain} onNavigate={onNavigate} count={2} />
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;