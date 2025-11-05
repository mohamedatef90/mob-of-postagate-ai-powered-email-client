import React, { useState } from 'react';
// FIX: Unify icon imports to use title-case 'Icons.tsx' to resolve casing conflicts.
import { ArrowLeftIcon, ArchiveBoxIcon, TrashIcon, ClockIcon, ArrowUturnLeftIcon, EnvelopeOpenIcon, MoveIcon, StarIcon, ExclamationTriangleIcon } from './Icons';
import { IconButton } from './ui/IconButton';
import { SwipeActionItem } from './SwipeActionsScreen';

interface Action extends SwipeActionItem {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const ALL_SWIPE_ACTIONS: Action[] = [
    { id: 'archive', name: 'Archive', icon: ArchiveBoxIcon },
    { id: 'delete', name: 'Delete', icon: TrashIcon },
    { id: 'snooze', name: 'Snooze', icon: ClockIcon },
    { id: 'reply', name: 'Reply', icon: ArrowUturnLeftIcon },
    { id: 'read', name: 'Mark as Read', icon: EnvelopeOpenIcon },
    { id: 'move', name: 'Move', icon: MoveIcon },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'spam', name: 'Spam', icon: ExclamationTriangleIcon },
];

const ActionListItem: React.FC<{ action: Action, isAdded: boolean, onToggle: () => void, number: number | null }> = ({ action, isAdded, onToggle, number }) => (
    <button onClick={onToggle} className="w-full flex items-center p-4 active:bg-secondary">
        <div className="w-8 flex justify-center">
            <action.icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <span className="ml-4 font-medium text-foreground">{action.name}</span>
        <div className="ml-auto w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-semibold text-gray-500">
            {isAdded && (
                <div className="w-full h-full bg-primary border-2 border-primary rounded-full flex items-center justify-center text-white">
                    {number}
                </div>
            )}
        </div>
    </button>
);


export const EditSwipeActionScreen: React.FC<{
    direction: 'left' | 'right';
    initialActions: SwipeActionItem[];
    onSave: (actions: SwipeActionItem[]) => void;
    onBack: () => void;
}> = ({onBack, direction, initialActions, onSave}) => {
    const [actions, setActions] = useState(initialActions);
    
    const handleToggleAction = (action: SwipeActionItem) => {
        setActions(prev => {
            if (prev.find(a => a.id === action.id)) {
                return prev.filter(a => a.id !== action.id);
            } else {
                if (prev.length < 4) {
                    return [...prev, action];
                }
                return prev;
            }
        });
    };

    const handleSave = () => {
        onSave(actions);
    };

    const capitalizedDirection = direction.charAt(0).toUpperCase() + direction.slice(1);

    return (
     <>
        <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
            <IconButton label="Back" onClick={onBack} className="-ml-2">
                <ArrowLeftIcon className="h-6 w-6 text-foreground" />
            </IconButton>
            <h2 className="text-xl font-bold text-foreground flex-grow text-center">Edit {capitalizedDirection} Swipe</h2>
            <button onClick={handleSave} className="w-14 text-primary font-semibold text-base">Save</button>
        </header>
        <main className="flex-grow overflow-y-auto bg-gray-100 dark:bg-black p-4">
            <p className="px-2 pb-2 text-sm text-muted-foreground">Select up to 4 actions. The first action is the default for a short swipe.</p>
            <div className="bg-card rounded-xl shadow-sm border border-border">
                {ALL_SWIPE_ACTIONS.map((action, index) => {
                    const actionIndex = actions.findIndex(a => a.id === action.id);
                    return (
                        <React.Fragment key={action.id}>
                            {index > 0 && <div className="border-t border-border mx-4" />}
                            <ActionListItem 
                                action={action} 
                                isAdded={actionIndex !== -1}
                                onToggle={() => handleToggleAction(action)}
                                number={actionIndex !== -1 ? actionIndex + 1 : null}
                            />
                        </React.Fragment>
                    )
                })}
            </div>
        </main>
    </>
);
};