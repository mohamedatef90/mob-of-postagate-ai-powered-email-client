import React, { useState, useContext, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AppContext } from './context/AppContext';
// FIX: Resolved file casing ambiguity by using a consistent lowercase import path.
import { ArrowLeftIcon, PlusIcon, ExchangeIcon, InboxArrowDownIcon, FolderOpenIcon, TrashIcon, CheckIcon, ChevronUpIcon, CheckVIcon, CheckThinIcon, ArrowDownTrayIcon, CalendarDaysIcon, UserIcon, MapPinIcon, CameraIcon, BellIcon, MusicalNoteIcon, InformationCircleIcon, SearchIcon, QuestionMarkCircleIcon, ChatBubbleLeftIcon, HeadphonesIcon, UsersIcon, PaperAirplaneIcon, PinIcon, ClockIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, EllipsisVerticalIcon, MoveIcon, StarIcon, ExclamationTriangleIcon, EnvelopeXMarkIcon, BackspaceIcon, XMarkIcon, ChevronRightIcon } from './icons.tsx';
import { IconButton } from './ui/IconButton';
import { OutOfOfficeModal } from './OutOfOfficeModal';
import { AddAccountScreen } from './AddAccountScreen';
import { ManageFoldersScreen } from './ManageFoldersScreen';
import { SwipeActionsScreen, SwipeActionItem } from './SwipeActionsScreen';
import { EditSwipeActionScreen, ALL_SWIPE_ACTIONS } from './EditSwipeActionScreen';
import { AppProgressScreen } from './AppProgressScreen';
import { SignatureModal } from './SignatureModal';

interface SettingsViewMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Local UI Components for Settings ---
const usePopupPosition = (
  isOpen: boolean,
  targetRef: React.RefObject<HTMLElement>,
  popupRef: React.RefObject<HTMLElement>
) => {
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useEffect(() => {
    if (isOpen && targetRef.current && popupRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;

      let top = rect.top + (rect.height / 2) - (popupHeight / 2);
      let left = rect.right - popupWidth - 16; // 16px padding from right edge of item

      // Adjust for screen boundaries
      if (left < 16) {
        left = 16;
      }
      if (top < 16) {
        top = 16;
      }
      if (top + popupHeight > window.innerHeight - 16) {
        top = window.innerHeight - popupHeight - 16;
      }

      setPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
      });
    }
  }, [isOpen, targetRef, popupRef]);

  return position;
};


const CALENDAR_SYNC_OPTIONS = ['2 weeks', '1 month', '3 months', '6 months', 'Always stay synced'];
const SYNC_CONFLICT_OPTIONS = ['Prioritise device', 'Prioritise server'];
const CC_BCC_OPTIONS = ['None', 'Cc', 'Bcc'];


const SettingsDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, dropdownRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-xl shadow-xl p-2 w-60 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => onSelect(option)}
              className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-accent"
            >
              <span className={`${selectedValue === option ? 'text-primary font-medium' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};


// --- New component for the specific popup style in Security Options ---
const SecurityOptionsPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, popupRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 w-48 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-accent text-base"
            >
              <span className={`${selectedValue === option ? 'text-primary font-semibold' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                 <ChevronUpIcon className="h-5 w-5 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

// --- New component for the "View" options popup ---
const ViewOptionsPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, popupRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 w-48 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-accent text-base"
            >
              <span className={`${selectedValue === option ? 'text-primary font-semibold' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                 <CheckVIcon className="h-5 w-5 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

// --- New component for the "Preview Lines" options popup ---
const PreviewLinesPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, popupRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 w-48 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-accent text-base"
            >
              <span className={`${selectedValue === option ? 'text-primary font-semibold' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                 <CheckVIcon className="h-5 w-5 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

// --- New component for the "Dark mode" options popup ---
const DarkModePopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, popupRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 w-56 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-accent text-base"
            >
              <span className={`${selectedValue === option ? 'text-primary font-semibold' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                 <CheckThinIcon className="h-5 w-5 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

// --- New component for the "App icon badge counts" popup ---
const BadgeCountPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement>;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, targetRef, options, selectedValue, onSelect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const position = usePopupPosition(isOpen, targetRef, popupRef);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed z-[60] bg-popover/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 w-56 animate-scaleIn"
      style={position}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option}>
            <button
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-accent text-base"
            >
              <span className={`${selectedValue === option ? 'text-primary font-semibold' : 'text-popover-foreground'}`}>
                {option}
              </span>
              {selectedValue === option && (
                 <CheckVIcon className="h-5 w-5 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};


interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={handleToggle}
      disabled={disabled}
      className={`${
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-600'
      } relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span
        className={`${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        } pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

const SettingsSection: React.FC<{ title: string, className?: string }> = ({ title, className }) => (
  <h3 className={`px-4 pt-4 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider ${className}`}>{title}</h3>
);

const SettingsCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card rounded-xl shadow-sm border border-border ${className}`}>
        {React.Children.map(children, (child, index) => (
            <>
                {child}
                {index < React.Children.count(children) - 1 && (
                     <div className="border-t border-border mx-4"></div>
                )}
            </>
        ))}
    </div>
);

interface SettingsItemProps {
  title: string;
  description?: string;
  value?: string;
  hasToggle?: boolean;
  isToggleOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  title, description, value, hasToggle, isToggleOn, onToggle, onClick, icon, disabled = false
}) => {
  const content = (
    <>
      {icon && <div className="mr-4">{icon}</div>}
      <div className="flex-grow min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
      </div>
      {value && !description && <p className="text-sm text-muted-foreground ml-4">{value}</p>}
      {onClick && !hasToggle && <ChevronRightIcon className="h-4 w-4 text-muted-foreground ml-2" />}
      {hasToggle && onToggle && (
        <ToggleSwitch checked={!!isToggleOn} onChange={onToggle} label={title} disabled={disabled} />
      )}
    </>
  );

  const itemClasses = "flex items-center w-full text-left px-4 py-3";
  const disabledClasses = disabled ? 'opacity-50' : '';
  const finalContentClasses = `flex items-center w-full ${disabledClasses}`;

  if (onClick) {
    return (
      <button onClick={disabled ? undefined : onClick} className={`${itemClasses} active:bg-secondary`} disabled={disabled}>
        <div className={finalContentClasses}>{content}</div>
      </button>
    );
  }
  
  return (
    <div className={itemClasses}>
      <div className={finalContentClasses}>{content}</div>
    </div>
  );
};

// --- Reusable Radio Option Components ---

const RadioOption: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center px-4 py-3 text-left">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors`} style={{ borderColor: isSelected ? 'var(--tw-color-accent)' : '#adb5bd' }}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-accent" />}
        </div>
        <span className="font-medium text-on-surface">{label}</span>
    </button>
);


// --- Limit Retrieval Size Screen Component ---

const LimitRetrievalSizeScreen: React.FC<{
    title: string;
    options: string[];
    currentValue: string;
    onSelectValue: (value: string) => void;
    onBack: () => void;
}> = ({ title, options, currentValue, onSelectValue, onBack }) => {

    const handleSelect = (value: string) => {
        onSelectValue(value);
        onBack();
    };

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center truncate px-2">{title}</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8">
                <SettingsCard>
                    {options.map((option, index) => (
                        <React.Fragment key={option}>
                            <RadioOption
                                label={option}
                                isSelected={currentValue === option}
                                onClick={() => handleSelect(option)}
                            />
                            {index < options.length - 1 && <div className="border-t border-outline mx-4"></div>}
                        </React.Fragment>
                    ))}
                </SettingsCard>
            </main>
        </>
    );
};


// --- Email Sync Period Screen Component ---

const EmailSyncPeriodScreen: React.FC<{
    onBack: () => void;
    currentPeriod: string;
    onSelectPeriod: (period: string) => void;
}> = ({ onBack, currentPeriod, onSelectPeriod }) => {
    const syncPeriods = ['All time', '1 day', '3 days', '1 week', '2 weeks', '1 month'];

    const handleSelect = (period: string) => {
        onSelectPeriod(period);
        onBack();
    };

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Email sync period</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8">
                <SettingsCard>
                    {syncPeriods.map((period, index) => (
                        <React.Fragment key={period}>
                            <RadioOption
                                label={period}
                                isSelected={currentPeriod === period}
                                onClick={() => handleSelect(period)}
                            />
                            {index < syncPeriods.length - 1 && <div className="border-t border-outline mx-4"></div>}
                        </React.Fragment>
                    ))}
                </SettingsCard>
            </main>
        </>
    );
};


// --- Email Folders to Sync Screen Component ---

const EmailFoldersToSyncScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const foldersToSync = [
        { id: 'inbox', name: 'Inbox', icon: InboxArrowDownIcon },
        { id: 'drafts', name: 'Drafts', icon: FolderOpenIcon },
        { id: 'sent', name: 'Sent', icon: FolderOpenIcon },
        { id: 'spam', name: 'Spam', icon: FolderOpenIcon },
        { id: 'archive', name: 'Archive', icon: FolderOpenIcon },
        { id: 'rss', name: 'RSS Feeds', icon: FolderOpenIcon },
    ];

    const [folderSyncState, setFolderSyncState] = useState({
        inbox: true,
        drafts: true,
        sent: false,
        spam: false,
        archive: false,
        rss: false,
    });

    const handleToggle = (folderId: keyof typeof folderSyncState, newState: boolean) => {
        setFolderSyncState(prev => ({ ...prev, [folderId]: newState }));
    };

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Email folders to sync</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-4">
                <p className="text-on-surface-variant text-sm px-1">
                    Emails will appear in your inbox as soon as they're received. Other folders will be synced every 15 minutes.
                </p>
                <SettingsCard>
                    {foldersToSync.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <SettingsItem
                                title={folder.name}
                                icon={<folder.icon className="h-6 w-6 text-on-surface-variant" />}
                                hasToggle
                                isToggleOn={folderSyncState[folder.id as keyof typeof folderSyncState]}
                                onToggle={(newState) => handleToggle(folder.id as keyof typeof folderSyncState, newState)}
                            />
                            {index < foldersToSync.length - 1 && <div className="border-t border-outline mx-4"></div>}
                        </React.Fragment>
                    ))}
                </SettingsCard>
            </main>
        </>
    );
};

const SYNC_SCHEDULE_OPTIONS = [
    'Manually',
    'Using regular schedule',
];

