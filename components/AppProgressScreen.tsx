import React from 'react';
// FIX: Resolved file casing ambiguity by using a consistent PascalCase import path.
import { ArrowLeftIcon } from './Icons.tsx';
import { IconButton } from './ui/IconButton';

const progressItems = [
    { id: 'swipe', title: 'Customize Swipe Actions', description: 'Make your inbox work for you.', completed: true },
    { id: 'snooze', title: 'Snooze an Email', description: 'Handle emails at the right time.', completed: true },
    { id: 'summary', title: 'Try AI Summary', description: 'Get the gist of long threads instantly.', completed: false },
    { id: 'ai-reply', title: 'Draft a Reply with AI', description: 'Let Copilot help you write emails.', completed: false },
    { id: 'dark-mode', title: 'Enable Dark Mode', description: 'Easier on the eyes at night.', completed: true },
    { id: 'add-account', title: 'Add Another Account', description: 'Manage all your inboxes in one place.', completed: false },
];

const ProgressItem: React.FC<{ title: string; description: string; completed: boolean }> = ({ title, description, completed }) => (
    <div className="flex items-start space-x-4 p-4">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${completed ? 'bg-primary' : 'border-2 border-gray-400'}`}>
            {completed && <i className="fa-solid fa-check text-white text-xs"></i>}
        </div>
        <div>
            <p className={`font-medium ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

export const AppProgressScreen: React.FC<{onBack: () => void}> = ({onBack}) => (
     <>
        <header className="bg-card flex items-center p-4 border-b border-border shrink-0">
            <IconButton label="Back" onClick={onBack} className="-ml-2">
                <ArrowLeftIcon className="h-6 w-6 text-foreground" />
            </IconButton>
            <h2 className="text-xl font-bold text-foreground flex-grow text-center pr-8">App Progress</h2>
        </header>
        <main className="flex-grow overflow-y-auto bg-gray-100 dark:bg-black p-4">
             <div className="bg-card rounded-xl shadow-sm border border-border">
                {progressItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <ProgressItem {...item} />
                        {index < progressItems.length - 1 && <div className="border-t border-border mx-4"></div>}
                    </React.Fragment>
                ))}
            </div>
        </main>
    </>
);