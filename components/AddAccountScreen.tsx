import React from 'react';
// Fix file casing issue by changing import from './Icons' to './Icons.tsx'
// FIX: Changed import to not include file extension to resolve module casing issue.
import { ArrowLeftIcon, ChevronRightIcon } from './Icons';
import { IconButton } from './ui/IconButton';

// --- Reusable UI Components for Settings ---
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
const SettingsItem: React.FC<{ title: string; onClick?: () => void; icon?: React.ReactNode; }> = ({ title, onClick, icon }) => {
  const content = (
    <>
      {icon && <div className="mr-4 w-6 text-center">{icon}</div>}
      <div className="flex-grow min-w-0">
        <p className="font-medium text-foreground">{title}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-muted-foreground ml-2" />
    </>
  );
  return (
      <button onClick={onClick} className="flex items-center w-full text-left px-4 py-3 active:bg-secondary">
        {content}
      </button>
  );
};


const providers = [
    { name: 'Google', icon: 'fa-brands fa-google' },
    { name: 'Outlook, Hotmail, and Live', icon: 'fa-brands fa-microsoft' },
    { name: 'Office 365', icon: 'fa-brands fa-windows' },
    { name: 'Yahoo', icon: 'fa-brands fa-yahoo' },
    { name: 'Exchange and other accounts', icon: 'fa-solid fa-server' },
    { name: 'Other (IMAP)', icon: 'fa-solid fa-at' },
];


export const AddAccountScreen: React.FC<{onBack: () => void}> = ({onBack}) => (
    <>
        <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
            <IconButton label="Back" onClick={onBack} className="-ml-2">
                <ArrowLeftIcon className="h-6 w-6 text-on-surface" />
            </IconButton>
            <h2 className="text-xl font-bold text-on-surface flex-grow text-center pr-8">Add Account</h2>
        </header>
        <main className="flex-grow overflow-y-auto bg-gray-100 dark:bg-black p-4">
             <SettingsCard>
                {providers.map((provider) => (
                    <SettingsItem 
                        key={provider.name} 
                        title={provider.name}
                        icon={<i className={`${provider.icon} text-xl text-muted-foreground`}></i>}
                        onClick={() => alert(`Adding ${provider.name}`)}
                    />
                ))}
            </SettingsCard>
        </main>
    </>
);