// --- Sync Schedule Screen Component ---
const SyncScheduleScreen: React.FC<{
    onBack: () => void;
    onNavigate: (view: keyof typeof views) => void;
    syncScheduleValue: string;
}> = ({ onBack, onNavigate, syncScheduleValue }) => {
    const [peakSchedule, setPeakSchedule] = useState(false);
    const [roamingSyncSchedule, setRoamingSyncSchedule] = useState('Manually');
    const [isRoamingPopupOpen, setIsRoamingPopupOpen] = useState(false);
    const roamingSyncRef = useRef<HTMLDivElement>(null);

    const handleSelectRoamingSchedule = (value: string) => {
        setRoamingSyncSchedule(value);
        setIsRoamingPopupOpen(false);
    };

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Sync schedule</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6">
                <SettingsCard>
                    <SettingsItem title="Set sync schedule" value={syncScheduleValue} onClick={() => onNavigate('setSyncSchedule')} />
                    <div className="border-t border-outline mx-4"></div>
                    <div ref={roamingSyncRef}>
                        <SettingsItem 
                            title="Sync schedule while roaming" 
                            value={roamingSyncSchedule} 
                            onClick={() => setIsRoamingPopupOpen(true)}
                        />
                    </div>
                </SettingsCard>

                <div className="space-y-2">
                    <SettingsSection title="Peak schedule settings" />
                    <SettingsCard>
                        <SettingsItem
                            title="Peak schedule"
                            description="Set a different schedule for syncing data during working hours."
                            hasToggle
                            isToggleOn={peakSchedule}
                            onToggle={setPeakSchedule}
                        />
                    </SettingsCard>
                </div>
            </main>
            <SettingsDropdown
                isOpen={isRoamingPopupOpen}
                onClose={() => setIsRoamingPopupOpen(false)}
                targetRef={roamingSyncRef}
                options={SYNC_SCHEDULE_OPTIONS}
                selectedValue={roamingSyncSchedule}
                onSelect={handleSelectRoamingSchedule}
            />
        </>
    );
};

// --- Set Sync Schedule Screen Component ---
const SyncScheduleRadioOption: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center px-4 py-4 text-left">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'border-accent' : 'border-on-surface-variant/50'}`}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-accent" />}
        </div>
        <span className="font-medium text-on-surface text-base">{label}</span>
    </button>
);

const SetSyncScheduleScreen: React.FC<{
    onBack: () => void;
    currentSchedule: string;
    onSelectSchedule: (schedule: string) => void;
}> = ({ onBack, currentSchedule, onSelectSchedule }) => {

    const handleSelect = (schedule: string) => {
        onSelectSchedule(schedule);
        onBack();
    };

    return (
        <>
            <header className="bg-surface flex items-center p-4 shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-left ml-4">Set sync schedule</h2>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pt-0 bg-bg">
                <div className="bg-surface rounded-2xl shadow-sm">
                    {SYNC_SCHEDULE_OPTIONS.map((option, index) => (
                        <React.Fragment key={option}>
                             {index > 0 && <div className="border-t border-outline mx-4"></div>}
                            <SyncScheduleRadioOption
                                label={option}
                                isSelected={currentSchedule === option}
                                onClick={() => handleSelect(option)}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </main>
        </>
    );
};


// --- Security Options Screen ---
const SecurityOptionsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [encryptOutgoing, setEncryptOutgoing] = useState(false);
  const [signOutgoing, setSignOutgoing] = useState(false);

  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('3DES');
  const [isEncryptionAlgoOpen, setIsEncryptionAlgoOpen] = useState(false);
  const encryptionAlgoRef = useRef<HTMLDivElement>(null);
  const ENCRYPTION_ALGO_OPTIONS = ['3DES', 'DES', 'AES 128bit', 'AES 256bit'];

  const [signAlgorithm, setSignAlgorithm] = useState('SHA1');
  const [isSignAlgoOpen, setIsSignAlgoOpen] = useState(false);
  const signAlgoRef = useRef<HTMLDivElement>(null);
  const SIGN_ALGO_OPTIONS = ['SHA1', 'MD5', 'SHA256', 'SHA384', 'SHA512'];

  return (
    <>
      <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
        <IconButton label="Back" onClick={onBack} className="-ml-2">
          <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
        </IconButton>
        <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Encryption options</h2>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6">
        <div className="space-y-2">
          <SettingsSection title="Encryption options" />
          <SettingsCard>
            <SettingsItem
              title="Encrypt outgoing emails"
              description="Encrypt all outgoing emails."
              hasToggle
              isToggleOn={encryptOutgoing}
              onToggle={setEncryptOutgoing}
            />
            <div className="border-t border-outline mx-4"></div>
            <div ref={encryptionAlgoRef}>
              <SettingsItem 
                title="Encryption algorithm" 
                value={encryptionAlgorithm} 
                onClick={() => setIsEncryptionAlgoOpen(true)} 
              />
            </div>
            <div className="border-t border-outline mx-4"></div>
            <SettingsItem
              title="Sign all outgoing emails"
              description="Add a digital signature to all the emails you send."
              hasToggle
              isToggleOn={signOutgoing}
              onToggle={setSignOutgoing}
            />
            <div className="border-t border-outline mx-4"></div>
            <div ref={signAlgoRef}>
              <SettingsItem 
                title="Sign algorithm" 
                value={signAlgorithm} 
                onClick={() => setIsSignAlgoOpen(true)} 
              />
            </div>
            <div className="border-t border-outline mx-4"></div>
            <SettingsItem
              title="Encryption certificate"
              description="Select certificate for S/MIME support."
              onClick={() => alert('Select Encryption certificate')}
            />
            <div className="border-t border-outline mx-4"></div>
            <SettingsItem
              title="Signing certificate"
              description="Select certificate for S/MIME support."
              onClick={() => alert('Select Signing certificate')}
            />
            <div className="border-t border-outline mx-4"></div>
            <SettingsItem title="Security policy list" onClick={() => alert('View Security policy list')} />
          </SettingsCard>
        </div>
      </main>

      <SecurityOptionsPopup
        isOpen={isEncryptionAlgoOpen}
        onClose={() => setIsEncryptionAlgoOpen(false)}
        targetRef={encryptionAlgoRef}
        options={ENCRYPTION_ALGO_OPTIONS}
        selectedValue={encryptionAlgorithm}
        onSelect={setEncryptionAlgorithm}
      />
      <SecurityOptionsPopup
        isOpen={isSignAlgoOpen}
        onClose={() => setIsSignAlgoOpen(false)}
        targetRef={signAlgoRef}
        options={SIGN_ALGO_OPTIONS}
        selectedValue={signAlgorithm}
        onSelect={setSignAlgorithm}
      />
    </>
  );
};


// --- Exchange Server Settings Screen ---
const SettingsInputItem: React.FC<{ label: string, value: string, type?: string, noBorder?: boolean }> = ({ label, value, type, noBorder }) => (
    <div className="px-4 pt-3 pb-2">
        <p className="text-sm text-accent mb-1">{label}</p>
        {type === 'password' ? (
            <input type="password" readOnly value={value} className="w-full bg-transparent text-on-surface outline-none tracking-widest" />
        ) : (
            <p className="text-on-surface">{value}</p>
        )}
        {!noBorder && <div className="border-b border-outline mt-2"></div>}
    </div>
);

const ExchangeServerSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [useClientCertificate, setUseClientCertificate] = useState(false);

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center truncate px-2">Exchange server settings</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 flex flex-col">
                <div className="flex-grow">
                    <SettingsSection title="Account" />
                    <SettingsCard className="mt-2">
                        <SettingsInputItem label="Email address" value="o.aldaoshy@roaya.co" />
                        <SettingsInputItem label="Domain\username" value="\o.aldaoshy@roaya.co" />
                        <SettingsInputItem label="Password" value="********************" type="password" noBorder />
                    </SettingsCard>

                    <SettingsSection title="Server settings" className="mt-6" />
                    <SettingsCard className="mt-2">
                        <SettingsInputItem label="Exchange server" value="autodiscover.worldposta.com" />
                        <SettingsInputItem label="Port" value="443" />
                        <SettingsInputItem label="Security type" value="SSL/TLS (secure)" />

                        <div className="flex items-center px-4 py-4">
                            <button onClick={() => setUseClientCertificate(v => !v)} className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center shrink-0">
                                {/* Intentionally empty circle for unchecked state */}
                            </button>
                            <span className="ml-4 font-medium text-on-surface">Use client certificate</span>
                        </div>

                        <div className="px-4 pb-4">
                            <button
                                disabled={!useClientCertificate}
                                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-200 disabled:text-gray-500 bg-gray-300 text-on-surface"
                            >
                                Client certificates
                            </button>
                        </div>
                        
                        <div className="border-t border-outline"></div>

                        <SettingsInputItem label="Phone ID" value="SEC1194B17A74300" noBorder />
                    </SettingsCard>
                </div>
                
                <div className="mt-8 shrink-0">
                    <button onClick={onBack} className="w-full text-center py-3 text-lg font-semibold text-accent">
                        Done
                    </button>
                </div>
            </main>
        </>
    );
};

