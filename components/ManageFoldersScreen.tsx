import React from 'react';
// Fix file casing issue by changing import from './Icons' to './Icons.tsx'
// FIX: Changed import to not include file extension to resolve module casing issue.
import { ArrowLeftIcon } from './Icons';
import { IconButton } from './ui/IconButton';

const mockFolders = [
    { id: '1', name: 'Inbox', icon: 'fa-solid fa-inbox' },
    { id: '2', name: 'Starred', icon: 'fa-solid fa-star' },
    { id: '3', name: 'Snoozed', icon: 'fa-solid fa-clock' },
    { id: '4', name: 'Sent', icon: 'fa-solid fa-paper-plane' },
    { id: '5', name: 'Drafts', icon: 'fa-solid fa-file-lines' },
    { id: '6', name: 'Archive', icon: 'fa-solid fa-archive' },
    { id: '7', name: 'Gryffindor Quidditch', icon: 'fa-solid fa-folder' },
    { id: '8', name: 'Order of the Phoenix', icon: 'fa-solid fa-folder' },
];

const FolderItem: React.FC<{ name: string; icon: string; }> = ({ name, icon }) => (
    <div className="flex items-center p-4">
        <button className="text-muted-foreground pr-4" aria-label={`Reorder ${name}`}>
            <i className="fa-solid fa-bars text-lg"></i>
        </button>
        <i className={`${icon} w-6 text-center text-muted-foreground text-lg`}></i>
        <span className="ml-4 font-medium text-foreground flex-grow">{name}</span>
    </div>
);

export const ManageFoldersScreen: React.FC<{onBack: () => void}> = ({onBack}) => (
     <>
        <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
            <IconButton label="Back" onClick={onBack} className="-ml-2">
                <ArrowLeftIcon className="h-6 w-6 text-foreground" />
            </IconButton>
            <h2 className="text-xl font-bold text-foreground flex-grow text-center pr-8">Manage Folders</h2>
        </header>
        <main className="flex-grow overflow-y-auto bg-gray-100 dark:bg-black p-4">
            <p className="px-2 pb-2 text-sm text-muted-foreground">Drag to reorder folders.</p>
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {mockFolders.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                        {index > 0 && <div className="border-t border-border" />}
                        <FolderItem name={folder.name} icon={folder.icon} />
                    </React.Fragment>
                ))}
            </div>
        </main>
    </>
);