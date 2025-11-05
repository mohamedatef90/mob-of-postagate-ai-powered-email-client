import React, { createContext } from 'react';

// Re-define Module type here to avoid circular dependency with App.tsx
export type Module = 'email' | 'copilot' | 'chat' | 'drive' | 'settings' | 'design-system';

export interface Account {
    name: string;
    email: string;
    avatarUrl?: string;
}

interface AppContextType {
    accounts: Account[];
    darkModeOption: string;
    setDarkModeOption: (option: string) => void;
    initialSettingsView: string | null;
    setInitialSettingsView: (view: string | null) => void;
    setActiveModule: (module: Module) => void;
    activeDomain: 'hogwarts' | 'liverpool';
}

export const AppContext = createContext<AppContextType>({
    accounts: [],
    darkModeOption: 'system',
    setDarkModeOption: () => {},
    initialSettingsView: null,
    setInitialSettingsView: () => {},
    setActiveModule: () => {},
    activeDomain: 'hogwarts',
});