// --- Account Name & Color Modal ---
const AccountNameColorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  accountName: string;
  accountColor: string;
  onSave: (name: string, color: string) => void;
}> = ({ isOpen, onClose, accountName, accountColor, onSave }) => {
  const [name, setName] = useState(accountName);
  const [color, setColor] = useState(accountColor);

  useEffect(() => {
    if (isOpen) {
      setName(accountName);
      setColor(accountColor);
    }
  }, [isOpen, accountName, accountColor]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name, color);
    onClose();
  };

  const paletteColors = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f9a825', label: 'Yellow' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#9333ea', label: 'Purple' },
    { value: '#1e293b', label: 'Slate' },
  ];
  const customSwatch = { value: '#f97316', label: 'Custom' };
  const allColors = [...paletteColors, customSwatch];
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-xs flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-on-surface mb-6">Account name and colour</h2>
          
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-accent focus:border-accent outline-none pb-2 text-on-surface"
          />

          <div className="mt-8">
            <div className="flex items-center justify-start mb-3">
                <div className="grid grid-cols-3 gap-0.5 w-5 h-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#fb923c'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#60a5fa'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#f87171'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#f87171'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#facc15'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#fb923c'}}></div>
                </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between h-9 rounded-full overflow-hidden">
                {allColors.map((c, index) => (
                  <button
                    key={index}
                    onClick={() => setColor(c.value)}
                    className="w-full h-full relative flex items-center justify-center"
                    aria-label={`Select color ${c.label}`}
                    style={{
                      background: c.label === 'Custom' ? 'linear-gradient(45deg, #f59e0b, #ef4444, #d946ef)' : c.value
                    }}
                  >
                    {color === c.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center"
                          style={{
                            background: c.label === 'Custom' ? 'linear-gradient(45deg, #f59e0b, #ef4444, #d946ef)' : c.value
                          }}
                        >
                          <CheckIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="w-full flex justify-center mt-3 relative">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-4">
          <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-on-surface/10">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-on-surface/10">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


// --- Account Settings Screen Component ---

const AccountSettingsScreen: React.FC<{ 
    onBack: () => void; 
    onNavigate: (view: keyof typeof views) => void;
    emailSyncPeriod: string;
    retrievalSize: string;
    roamingRetrievalSize: string;
    calendarSyncPeriod: string;
    onSelectCalendarPeriod: (period: string) => void;
    accountName: string;
    accountColor: string;
    onOpenAccountModal: () => void;
    onOpenOutOfOfficeModal: () => void;
    onEmptyRecycleBin: () => void;
    signature: string;
    onOpenSignatureModal: () => void;
    isSignatureEnabled: boolean;
    onToggleSignature: (enabled: boolean) => void;
    syncScheduleValue: string;
}> = ({ 
    onBack, onNavigate, emailSyncPeriod, retrievalSize, roamingRetrievalSize, 
    calendarSyncPeriod, onSelectCalendarPeriod, accountName, accountColor, onOpenAccountModal,
    onOpenOutOfOfficeModal, onEmptyRecycleBin, signature, onOpenSignatureModal,
    isSignatureEnabled, onToggleSignature, syncScheduleValue
}) => {
  const { accounts } = useContext(AppContext);
  const currentAccount = accounts[0];

  const [syncEmails, setSyncEmails] = useState(true);
  const [syncCalendars, setSyncCalendars] = useState(false);
  const [syncTasks, setSyncTasks] = useState(false);
  const [syncContacts, setSyncContacts] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  
  const [isCalendarPeriodOpen, setIsCalendarPeriodOpen] = useState(false);
  const calendarPeriodRef = useRef<HTMLDivElement>(null);

  const [isSyncConflictOpen, setIsSyncConflictOpen] = useState(false);
  const [syncConflictResolution, setSyncConflictResolution] = useState('Prioritise server');
  const syncConflictRef = useRef<HTMLDivElement>(null);

  const [isCcBccOpen, setIsCcBccOpen] = useState(false);
  const [alwaysCcBcc, setAlwaysCcBcc] = useState('None');
  const ccBccRef = useRef<HTMLDivElement>(null);


  return (
    <>
      <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
        <IconButton label="Back" onClick={onBack} className="-ml-2">
          <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
        </IconButton>
        <h2 className="text-lg font-bold text-on-surface flex-grow text-center truncate px-2">{currentAccount.email}</h2>
        <button className="text-on-surface font-semibold text-base px-2">Remove</button>
      </header>
      <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6">
        <div className="space-y-2">
            <SettingsSection title="Sync settings" />
            <SettingsCard>
                <SettingsItem title="Sync emails" description="Last synced on 14/10/2025 16:39" hasToggle isToggleOn={syncEmails} onToggle={setSyncEmails} />
                <SettingsItem title="Sync calendars" description="Off" hasToggle isToggleOn={syncCalendars} onToggle={setSyncCalendars} />
                <SettingsItem title="Sync tasks" description="Off" hasToggle isToggleOn={syncTasks} onToggle={setSyncTasks} />
                <SettingsItem title="Sync contacts" description="Off" hasToggle isToggleOn={syncContacts} onToggle={setSyncContacts} />
            </SettingsCard>
        </div>
        <SettingsCard>
            <SettingsItem title="Email sync schedule" value={syncScheduleValue} onClick={() => onNavigate('syncSchedule')} />
            <SettingsItem title="Email folders to sync" onClick={() => onNavigate('emailFoldersToSync')} />
            <SettingsItem title="Email sync period" value={emailSyncPeriod} onClick={() => onNavigate('emailSyncPeriod')} />
            <SettingsItem title="Limit retrieval size" value={retrievalSize} onClick={() => onNavigate('limitRetrievalSize')} />
            <SettingsItem title="Limit retrieval size while roaming" value={roamingRetrievalSize} onClick={() => onNavigate('roamingLimitRetrievalSize')} />
        </SettingsCard>
        <SettingsCard>
             <div ref={calendarPeriodRef}>
                <SettingsItem 
                    title="Calendar sync period" 
                    value={calendarSyncPeriod}
                    onClick={() => setIsCalendarPeriodOpen(p => !p)}
                />
            </div>
            <div ref={syncConflictRef}>
                <SettingsItem 
                    title="In case of sync conflict" 
                    value={syncConflictResolution} 
                    onClick={() => setIsSyncConflictOpen(p => !p)}
                />
            </div>
        </SettingsCard>
        <SettingsDropdown
            isOpen={isCalendarPeriodOpen}
            onClose={() => setIsCalendarPeriodOpen(false)}
            targetRef={calendarPeriodRef}
            options={CALENDAR_SYNC_OPTIONS}
            selectedValue={calendarSyncPeriod}
            onSelect={(value) => {
                onSelectCalendarPeriod(value);
                setIsCalendarPeriodOpen(false);
            }}
        />
        <SettingsDropdown
            isOpen={isSyncConflictOpen}
            onClose={() => setIsSyncConflictOpen(false)}
            targetRef={syncConflictRef}
            options={SYNC_CONFLICT_OPTIONS}
            selectedValue={syncConflictResolution}
            onSelect={(value) => {
                setSyncConflictResolution(value);
                setIsSyncConflictOpen(false);
            }}
        />
        <SettingsDropdown
            isOpen={isCcBccOpen}
            onClose={() => setIsCcBccOpen(false)}
            targetRef={ccBccRef}
            options={CC_BCC_OPTIONS}
            selectedValue={alwaysCcBcc}
            onSelect={(value) => {
                setAlwaysCcBcc(value);
                setIsCcBccOpen(false);
            }}
        />

        <div className="space-y-2">
            <SettingsSection title="Account settings" />
            <SettingsCard>
                <SettingsItem 
                    title="Account name and colour" 
                    description={accountName}
                    icon={<div className="w-5 h-5 rounded-full" style={{ backgroundColor: accountColor, borderColor: accountColor, borderWidth: 2, boxShadow: `0 0 0 1px ${accountColor}` }} />}
                    onClick={onOpenAccountModal}
                />
                <div ref={ccBccRef}>
                  <SettingsItem title="Always Cc/Bcc myself" value={alwaysCcBcc} onClick={() => setIsCcBccOpen(p => !p)} />
                </div>
                <div className="flex items-center w-full px-4 py-3">
                    <button onClick={onOpenSignatureModal} className="flex-grow text-left disabled:opacity-50" disabled={!isSignatureEnabled}>
                        <p className="font-medium text-on-surface">Signature</p>
                        <p className="text-sm text-on-surface-variant">{isSignatureEnabled ? (signature || 'Not set') : 'Off'}</p>
                    </button>
                    <ToggleSwitch checked={isSignatureEnabled} onChange={onToggleSignature} label="Enable signature" />
                </div>
                <SettingsItem title="Show images" description="Show all images in emails." hasToggle isToggleOn={showImages} onToggle={setShowImages} />
                <SettingsItem title="Auto download attachments" description="Automatically download attachments when connected to a Wi-Fi network." hasToggle isToggleOn={autoDownload} onToggle={setAutoDownload} />
                <SettingsItem title="Out of office reply" onClick={onOpenOutOfOfficeModal} />
                <SettingsItem title="Empty Recycle bin" onClick={onEmptyRecycleBin} />
            </SettingsCard>
        </div>
        <div className="space-y-2">
            <SettingsSection title="Advanced settings" />
            <SettingsCard>
                <SettingsItem title="Encryption options" onClick={() => onNavigate('securityOptions')} />
                <SettingsItem title="Exchange server settings" onClick={() => onNavigate('exchangeServerSettings')} />
            </SettingsCard>
        </div>
      </main>
    </>
  );
};


// --- New: Translator Screen Component ---
const LANGUAGES = [
    'Arabic', 'Bulgarian', 'Bangla', 'Czech', 'Danish', 'German',
    'Spanish', 'Spanish (Mexico)', 'Spanish (United States)', 'Persian'
];

const TranslatorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Translator</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-4">
                <p className="px-4 text-on-surface-variant">Download the languages you want to translate to or from.</p>
                <div className="space-y-2">
                    <SettingsSection title="Available languages" />
                    <SettingsCard>
                        {LANGUAGES.map((lang, index) => (
                            <React.Fragment key={lang}>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <p className="font-medium text-on-surface">{lang}</p>
                                    <IconButton label={`Download ${lang}`} onClick={() => alert(`Downloading ${lang}...`)}>
                                        <ArrowDownTrayIcon className="h-6 w-6 text-on-surface-variant" />
                                    </IconButton>
                                </div>
                                {index < LANGUAGES.length - 1 && <div className="border-t border-outline mx-4"></div>}
                            </React.Fragment>
                        ))}
                    </SettingsCard>
                </div>
            </main>
        </>
    );
};

// --- New: Permissions Screen Component ---
const PERMISSIONS = [
    { icon: CalendarDaysIcon, title: 'Calendar', description: 'Used to view, edit, and sync events' },
    { icon: UserIcon, title: 'Contacts', description: 'Used to send emails to your contacts and create new contacts based on emails you receive' },
    { icon: MapPinIcon, title: 'Location', description: 'Used to let you attach your current location to emails' },
    { icon: CameraIcon, title: 'Camera', description: 'Used to attach pictures to email' },
    { icon: BellIcon, title: 'Notifications', description: 'Used to notify you about new emails' },
    { icon: MusicalNoteIcon, title: 'Music and audio', description: 'Used to attach audio files, voice notes, music, and other audio content to emails' },
    { icon: null, title: 'Device admin', description: 'Used to allow admin control of your phone' },
    { icon: null, title: 'Appear on top', description: 'Used to show progress when downloading attachments' },
];

const PermissionItem: React.FC<{ icon: React.ElementType | null; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start p-4">
        {Icon ? <Icon className="h-6 w-6 text-on-surface-variant mt-1 mr-4 shrink-0" /> : <div className="w-6 mr-4 shrink-0" />}
        <div>
            <p className="font-medium text-on-surface">{title}</p>
            <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
    </div>
);

const PermissionsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Permissions</h2>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8">
                 <SettingsSection title="Optional permissions" />
                 <SettingsCard className="mt-2">
                    {PERMISSIONS.map((perm, index) => (
                        <React.Fragment key={perm.title}>
                           <PermissionItem icon={perm.icon} title={perm.title} description={perm.description} />
                           {index < PERMISSIONS.length - 1 && <div className="border-t border-outline mx-4"></div>}
                        </React.Fragment>
                    ))}
                 </SettingsCard>
            </main>
        </>
    );
};

// --- New: About Email Screen Component ---
const AboutEmailScreen: React.FC<{ onBack: () => void; onNavigate: (view: keyof typeof views) => void; }> = ({ onBack, onNavigate }) => {
    return (
        <>
            <header className="bg-surface flex items-center p-4 shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <div className="flex-grow"></div> {/* Spacer */}
                <IconButton label="Information">
                    <InformationCircleIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 flex flex-col items-center justify-center text-center">
                <div className="flex-grow flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold text-on-surface mb-2">Email</h1>
                    <p className="text-on-surface-variant">Version 6.2.05.10</p>
                    <p className="text-on-surface-variant">The latest version is already installed.</p>
                </div>
                <button 
                    onClick={() => onNavigate('openSourceLicences')}
                    className="w-full max-w-xs bg-primary-container dark:bg-gray-700 text-on-surface font-semibold py-3 rounded-full mt-8"
                >
                    Open source licences
                </button>
            </main>
        </>
    );
};

