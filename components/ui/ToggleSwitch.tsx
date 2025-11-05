import React from 'react';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void, label?: string, disabled?: boolean }> = ({ checked, onChange, label, disabled }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex items-center h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                checked ? 'bg-primary' : 'bg-secondary'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};

export { ToggleSwitch };
