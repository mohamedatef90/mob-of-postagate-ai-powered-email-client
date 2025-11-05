import React, { useContext } from 'react';
import type { User } from '../types';
import { Button } from './ui/Button';
// FIX: Corrected import path for AppContext
import { AppContext } from './context/AppContext';

interface EmailListHeaderMobileProps {
  isBulkMode: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkMarkAsRead: () => void;
  toggleEmailSidebar: () => void;
  title: string;
  currentUser: User;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const EmailListHeaderMobile: React.FC<EmailListHeaderMobileProps> = ({
  isBulkMode,
  selectedCount,
  onClearSelection,
  onBulkArchive,
  onBulkDelete,
  onBulkMarkAsRead,
  toggleEmailSidebar,
  title,
  currentUser,
  searchQuery,
  onSearchQueryChange
}) => {
  const { setActiveModule, setInitialSettingsView } = useContext(AppContext);

  const handleAvatarClick = () => {
    if (setInitialSettingsView) {
      setInitialSettingsView('account');
    }
    if (setActiveModule) {
      setActiveModule('settings');
    }
  };

  if (isBulkMode) {
    return (
      <div className="px-2 py-3 border-b border-border flex items-center justify-between flex-shrink-0 bg-background/80 backdrop-blur-lg animate-fadeInDown" style={{ animationDuration: '0.2s' }}>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-9 w-9">
            <i className="fa-solid fa-xmark w-5 h-5"></i>
          </Button>
          <span className="font-semibold text-lg">{selectedCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={onBulkArchive} className="h-9 w-9" title="Archive"><i className="fa-solid fa-archive w-5 h-5"></i></Button>
          <Button variant="ghost" size="icon" onClick={onBulkDelete} className="h-9 w-9" title="Delete"><i className="fa-solid fa-trash w-5 h-5"></i></Button>
          <Button variant="ghost" size="icon" onClick={onBulkMarkAsRead} className="h-9 w-9" title="Mark as read"><i className="fa-regular fa-envelope-open w-5 h-5"></i></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-3 border-b border-border flex items-center justify-between flex-shrink-0 bg-background/80 backdrop-blur-lg space-x-2">
        <Button variant="ghost" size="icon" onClick={toggleEmailSidebar} className="h-10 w-10 flex-shrink-0">
          <i className="fa-solid fa-bars w-5 h-5"></i>
        </Button>
        <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"></i>
            <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full bg-secondary border-none rounded-full pl-9 pr-4 h-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
        </div>
        <button onClick={handleAvatarClick} className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
        </button>
    </div>
  );
};

export default EmailListHeaderMobile;