// --- New: Open Source Licences Screen Component ---
const OpenSourceLicencesScreen: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center truncate pr-8">Open source licences</h2>
            </header>
            <main className="flex-grow overflow-y-auto p-4 text-on-surface text-sm space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Open Source Announcement</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                        Some software components of this product incorporate source code include the following Open Source License(s).<br/>
                        Apache License Version 2.0<br/>
                        BSD License<br/>
                        GNU General Public License v2.0 w/Classpath exception<br/>
                        MIT/X11 Style License<br/>
                        Mozilla public License 2.0<br/>
                        Open SSL/SSLeay License
                    </p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                    To obtain the source code covered under licenses which have the obligation of publishing source code, please visit http://opensource.samsung.com and search by Library name. A complete corresponding source code may be obtained for a period of three years after our last shipment of this product by visiting our website. If you'd like to obtain a complete corresponding source code for the physical medium such as CD-ROM, the cost of physically performing source distribution may be charged. This offer is valid to anyone in receipt of this information.
                </p>
                <div>
                    <h4 className="font-semibold mb-1">Apache License</h4>
                    <p className="text-xs text-on-surface-variant">
                        Version 2.0, January 2004<br/>
                        http://www.apache.org/licenses/
                    </p>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION</h5>
                    <p className="text-xs text-on-surface-variant mb-2">1. Definitions.</p>
                    <div className="text-xs text-on-surface-variant leading-relaxed space-y-3">
                        <p>"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.</p>
                        <p>"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.</p>
                        <p>"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.</p>
                        <p>"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.</p>
                        <p>"Source" form shall mean the preferred form for making modifications, including but not to software source code, documentation source, and configuration files.</p>
                        <p>"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not to compiled object code, generated documentation, and conversions to other media types.</p>
                        <p>"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).</p>
                        <p>"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.</p>
                        <p>"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."</p>
                        <p>"Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.</p>
                    </div>
                </div>
            </main>
        </>
    );
};

// --- New: Contact Us Screen Component ---
const HELP_ITEMS = [
    { icon: QuestionMarkCircleIcon, title: 'FAQ' },
    { icon: PaperAirplaneIcon, title: 'Send feedback' },
    { icon: UsersIcon, title: 'Community' },
];

const ContactUsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const HelpItem: React.FC<{ icon: React.ElementType, title: string }> = ({ icon: Icon, title }) => (
        <button className="flex items-center w-full px-4 py-3 text-left">
            <Icon className="h-6 w-6 text-on-surface-variant mr-4" />
            <span className="font-medium text-on-surface">{title}</span>
        </button>
    );

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Contact us</h2>
                <IconButton label="Search" className="mr-[-8px]">
                    <SearchIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6">
                <p className="text-on-surface-variant px-2">
                    Get useful tips and support for your phone with <a href="#" className="text-accent underline">Gemini Members</a>.
                </p>
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-on-surface px-4">Get help</h3>
                    <SettingsCard>
                        {HELP_ITEMS.map((item, index) => (
                           <React.Fragment key={item.title}>
                                <HelpItem icon={item.icon} title={item.title} />
                                {index < HELP_ITEMS.length - 1 && <div className="border-t border-outline mx-4"></div>}
                           </React.Fragment>
                        ))}
                    </SettingsCard>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-on-surface px-4">Phone diagnostics</h3>
                    <SettingsCard>
                        <button className="w-full text-left px-4 py-3 text-on-surface-variant">
                            Check if your phone's functions are working properly.
                        </button>
                    </SettingsCard>
                </div>

                <SettingsCard>
                    <div className="p-4">
                        <p className="text-on-surface-variant mb-3">
                            Get notifications that remind you to use diagnostics to make sure your phone is running smoothly.
                        </p>
                        <div className="flex justify-end space-x-6">
                            <button className="font-semibold text-on-surface">Not now</button>
                            <button className="font-semibold text-on-surface">Turn on</button>
                        </div>
                    </div>
                </SettingsCard>
            </main>
        </>
    );
};

