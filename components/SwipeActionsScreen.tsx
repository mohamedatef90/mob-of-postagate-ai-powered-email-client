import React from 'react';
// FIX: Resolved file casing ambiguity by using a consistent lowercase import path.
import { ArrowLeftIcon, ChevronRightIcon } from './icons.tsx';
import { IconButton } from './ui/IconButton';

export interface SwipeActionItem { id: string; name: string; }

export const SwipeActionsScreen: React.FC<{
    onBack: () => void;
    onEdit: (direction: 'left' | 'right') => void;
    leftActions: SwipeActionItem[];
    rightActions: SwipeActionItem[];
}> = ({onBack, onEdit, leftActions, rightActions}) => (
     <>
        <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
            <IconButton label="Back" onClick={onBack} className="-ml-2">
                <ArrowLeftIcon className="h-6 w-6 text-foreground" />
            </IconButton>
            <h2 className="text-xl font-bold text-foreground flex-grow text-center pr-8">Swipe Actions</h2>
        </header>
        <main className="flex-grow overflow-y-auto bg-gray-100 dark:bg-black p-4">
             <div className="bg-card rounded-xl shadow-sm border border-border">
                <button onClick={() => onEdit('left')} className="w-full p-4 text-left flex justify-between items-center active:bg-secondary">
                    <span className="font-medium text-foreground text-base">Left Swipe</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{leftActions.map(a => a.name).join(', ')}</span>
                        <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                </button>
                <div className="border-t border-border mx-4" />
                <button onClick={() => onEdit('right')} className="w-full p-4 text-left flex justify-between items-center active:bg-secondary">
                    <span className="font-medium text-foreground text-base">Right Swipe</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">{rightActions.map(a => a.name).join(', ')}</span>
                        <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                </button>
             </div>
        </main>
    </>
);