const QuotaMeter: React.FC<{ used: number; total: number; }> = ({ used, total }) => {
    const usedPercentage = (used / total) * 100;
    return (
        <div className="space-y-2">
            <SettingsSection title="Monthly Quota" />
            <SettingsCard className="p-4">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-on-surface-variant">
                        <span className="font-bold text-on-surface text-base">{used}</span> / {total} used
                    </p>
                    <button className="text-sm font-semibold text-accent">Upgrade</button>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-2 dark:bg-zinc-700">
                    <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${usedPercentage}%` }}
                    ></div>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Resets monthly</p>
            </SettingsCard>
        </div>
    );
};


// --- New: Copilot Settings Screen Component ---
const CopilotSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [chatAssistant, setChatAssistant] = useState(true);
    const [useCopilotInbox, setUseCopilotInbox] = useState(true);
    const [excludeNewsletters, setExcludeNewsletters] = useState(true);
    const [composeReply, setComposeReply] = useState(true);
    const [summarizeEmails, setSummarizeEmails] = useState(true);
    const [helpImprove, setHelpImprove] = useState(true);
    const usedQuota = 5;
    const totalQuota = 100;

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Copilot</h2>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6 bg-bg dark:bg-zinc-900">
                <QuotaMeter used={usedQuota} total={totalQuota} />
                <SettingsCard>
                    <SettingsItem
                        title="Chat Assistant (Beta)"
                        description="Chat with your Inbox as you would with an assistant. Eg Where did I travel recently? What time is my meeting? Etc."
                        hasToggle
                        isToggleOn={chatAssistant}
                        onToggle={setChatAssistant}
                    />
                </SettingsCard>

                <div className="space-y-2">
                    <SettingsCard>
                         <SettingsItem
                            title="Use Copilot for Inbox"
                            hasToggle
                            isToggleOn={useCopilotInbox}
                            onToggle={setUseCopilotInbox}
                        />
                        <SettingsItem
                            title="Exclude Newsletters"
                            hasToggle
                            isToggleOn={excludeNewsletters}
                            onToggle={setExcludeNewsletters}
                        />
                    </SettingsCard>
                     <p className="text-sm text-on-surface-variant px-4">
                        Copilot for Inbox uses on-device ML models for prioritization. No data leaves your device.
                    </p>
                </div>
                
                 <SettingsCard>
                    <SettingsItem
                        title="Compose & Reply"
                        description="Use Copilot to write or reply to emails."
                        hasToggle
                        isToggleOn={composeReply}
                        onToggle={setComposeReply}
                    />
                </SettingsCard>
                
                <SettingsCard>
                    <SettingsItem
                        title="Summarize Emails"
                        description="Summarize long emails or conversations to save time."
                        hasToggle
                        isToggleOn={summarizeEmails}
                        onToggle={setSummarizeEmails}
                    />
                </SettingsCard>
                
                <div className="space-y-2">
                    <SettingsCard>
                        <SettingsItem
                            title="Help improve Copilot"
                            description="Share diagnostic data to help us improve AI features."
                            hasToggle
                            isToggleOn={helpImprove}
                            onToggle={setHelpImprove}
                        />
                    </SettingsCard>
                     <p className="text-sm text-on-surface-variant px-4">
                        Using AI features may send instructions & email content to state-of-the-art server-based language models from OpenAI, Anthropic, Cohere & others. Your data will not be used to train or improve these models
                    </p>
                </div>
            </main>
        </>
    );
};

// --- New: Notifications Screen ---

const ActionSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, title, options, selectedValue, onSelect }) => {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  const RadioOption: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center py-3 text-left">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-on-surface-variant/50'}`}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
        <span className="font-medium text-on-surface">{label}</span>
    </button>
  );

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-selection-title"
    >
        <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
                <h2 id="action-selection-title" className="text-xl font-semibold text-on-surface mb-4">{title}</h2>
                <ul className="-mx-2">
                    {options.map((option) => (
                        <li key={option}>
                            <RadioOption
                                label={option}
                                isSelected={selectedValue === option}
                                onClick={() => handleSelect(option)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end p-4 pt-0">
                 <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary hover:bg-primary/10">
                    Cancel
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
};

const NOTIFICATION_ACTION_OPTIONS = ['Mark as Read', 'Reply', 'Archive', 'Delete', 'Pin'];

const NotificationsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [actions, setActions] = useState({
    action1: 'Mark as Read',
    action2: 'Reply',
    action3: 'Archive'
  });
  const [smartNotifications, setSmartNotifications] = useState(false);
  const [sentSound, setSentSound] = useState(true);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<{key: keyof typeof actions, title: string} | null>(null);

  const openActionModal = (key: keyof typeof actions, title: string) => {
    setEditingAction({ key, title });
    setIsActionModalOpen(true);
  };

  const handleActionSelect = (value: string) => {
    if (editingAction) {
      setActions(prev => ({...prev, [editingAction.key]: value}));
    }
  };

  const SettingsInfoItem: React.FC<{title: string, value: string, description: string}> = ({title, value, description}) => (
    <div className="px-4 py-3">
        <p className="font-medium text-on-surface">{title}</p>
        <p className="text-on-surface-variant mt-1">{value}</p>
        <p className="text-sm text-on-surface-variant mt-2">{description}</p>
    </div>
  );

  const SettingsActionItem: React.FC<{title: string, value: string, onClick: () => void}> = ({title, value, onClick}) => (
    <button onClick={onClick} className="w-full flex justify-between items-center text-left px-4 py-3">
        <p className="font-medium text-on-surface">{title}</p>
        <p className="text-on-surface-variant">{value}</p>
    </button>
  );

  return (
    <>
      <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
        <IconButton label="Back" onClick={onBack} className="-ml-2">
          <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
        </IconButton>
        <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Notifications</h2>
      </header>
      <main className="flex-grow overflow-y-auto pt-2 pb-8 space-y-6 bg-surface-alt dark:bg-zinc-900">
        <div className="mt-2">
          <SettingsSection title="Notifications Options" />
          <SettingsCard className="mt-2">
            <SettingsInfoItem 
              title="Notifications Type" 
              value="Push" 
              description="Push notifications are faster and more reliable, but leverage a server component. Fetch notifications are implemented on device and offer greater security, but are slower and less reliable."
            />
          </SettingsCard>
        </div>
        <div>
          <SettingsSection title="Notification Action" />
          <SettingsCard className="mt-2">
            <SettingsActionItem title="Action 1" value={actions.action1} onClick={() => openActionModal('action1', 'Action 1')} />
            <SettingsActionItem title="Action 2" value={actions.action2} onClick={() => openActionModal('action2', 'Action 2')} />
            <SettingsActionItem title="Action 3" value={actions.action3} onClick={() => openActionModal('action3', 'Action 3')} />
          </SettingsCard>
        </div>

        <SettingsCard>
          <SettingsItem
            title="Smart Notifications"
            description="Only receive notifications for important emails."
            hasToggle
            isToggleOn={smartNotifications}
            onToggle={setSmartNotifications}
          />
        </SettingsCard>
        
        <SettingsCard>
            <SettingsItem 
                title="Sent Sound"
                hasToggle
                isToggleOn={sentSound}
                onToggle={setSentSound}
            />
        </SettingsCard>

      </main>

      <ActionSelectionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={editingAction?.title || ''}
        options={NOTIFICATION_ACTION_OPTIONS}
        selectedValue={editingAction ? actions[editingAction.key] : ''}
        onSelect={handleActionSelect}
      />
    </>
  );
};

// --- New: Thread Actions Screen ---

const THREAD_ACTION_OPTIONS = ['Reply', 'Snooze', 'Archive', 'Delete', 'Move', 'Pin', 'Star', 'Spam', 'Unsubscribe'];

const THREAD_ACTION_ICONS: { [key: string]: React.ElementType } = {
    'Pin': PinIcon,
    'Snooze': ClockIcon,
    'Archive': ArchiveBoxIcon,
    'Reply': ArrowUturnLeftIcon,
    'Delete': TrashIcon,
    'Move': MoveIcon,
    'Star': StarIcon,
    'Spam': ExclamationTriangleIcon,
    'Unsubscribe': EnvelopeXMarkIcon,
};

const ThreadActionSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, title, options, selectedValue, onSelect }) => {
  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  const RadioOption: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center py-3 text-left">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-on-surface-variant/50'}`}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
        <span className="font-medium text-on-surface">{label}</span>
    </button>
  );

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="thread-action-selection-title"
    >
        <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
                <h2 id="thread-action-selection-title" className="text-xl font-semibold text-on-surface mb-4">{title}</h2>
                <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
                    {options.map((option) => (
                        <li key={option}>
                            <RadioOption
                                label={option}
                                isSelected={selectedValue === option}
                                onClick={() => handleSelect(option)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end p-4 pt-0">
                 <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary hover:bg-primary/10">
                    Cancel
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
};


interface ThreadActions {
    action1: string;
    action2: string;
    action3: string;
    action4: string;
}

interface ThreadActionsScreenProps {
    onBack: () => void;
    actions: ThreadActions;
    onOpenModal: (key: keyof ThreadActions, title: string) => void;
}

const ThreadActionsScreen: React.FC<ThreadActionsScreenProps> = ({ onBack, actions, onOpenModal }) => {
    const previewActions = [actions.action1, actions.action2, actions.action3, actions.action4];

    const SettingsValueItem: React.FC<{title: string, value: string, onClick: () => void}> = ({title, value, onClick}) => (
        <button onClick={onClick} className="w-full flex justify-between items-center text-left px-4 py-4">
            <p className="text-base text-on-surface">{title}</p>
            <p className="text-base text-primary font-medium">{value}</p>
        </button>
    );

    return (
    <>
      <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
        <IconButton label="Back" onClick={onBack} className="-ml-2">
          <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
        </IconButton>
        <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Thread Actions</h2>
      </header>
      <main className="flex-grow overflow-y-auto pt-2 pb-8 space-y-6 bg-surface-alt dark:bg-zinc-900">
        <div className="mt-2">
          <SettingsSection title="Actions" />
          <SettingsCard className="mt-2">
            <SettingsValueItem title="Action 1" value={actions.action1} onClick={() => onOpenModal('action1', 'Action 1')} />
            <SettingsValueItem title="Action 2" value={actions.action2} onClick={() => onOpenModal('action2', 'Action 2')} />
            <SettingsValueItem title="Action 3" value={actions.action3} onClick={() => onOpenModal('action3', 'Action 3')} />
            <SettingsValueItem title="Action 4" value={actions.action4} onClick={() => onOpenModal('action4', 'Action 4')} />
          </SettingsCard>
        </div>

        <div>
          <SettingsSection title="Preview" />
          <div className="mt-4 px-4 py-6 bg-surface rounded-xl flex items-center justify-around">
            {previewActions.map(actionName => {
                const Icon = THREAD_ACTION_ICONS[actionName];
                return Icon ? <Icon key={actionName} className="h-6 w-6 text-on-surface-variant" /> : <div key={actionName} className="h-6 w-6"/>;
            })}
            <EllipsisVerticalIcon className="h-6 w-6 text-on-surface-variant" />
          </div>
        </div>
      </main>
    </>
    );
};


// --- New: Customize Times Screen ---
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 font-semibold text-sm transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
        {label}
    </button>
);

const TimeSettingItem: React.FC<{
    label: string;
    value?: string;
    isEnabled: boolean;
    onToggle: () => void;
}> = ({ label, value, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between px-4 py-3.5">
        <p className="font-medium text-on-surface text-lg">{label}</p>
        <div className="flex items-center space-x-4">
            {value && <span className="text-sm text-on-surface-variant">{value}</span>}
            <ToggleSwitch checked={isEnabled} onChange={onToggle} label={`Enable ${label}`} />
        </div>
    </div>
);

const CustomizeTimesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('Snooze');
    
    // State for Snooze
    const [snoozeToggles, setSnoozeToggles] = useState({
        laterToday: true,
        tomorrow: true,
        thisWeekend: true,
        nextWeek: true,
        pickDate: true,
    });
    const handleSnoozeToggle = (key: keyof typeof snoozeToggles) => {
        setSnoozeToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // State for Secure Send
    const [secureSendToggles, setSecureSendToggles] = useState({
        laterToday: true,
        tomorrow: true,
        thisWeekend: true,
        nextWeek: true,
        pickDate: true,
    });
     const handleSecureSendToggle = (key: keyof typeof secureSendToggles) => {
        setSecureSendToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    // State for Send Later
    const [sendLaterToggles, setSendLaterToggles] = useState({
        laterToday: true,
        tomorrow: true,
        thisWeekend: true,
        nextWeek: true,
        pickDate: true,
    });
    const handleSendLaterToggle = (key: keyof typeof sendLaterToggles) => {
        setSendLaterToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const timeOptions = [
        { key: 'laterToday', label: 'Later Today', value: '+3 Hours' },
        { key: 'tomorrow', label: 'Tomorrow', value: '9:00 AM' },
        { key: 'thisWeekend', label: 'This Weekend', value: 'Saturday 9:00 AM' },
        { key: 'nextWeek', label: 'Next Week', value: 'Monday 9:00 AM' },
        { key: 'pickDate', label: 'Pick Date' },
    ];

    const renderOptionsList = (
        toggles: Record<string, boolean>, 
        onToggle: (key: string) => void
    ) => (
        <div className="py-4">
            <SettingsCard>
                {timeOptions.map((opt, index) => (
                    <React.Fragment key={opt.key}>
                        <TimeSettingItem
                            label={opt.label}
                            value={opt.value}
                            isEnabled={toggles[opt.key as keyof typeof toggles]}
                            onToggle={() => onToggle(opt.key as keyof typeof toggles)}
                        />
                        {index < timeOptions.length - 1 && <div className="border-t border-outline mx-4"></div>}
                    </React.Fragment>
                ))}
            </SettingsCard>
        </div>
    );

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Customize Times</h2>
            </header>
            <main className="flex-grow overflow-y-auto bg-surface-alt dark:bg-zinc-900">
                <div className="bg-surface border-b border-outline flex space-x-4 px-4">
                    <TabButton label="Snooze" isActive={activeTab === 'Snooze'} onClick={() => setActiveTab('Snooze')} />
                    <TabButton label="Secure Send" isActive={activeTab === 'Secure Send'} onClick={() => setActiveTab('Secure Send')} />
                    <TabButton label="Send Later" isActive={activeTab === 'Send Later'} onClick={() => setActiveTab('Send Later')} />
                </div>

                {activeTab === 'Snooze' && renderOptionsList(snoozeToggles, handleSnoozeToggle)}
                {activeTab === 'Secure Send' && renderOptionsList(secureSendToggles, handleSecureSendToggle)}
                {activeTab === 'Send Later' && renderOptionsList(sendLaterToggles, handleSendLaterToggle)}
            </main>
        </>
    );
};


// --- New: Security Screen ---
const SecurityScreen: React.FC<{ onBack: () => void; onNavigate: (view: keyof typeof views) => void }> = ({ onBack, onNavigate }) => {
    const [loadRemoteContent, setLoadRemoteContent] = useState(true);
    const [analytics, setAnalytics] = useState(true);
    const [pgpEnabled, setPgpEnabled] = useState(true);
    const [pgpEncryptDefault, setPgpEncryptDefault] = useState(true);
    const [pgpSignDefault, setPgpSignDefault] = useState(true);
    const [secureSendEnabled, setSecureSendEnabled] = useState(true);
    const [secureSendEncryptDefault, setSecureSendEncryptDefault] = useState(false);
    
    const [preferredEncryption, setPreferredEncryption] = useState('Last Used');

    return (
        <>
            <header className="bg-surface flex items-center p-4 border-b border-outline shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
                <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Security</h2>
            </header>
            <main className="flex-grow overflow-y-auto p-4 pb-8 space-y-6 bg-surface-alt dark:bg-zinc-900">
                <div className="space-y-2">
                    <SettingsSection title="General" />
                    <SettingsCard>
                        <SettingsItem 
                            title="Protect App Access" 
                            description="Secure Canary with a passcode." 
                            onClick={() => onNavigate('protectAppAccess')}
                        />
                        <SettingsItem 
                            title="Load Remote Content" 
                            hasToggle 
                            isToggleOn={loadRemoteContent} 
                            onToggle={setLoadRemoteContent} 
                        />
                        <SettingsItem 
                            title="Analytics" 
                            description="Share anonymized usage and crash data to help guide app development." 
                            hasToggle 
                            isToggleOn={analytics} 
                            onToggle={setAnalytics} 
                        />
                    </SettingsCard>
                </div>

                <div className="space-y-2">
                    <SettingsSection title="Encryption" />
                    <SettingsCard>
                        <SettingsItem 
                            title="Preferred Encryption Option" 
                            value={preferredEncryption} 
                            onClick={() => alert('Change Preferred Encryption Option')}
                        />
                    </SettingsCard>
                </div>

                <div className="space-y-2">
                    <SettingsSection title="PGP" />
                    <SettingsCard>
                        <SettingsItem 
                            title="Enabled" 
                            hasToggle 
                            isToggleOn={pgpEnabled} 
                            onToggle={setPgpEnabled} 
                        />
                        <SettingsItem 
                            title="Encrypt by Default" 
                            hasToggle 
                            isToggleOn={pgpEncryptDefault} 
                            onToggle={setPgpEncryptDefault} 
                        />
                        <SettingsItem 
                            title="Sign by Default" 
                            hasToggle 
                            isToggleOn={pgpSignDefault} 
                            onToggle={setPgpSignDefault} 
                        />
                        <SettingsItem 
                            title="Manage Keys" 
                            onClick={() => alert('Manage Keys clicked')}
                        />
                    </SettingsCard>
                </div>

                <div className="space-y-2">
                    <SettingsSection title="SecureSend" />
                    <SettingsCard>
                        <SettingsItem 
                            title="Enabled" 
                            hasToggle 
                            isToggleOn={secureSendEnabled} 
                            onToggle={setSecureSendEnabled} 
                        />
                        <SettingsItem 
                            title="Encrypt by Default" 
                            hasToggle 
                            isToggleOn={secureSendEncryptDefault} 
                            onToggle={setSecureSendEncryptDefault} 
                        />
                    </SettingsCard>
                </div>
            </main>
        </>
    );
};


// --- New: Passcode Modal ---
const PasscodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (passcode: string) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  type Stage = 'enter' | 'confirm' | 'mismatch';
  const [stage, setStage] = useState<Stage>('enter');
  const [firstPasscode, setFirstPasscode] = useState('');
  const [currentPasscode, setCurrentPasscode] = useState('');
  const mismatchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset state when modal is opened or closed
    if (isOpen) {
      setStage('enter');
      setFirstPasscode('');
      setCurrentPasscode('');
    }
    return () => {
        if (mismatchTimeoutRef.current) {
            clearTimeout(mismatchTimeoutRef.current);
        }
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentPasscode.length === 4) {
      if (stage === 'enter') {
        setFirstPasscode(currentPasscode);
        setCurrentPasscode('');
        setStage('confirm');
      } else if (stage === 'confirm') {
        if (currentPasscode === firstPasscode) {
          onSuccess(currentPasscode);
        } else {
          setStage('mismatch');
          mismatchTimeoutRef.current = window.setTimeout(() => {
            setStage('enter');
            setFirstPasscode('');
            setCurrentPasscode('');
          }, 1000);
        }
      }
    }
  }, [currentPasscode, stage, firstPasscode, onSuccess]);

  if (!isOpen) {
    return null;
  }
  
  const handleKeyClick = (key: string) => {
    if (stage === 'mismatch' || currentPasscode.length >= 4) return;
    setCurrentPasscode(currentPasscode + key);
  };

  const handleBackspace = () => {
    if (stage === 'mismatch') return;
    setCurrentPasscode(currentPasscode.slice(0, -1));
  };
  
  const getTitle = () => {
    switch(stage) {
      case 'enter': return 'Enter a new passcode';
      case 'confirm': return 'Confirm your new passcode';
      case 'mismatch': return "Passcodes don't match";
    }
  };

  const PasscodeDots: React.FC = () => (
    <div className="flex justify-center space-x-4 my-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${stage === 'mismatch' ? 'bg-error/50 animate-shake' : ''} ${i < currentPasscode.length ? 'bg-on-surface' : 'bg-outline'}`} />
      ))}
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );

  const KeypadButton: React.FC<{ value: string, onClick: (val: string) => void }> = ({ value, onClick }) => (
    <button onClick={() => onClick(value)} className="h-20 w-20 rounded-full bg-surface-alt flex items-center justify-center text-3xl font-light text-on-surface hover:bg-outline/50 transition-colors">
      {value}
    </button>
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-bg z-[60] flex flex-col">
      <header className="flex items-center justify-end p-4 shrink-0">
        <button onClick={onClose} className="font-semibold text-accent">Cancel</button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-4 pb-16">
        <h2 className={`text-xl font-medium text-on-surface transition-colors ${stage === 'mismatch' ? 'text-error' : ''}`}>{getTitle()}</h2>
        <PasscodeDots />
      </main>
      <footer className="shrink-0 grid grid-cols-3 gap-4 p-4 justify-items-center">
        {'123456789'.split('').map(key => <KeypadButton key={key} value={key} onClick={handleKeyClick} />)}
        <div /> {/* Spacer */}
        <KeypadButton value="0" onClick={handleKeyClick} />
        <button onClick={handleBackspace} className="h-20 w-20 flex items-center justify-center">
          <BackspaceIcon className="h-8 w-8 text-on-surface" />
        </button>
      </footer>
    </div>,
    document.body
  );
};

// --- New: Check Frequency Modal ---
const FREQUENCY_OPTIONS = ['Never', 'Always', 'After 15 Minutes', 'After 30 Minutes', 'After 1 Hour'];

const CheckFrequencyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSelect: (value: string) => void;
}> = ({ isOpen, onClose, currentValue, onSelect }) => {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  const RadioOption: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center py-4 text-left px-6">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-8 shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-on-surface-variant/50'}`}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
        <span className="font-medium text-on-surface text-base">{label}</span>
    </button>
  );

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="frequency-modal-title"
    >
        <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-2">
                <h2 id="frequency-modal-title" className="text-xl font-semibold text-on-surface mb-4">Check Frequency</h2>
                <ul className="-mx-6">
                    {FREQUENCY_OPTIONS.map((option) => (
                        <li key={option}>
                            <RadioOption
                                label={option}
                                isSelected={currentValue === option}
                                onClick={() => handleSelect(option)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end p-4 pt-2">
                 <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary hover:bg-primary/10">
                    Cancel
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
};


// --- New: Protect App Access Screen ---
const ProtectAppAccessScreen: React.FC<{
    onBack: () => void;
    isProtectionOn: boolean;
    onToggleProtection: (isOn: boolean) => void;
}> = ({ onBack, isProtectionOn, onToggleProtection }) => {
    const [useBiometrics, setUseBiometrics] = useState(false);
    const [checkFrequency, setCheckFrequency] = useState('Never');
    const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);

    useEffect(() => {
        // When protection is turned off externally (e.g., by parent), disable biometrics too.
        if (!isProtectionOn) {
            setUseBiometrics(false);
        }
    }, [isProtectionOn]);
    
    return (
        <>
            <header className="bg-surface flex items-center p-4 shrink-0">
                <IconButton label="Back" onClick={onBack} className="-ml-2">
                    <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
                </IconButton>
            </header>
            <main className="flex-grow overflow-y-auto px-4 py-2 pb-8 space-y-4 bg-bg dark:bg-zinc-900">
                <h1 className="text-4xl font-bold text-on-surface px-4 mb-8 mt-4">Protect App Access</h1>
                
                <div className="space-y-2">
                    <SettingsSection title="Protect App Access" />
                    <SettingsCard>
                        <SettingsItem
                            title="Protect App Access"
                            hasToggle
                            isToggleOn={isProtectionOn}
                            onToggle={onToggleProtection}
                        />
                        <SettingsItem
                            title="Use Biometrics"
                            description="Use Face ID or Touch ID to unlock"
                            hasToggle
                            isToggleOn={useBiometrics}
                            onToggle={setUseBiometrics}
                            disabled={!isProtectionOn}
                        />
                        <SettingsItem
                            title="Check Frequency"
                            description={checkFrequency}
                            onClick={isProtectionOn ? () => setIsFrequencyModalOpen(true) : undefined}
                            disabled={!isProtectionOn}
                        />
                    </SettingsCard>
                </div>
                <p className="px-4 pt-2 text-sm text-on-surface-variant">
                    You can always use a device password in case Biometric auth fails.
                </p>
            </main>
            <CheckFrequencyModal
                isOpen={isFrequencyModalOpen}
                onClose={() => setIsFrequencyModalOpen(false)}
                currentValue={checkFrequency}
                onSelect={(value) => {
                    setCheckFrequency(value);
                    setIsFrequencyModalOpen(false);
                }}
            />
        </>
    );
};

// --- Main Settings Modal Component ---

const views = {
    main: 'main',
    account: 'account',
    addAccount: 'addAccount',
    manageFolders: 'manageFolders',
    swipeActions: 'swipeActions',
    editSwipeAction: 'editSwipeAction',
    syncSchedule: 'syncSchedule',
    setSyncSchedule: 'setSyncSchedule',
    emailFoldersToSync: 'emailFoldersToSync',
    emailSyncPeriod: 'emailSyncPeriod',
    limitRetrievalSize: 'limitRetrievalSize',
    roamingLimitRetrievalSize: 'roamingLimitRetrievalSize',
    securityOptions: 'securityOptions',
    exchangeServerSettings: 'exchangeServerSettings',
    translator: 'translator',
    permissions: 'permissions',
    aboutEmail: 'aboutEmail',
    openSourceLicences: 'openSourceLicences',
    contactUs: 'contactUs',
    appProgress: 'appProgress',
    copilot: 'copilot',
    notifications: 'notifications',
    threadActions: 'threadActions',
    customizeTimes: 'customizeTimes',
    security: 'security',
    protectAppAccess: 'protectAppAccess',
};

const RETRIEVAL_SIZE_OPTIONS = ['Headers only', '0.5 KB', '1 KB', '2 KB', '5 KB', '10 KB', '20 KB', '50 KB', '100 KB', 'No limit'];
const ROAMING_RETRIEVAL_SIZE_OPTIONS = ['Use retrieval size setting', ...RETRIEVAL_SIZE_OPTIONS];

interface SearchableSetting {
    id: string;
    title: string;
    path: string[];
    keywords?: string[];
    onClick: () => void;
}

const SearchResultItem: React.FC<{ item: SearchableSetting }> = ({ item }) => {
    return (
        <button onClick={item.onClick} className="w-full text-left px-4 py-3 hover:bg-surface-alt">
            <p className="font-medium text-on-surface">{item.title}</p>
            <p className="text-sm text-on-surface-variant">{item.path.join(' > ')}</p>
        </button>
    );
};

export const SettingsViewMobile: React.FC<SettingsViewMobileProps> = ({ isOpen, onClose }) => {
  const { accounts, darkModeOption, setDarkModeOption, initialSettingsView, setInitialSettingsView } = useContext(AppContext);
  const currentAccount = accounts[0];
  const [view, setView] = useState<keyof typeof views>('main');
  const [emailSyncPeriod, setEmailSyncPeriod] = useState('1 month');
  const [retrievalSize, setRetrievalSize] = useState('No limit');
  const [roamingRetrievalSize, setRoamingRetrievalSize] = useState('2 KB');
  const [calendarSyncPeriod, setCalendarSyncPeriod] = useState('6 months');
  const [syncScheduleValue, setSyncScheduleValue] = useState('Auto (when received)');
  
  const [accountName, setAccountName] = useState(currentAccount.email);
  const [accountColor, setAccountColor] = useState('#f97316'); // Matching screenshot's selected color
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isOutOfOfficeOpen, setIsOutOfOfficeOpen] = useState(false);
  const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
  const [signature, setSignature] = useState('Sent from my Galaxy');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSignatureEnabled, setIsSignatureEnabled] = useState(true);

  // Swipe actions state
  const [swipeLeftActions, setSwipeLeftActions] = useState<SwipeActionItem[]>([{ id: 'delete', name: 'Delete' }]);
  const [swipeRightActions, setSwipeRightActions] = useState<SwipeActionItem[]>([
    { id: 'move', name: 'Move' },
    { id: 'snooze', name: 'Snooze' },
    { id: 'unread', name: 'Unread' },
    { id: 'reply', name: 'Reply' },
  ]);
  const [editingSwipeDirection, setEditingSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Thread actions state
  interface ThreadActions {
      action1: string;
      action2: string;
      action3: string;
      action4: string;
  }
  const [threadActions, setThreadActions] = useState({
      action1: 'Pin',
      action2: 'Snooze',
      action3: 'Archive',
      action4: 'Reply',
  });
  const [isThreadActionModalOpen, setIsThreadActionModalOpen] = useState(false);
  const [editingThreadAction, setEditingThreadAction] = useState<{key: keyof typeof threadActions, title: string} | null>(null);


  const [autoFitContent, setAutoFitContent] = useState(true);
  const [splitView, setSplitView] = useState(true);

  // State for the "View" popup
  const [viewMode, setViewMode] = useState('Standard');
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const viewItemRef = useRef<HTMLDivElement>(null);
  
  const [isDarkModePopupOpen, setIsDarkModePopupOpen] = useState(false);
  const darkModeItemRef = useRef<HTMLDivElement>(null);

  const [previewLines, setPreviewLines] = useState('2 lines');
  const [isPreviewLinesPopupOpen, setIsPreviewLinesPopupOpen] = useState(false);
  const previewLinesItemRef = useRef<HTMLDivElement>(null);

  // State for the "App icon badge counts" popup
  const [badgeCountOption, setBadgeCountOption] = useState('New emails');
  const [isBadgeCountPopupOpen, setIsBadgeCountPopupOpen] = useState(false);
  const badgeCountItemRef = useRef<HTMLDivElement>(null);
  
  // State for app protection
  const [passcode, setPasscode] = useState<string | null>(null);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
        setView(initialSettingsView as keyof typeof views || 'main');
    } else {
        setSearchQuery(''); // Clear search on close
    }
  }, [isOpen, initialSettingsView]);
  
  const searchableSettings: SearchableSetting[] = React.useMemo(() => {
    const accountPath = ['Accounts', currentAccount.email];
    return [
    // Main Settings
    { id: 'account', title: currentAccount.email, path: ['Accounts'], keywords: ['sync', 'signature', 'folders', 'server', 'exchange', 'settings', 'remove', 'delete'], onClick: () => setView('account') },
    { id: 'addAccount', title: 'Add account', path: ['Accounts'], keywords: ['new', 'email', 'user'], onClick: () => setView('addAccount') },
    { id: 'manageFolders', title: 'Manage folders', path: ['General'], keywords: ['reorder', 'show', 'hide', 'labels'], onClick: () => setView('manageFolders') },
    { id: 'copilot', title: 'Copilot', path: ['General'], keywords: ['ai', 'assistant', 'gemini', 'chat', 'summarize'], onClick: () => setView('copilot') },
    { id: 'viewMode', title: 'View', path: ['General'], keywords: ['conversation', 'standard', 'layout'], onClick: () => setIsViewPopupOpen(true) },
    { id: 'darkMode', title: 'Dark mode', path: ['General'], keywords: ['theme', 'night', 'appearance', 'background'], onClick: () => setIsDarkModePopupOpen(true) },
    { id: 'previewLines', title: 'Preview Lines', path: ['General'], keywords: ['snippet', 'list', 'summary'], onClick: () => setIsPreviewLinesPopupOpen(true) },
    { id: 'swipeActions', title: 'Swipe actions', path: ['General'], keywords: ['gesture', 'left', 'right', 'delete', 'archive'], onClick: () => setView('swipeActions') },
    { id: 'threadActions', title: 'Thread Actions', path: ['General'], keywords: ['conversation', 'buttons', 'quick'], onClick: () => setView('threadActions') },
    { id: 'customizeTimes', title: 'Customize Times', path: ['General'], keywords: ['schedule', 'snooze', 'send later'], onClick: () => setView('customizeTimes') },
    { id: 'autoFit', title: 'Auto fit content', path: ['General'], keywords: ['zoom', 'shrink', 'fit', 'screen', 'width'], onClick: () => setAutoFitContent(v => !v) },
    { id: 'notifications', title: 'Notifications', path: ['General'], keywords: ['alerts', 'sounds', 'badges', 'push'], onClick: () => setView('notifications') },
    { id: 'badgeCounts', title: 'App icon badge counts', path: ['General', 'Notifications'], keywords: ['unread', 'new', 'count'], onClick: () => setIsBadgeCountPopupOpen(true) },
    { id: 'spam', title: 'Spam addresses', path: ['General'], keywords: ['junk', 'block', 'filter'], onClick: () => alert('Spam addresses clicked') },
    { id: 'splitView', title: 'Split view', path: ['General'], keywords: ['landscape', 'tablet', 'layout', 'panes'], onClick: () => setSplitView(v => !v) },
    { id: 'translator', title: 'Translator', path: ['Privacy'], keywords: ['language', 'translate'], onClick: () => setView('translator') },
    { id: 'permissions', title: 'Permissions', path: ['Privacy'], keywords: ['privacy', 'access', 'camera', 'contacts', 'location'], onClick: () => setView('permissions') },
    { id: 'security', title: 'Security', path: ['Privacy'], keywords: ['privacy', 'encryption', 'passcode', 'pgp'], onClick: () => setView('security') },
    { id: 'about', title: 'About Email', path: [], keywords: ['version', 'info', 'update'], onClick: () => setView('aboutEmail') },
    { id: 'contact', title: 'Contact us', path: [], keywords: ['help', 'support', 'feedback', 'faq'], onClick: () => setView('contactUs') },
    // Account Settings
    { id: 'syncEmails', title: 'Sync emails', path: accountPath, keywords: ['sync'], onClick: () => setView('account') },
    { id: 'syncCalendars', title: 'Sync calendars', path: accountPath, keywords: ['sync'], onClick: () => setView('account') },
    { id: 'syncSchedule', title: 'Email sync schedule', path: accountPath, keywords: ['sync', 'time', 'schedule', 'peak'], onClick: () => setView('syncSchedule') },
    { id: 'emailFoldersToSync', title: 'Email folders to sync', path: accountPath, keywords: ['sync', 'folders'], onClick: () => setView('emailFoldersToSync') },
    { id: 'emailSyncPeriod', title: 'Email sync period', path: accountPath, keywords: ['sync', 'period', 'time'], onClick: () => setView('emailSyncPeriod') },
    { id: 'limitRetrievalSize', title: 'Limit retrieval size', path: accountPath, keywords: ['download', 'size', 'data'], onClick: () => setView('limitRetrievalSize') },
    { id: 'roamingRetrievalSize', title: 'Limit retrieval size while roaming', path: accountPath, keywords: ['download', 'size', 'data', 'roaming'], onClick: () => setView('roamingLimitRetrievalSize') },
    { id: 'accountNameAndColor', title: 'Account name and colour', path: accountPath, keywords: ['name', 'color', 'customise'], onClick: () => { setView('account'); setIsAccountModalOpen(true); } },
    { id: 'alwaysCcBcc', title: 'Always Cc/Bcc myself', path: accountPath, keywords: ['compose', 'reply', 'cc', 'bcc'], onClick: () => setView('account') },
    { id: 'signature', title: 'Signature', path: accountPath, keywords: ['sign', 'footer', 'compose'], onClick: () => { setView('account'); setIsSignatureModalOpen(true); } },
    { id: 'showImages', title: 'Show images', path: accountPath, keywords: ['display', 'pictures', 'remote content'], onClick: () => setView('account') },
    { id: 'autoDownloadAttachments', title: 'Auto download attachments', path: accountPath, keywords: ['download', 'files', 'attachments', 'wifi'], onClick: () => setView('account') },
    { id: 'outOfOffice', title: 'Out of office reply', path: accountPath, keywords: ['away', 'auto-reply', 'vacation'], onClick: () => { setView('account'); setIsOutOfOfficeOpen(true); } },
    { id: 'emptyRecycleBin', title: 'Empty Recycle bin', path: accountPath, keywords: ['trash', 'delete', 'clear'], onClick: () => { setView('account'); setShowEmptyBinConfirm(true); } },
    { id: 'encryptionOptions', title: 'Encryption options', path: [...accountPath, 'Advanced settings'], keywords: ['security', 's/mime', 'encrypt', 'sign'], onClick: () => setView('securityOptions') },
    { id: 'exchangeSettings', title: 'Exchange server settings', path: [...accountPath, 'Advanced settings'], keywords: ['server', 'exchange', 'domain', 'ssl'], onClick: () => setView('exchangeServerSettings') },
  ];
  }, [currentAccount.email, setView]);
  
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
        return [];
    }
    const lowerQuery = searchQuery.toLowerCase();
    return searchableSettings.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.path.join(' ').toLowerCase().includes(lowerQuery) ||
        item.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery, searchableSettings]);


  const handleClose = () => {
    setView('main'); // Reset view before closing
    setInitialSettingsView(null);
    setSearchQuery('');
    onClose();
  };
  
  const handleSaveAccountDetails = (name: string, color: string) => {
    setAccountName(name);
    setAccountColor(color);
  };

  const handleConfirmEmptyBin = () => {
    alert('Recycle bin has been emptied.');
    setShowEmptyBinConfirm(false);
  };
  
  const handleNavigateToEditSwipe = (direction: 'left' | 'right') => {
    setEditingSwipeDirection(direction);
    setView('editSwipeAction');
  };

  const handleSaveSwipeActions = (newActions: SwipeActionItem[]) => {
    if (editingSwipeDirection === 'left') {
      setSwipeLeftActions(newActions);
    } else if (editingSwipeDirection === 'right') {
      setSwipeRightActions(newActions);
    }
    setView('swipeActions');
    setEditingSwipeDirection(null);
  };

  const openThreadActionModal = (key: keyof typeof threadActions, title: string) => {
    setEditingThreadAction({ key, title });
    setIsThreadActionModalOpen(true);
  };

  const handleThreadActionSelect = (value: string) => {
    if (editingThreadAction) {
        setThreadActions(prev => ({...prev, [editingThreadAction.key]: value}));
    }
  };
  
  const handleToggleProtection = (isOn: boolean) => {
    if (isOn) {
      // User wants to turn it on, so open the modal to set a new passcode.
      setIsPasscodeModalOpen(true);
    } else {
      // User wants to turn it off. For this implementation, we just clear it.
      // A real app would ask for the current passcode to confirm.
      setPasscode(null);
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    switch(view) {
        case 'addAccount':
            return <AddAccountScreen onBack={() => setView('main')} />;
        case 'manageFolders':
            return <ManageFoldersScreen onBack={() => setView('main')} />;
        case 'swipeActions':
            return <SwipeActionsScreen 
                        onBack={() => setView('main')} 
                        onEdit={handleNavigateToEditSwipe}
                        leftActions={swipeLeftActions}
                        rightActions={swipeRightActions}
                    />;
        case 'editSwipeAction':
            const initialActions = editingSwipeDirection === 'left' ? swipeLeftActions : swipeRightActions;
            return <EditSwipeActionScreen 
                        direction={editingSwipeDirection!}
                        initialActions={initialActions}
                        onSave={handleSaveSwipeActions}
                        onBack={() => setView('swipeActions')}
                    />;
        case 'account':
            return <AccountSettingsScreen 
                        onBack={() => setView('main')} 
                        onNavigate={setView} 
                        emailSyncPeriod={emailSyncPeriod}
                        retrievalSize={retrievalSize}
                        roamingRetrievalSize={roamingRetrievalSize}
                        calendarSyncPeriod={calendarSyncPeriod}
                        onSelectCalendarPeriod={setCalendarSyncPeriod}
                        accountName={accountName}
                        accountColor={accountColor}
                        onOpenAccountModal={() => setIsAccountModalOpen(true)}
                        onOpenOutOfOfficeModal={() => setIsOutOfOfficeOpen(true)}
                        onEmptyRecycleBin={() => setShowEmptyBinConfirm(true)}
                        signature={signature}
                        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                        isSignatureEnabled={isSignatureEnabled}
                        onToggleSignature={setIsSignatureEnabled}
                        syncScheduleValue={syncScheduleValue}
                    />;
        case 'syncSchedule':
            return <SyncScheduleScreen
                onBack={() => setView('account')}
                onNavigate={setView}
                syncScheduleValue={syncScheduleValue}
            />;
        case 'setSyncSchedule':
            return <SetSyncScheduleScreen
                onBack={() => setView('syncSchedule')}
                currentSchedule={syncScheduleValue}
                onSelectSchedule={setSyncScheduleValue}
            />;
        case 'emailFoldersToSync':
            return <EmailFoldersToSyncScreen onBack={() => setView('account')} />;
        case 'emailSyncPeriod':
            return <EmailSyncPeriodScreen onBack={() => setView('account')} currentPeriod={emailSyncPeriod} onSelectPeriod={setEmailSyncPeriod} />;
        case 'limitRetrievalSize':
            return <LimitRetrievalSizeScreen 
                        title="Limit retrieval size" 
                        options={RETRIEVAL_SIZE_OPTIONS}
                        currentValue={retrievalSize}
                        onSelectValue={setRetrievalSize}
                        onBack={() => setView('account')} 
                    />;
        case 'roamingLimitRetrievalSize':
            return <LimitRetrievalSizeScreen 
                        title="Limit retrieval size while roami..." 
                        options={ROAMING_RETRIEVAL_SIZE_OPTIONS}
                        currentValue={roamingRetrievalSize}
                        onSelectValue={setRoamingRetrievalSize}
                        onBack={() => setView('account')} 
                    />;
        case 'securityOptions':
            return <SecurityOptionsScreen onBack={() => setView('account')} />;
        case 'exchangeServerSettings':
            return <ExchangeServerSettingsScreen onBack={() => setView('account')} />;
        case 'translator':
            return <TranslatorScreen onBack={() => setView('main')} />;
        case 'permissions':
            return <PermissionsScreen onBack={() => setView('main')} />;
        case 'security':
            return <SecurityScreen onBack={() => setView('main')} onNavigate={setView} />;
        case 'protectAppAccess':
            return <ProtectAppAccessScreen 
                        onBack={() => setView('security')} 
                        isProtectionOn={passcode !== null}
                        onToggleProtection={handleToggleProtection}
                    />;
        case 'aboutEmail':
            return <AboutEmailScreen onBack={handleClose} onNavigate={setView} />;
        case 'openSourceLicences':
            return <OpenSourceLicencesScreen onBack={() => setView('aboutEmail')} />;
        case 'contactUs':
            return <ContactUsScreen onBack={() => setView('main')} />;
        case 'appProgress':
            return <AppProgressScreen onBack={() => setView('main')} />;
        case 'copilot':
            return <CopilotSettingsScreen onBack={() => setView('main')} />;
        case 'notifications':
            return <NotificationsScreen onBack={() => setView('main')} />;
        case 'threadActions':
            return <ThreadActionsScreen 
                        onBack={() => setView('main')} 
                        actions={threadActions}
                        onOpenModal={openThreadActionModal}
                    />;
        case 'customizeTimes':
            return <CustomizeTimesScreen onBack={() => setView('main')} />;
        case 'main':
        default:
            return (
                <>
                    <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
                        <IconButton label="Close" onClick={handleClose} className="-ml-2">
                          <XMarkIcon className="h-6 w-6 text-on-surface" />
                        </IconButton>
                        <h2 className="text-xl font-bold text-on-surface flex-grow text-center">Settings</h2>
                        <div className="w-10"></div> 
                    </header>
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-on-surface-variant" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search settings"
                                className="block w-full bg-secondary border border-transparent rounded-full py-2.5 pl-10 pr-10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    aria-label="Clear search"
                                >
                                    <XMarkIcon className="h-5 w-5 text-on-surface-variant" />
                                </button>
                            )}
                        </div>
                    </div>

                    <main className={`flex-grow overflow-y-auto ${searchQuery.trim() ? '' : 'p-4 pb-8 space-y-6'}`}>
                        {searchQuery.trim() ? (
                            searchResults.length > 0 ? (
                                <div className="py-2">
                                    <SettingsCard>
                                      {searchResults.map((item, index) => (
                                          <React.Fragment key={item.id}>
                                              <SearchResultItem item={item} />
                                          </React.Fragment>
                                      ))}
                                    </SettingsCard>
                                </div>
                            ) : (
                                <div className="text-center p-10 text-on-surface-variant">
                                    No results found for "{searchQuery}"
                                </div>
                            )
                        ) : (
                            <>
                                <SettingsSection title="Accounts" />
                                <SettingsCard>
                                  <SettingsItem 
                                    title={currentAccount.name} 
                                    description={currentAccount.email} 
                                    onClick={() => setView('account')} 
                                    icon={<img src={currentAccount.avatarUrl} alt={currentAccount.name} className="w-8 h-8 rounded-full" />}
                                  />
                                  <SettingsItem 
                                    icon={<PlusIcon className="h-6 w-6 text-primary" />}
                                    title="Add account"
                                    onClick={() => setView('addAccount')}
                                  />
                                </SettingsCard>
                                
                                <SettingsSection title="General" />
                                <SettingsCard>
                                    <SettingsItem title="Manage folders" onClick={() => setView('manageFolders')} />
                                    <SettingsItem title="Copilot" onClick={() => setView('copilot')} />
                                     <div ref={viewItemRef}>
                                        <SettingsItem title="View" value={viewMode} onClick={() => setIsViewPopupOpen(true)} />
                                    </div>
                                    <div ref={darkModeItemRef}>
                                        <SettingsItem title="Dark mode" value={darkModeOption} onClick={() => setIsDarkModePopupOpen(true)} />
                                    </div>
                                     <div ref={previewLinesItemRef}>
                                        <SettingsItem title="Preview Lines" value={previewLines} onClick={() => setIsPreviewLinesPopupOpen(true)} />
                                    </div>
                                    <SettingsItem 
                                        title="Swipe actions" 
                                        onClick={() => setView('swipeActions')} 
                                    />
                                    <SettingsItem
                                        title="Thread Actions"
                                        onClick={() => setView('threadActions')}
                                    />
                                    <SettingsItem
                                        title="Customize Times"
                                        onClick={() => setView('customizeTimes')}
                                    />
                                    <SettingsItem title="Auto fit content" hasToggle isToggleOn={autoFitContent} onToggle={setAutoFitContent} />
                                    <SettingsItem title="Notifications" onClick={() => setView('notifications')} />
                                    <div ref={badgeCountItemRef}>
                                        <SettingsItem title="App icon badge counts" value={badgeCountOption} onClick={() => setIsBadgeCountPopupOpen(true)} />
                                    </div>
                                    <SettingsItem title="Spam addresses" onClick={() => alert("Navigate to Spam addresses")} />
                                    <SettingsItem title="Split view" description="Split the screen in landscape view." hasToggle isToggleOn={splitView} onToggle={setSplitView}/>
                                </SettingsCard>
        
                                <SettingsSection title="Privacy" />
                                <SettingsCard>
                                    <SettingsItem title="Translator" onClick={() => setView('translator')} />
                                    <SettingsItem title="Permissions" onClick={() => setView('permissions')} />
                                    <SettingsItem title="Security" onClick={() => setView('security')} />
                                </SettingsCard>
                                
                                <SettingsCard>
                                    <SettingsItem title="About Email" onClick={() => setView('aboutEmail')} />
                                    <SettingsItem title="Contact us" onClick={() => setView('contactUs')} />
                                </SettingsCard>
                            </>
                        )}
                    </main>
                </>
            );
    }
  };

  return (
    <>
        <div
            className={`fixed inset-0 bg-background z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            aria-modal="true"
            role="dialog"
        >
            {renderContent()}

            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                signature={signature}
                onSave={setSignature}
            />

            <AccountNameColorModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                accountName={accountName}
                accountColor={accountColor}
                onSave={handleSaveAccountDetails}
            />
            
            <ViewOptionsPopup
                isOpen={isViewPopupOpen}
                onClose={() => setIsViewPopupOpen(false)}
                targetRef={viewItemRef}
                options={['Standard', 'Conversation']}
                selectedValue={viewMode}
                onSelect={(value) => {
                    setViewMode(value);
                    setIsViewPopupOpen(false);
                }}
            />
            
            <DarkModePopup
                isOpen={isDarkModePopupOpen}
                onClose={() => setIsDarkModePopupOpen(false)}
                targetRef={darkModeItemRef}
                options={['Match phone setting', 'On', 'Off']}
                selectedValue={darkModeOption}
                onSelect={(value) => {
                    setDarkModeOption(value);
                    setIsDarkModePopupOpen(false);
                }}
            />

            <PreviewLinesPopup
                isOpen={isPreviewLinesPopupOpen}
                onClose={() => setIsPreviewLinesPopupOpen(false)}
                targetRef={previewLinesItemRef}
                options={['None', '1 line', '2 lines', '3 lines']}
                selectedValue={previewLines}
                onSelect={(value) => {
                    setPreviewLines(value);
                    setIsPreviewLinesPopupOpen(false);
                }}
            />

            <BadgeCountPopup
                isOpen={isBadgeCountPopupOpen}
                onClose={() => setIsBadgeCountPopupOpen(false)}
                targetRef={badgeCountItemRef}
                options={['New emails', 'Unread emails']}
                selectedValue={badgeCountOption}
                onSelect={(value) => {
                    setBadgeCountOption(value);
                    setIsBadgeCountPopupOpen(false);
                }}
            />

            <ThreadActionSelectionModal
                isOpen={isThreadActionModalOpen}
                onClose={() => setIsThreadActionModalOpen(false)}
                title={editingThreadAction?.title || ''}
                options={THREAD_ACTION_OPTIONS}
                selectedValue={editingThreadAction ? threadActions[editingThreadAction.key] : ''}
                onSelect={handleThreadActionSelect}
            />
        </div>

        <OutOfOfficeModal isOpen={isOutOfOfficeOpen} onClose={() => setIsOutOfOfficeOpen(false)} />
        
        {showEmptyBinConfirm && (
            <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4" onClick={() => setShowEmptyBinConfirm(false)}>
                <div className="bg-surface rounded-lg shadow-xl w-full max-w-sm p-4" onClick={e => e.stopPropagation()}>
                    <h3 className="font-semibold">Empty Recycle Bin?</h3>
                    <p className="text-sm text-on-surface-variant mt-2">All emails will be permanently deleted.</p>
                    <div className="mt-6 flex justify-end space-x-2">
                        <button onClick={() => setShowEmptyBinConfirm(false)} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-surface-alt">Cancel</button>
                        <button onClick={handleConfirmEmptyBin} className="px-4 py-2 rounded-full text-sm font-semibold text-accent hover:bg-accent/10">Empty</button>
                    </div>
                </div>
            </div>
        )}

        <PasscodeModal
            isOpen={isPasscodeModalOpen}
            onClose={() => {
                setIsPasscodeModalOpen(false);
                // If they cancel, make sure the toggle reflects the "off" state
                if (passcode === null) {
                   // This logic is handled in the ProtectAppAccessScreen, no need to call onToggleProtection here.
                }
            }}
            onSuccess={(newPasscode) => {
                setPasscode(newPasscode);
                setIsPasscodeModalOpen(false);
            }}
        />
    </>
  );
};