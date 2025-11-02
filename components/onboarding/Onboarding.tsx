import React, { useState } from 'react';
import WelcomeStep from './WelcomeStep';
import SignInStep from './SignInStep';
import PersonalizationStep from './PersonalizationStep';
import NotificationsStep from './NotificationsStep';
import SetDefaultStep from './SetDefaultStep';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({
        email: '',
        fullName: '',
        displayName: ''
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);
    
    const updateUserData = (data: Partial<typeof userData>) => {
        setUserData(prev => ({ ...prev, ...data }));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <WelcomeStep onNext={nextStep} />;
            case 2:
                return <SignInStep onNext={nextStep} onBack={prevStep} updateData={updateUserData} data={userData} onComplete={onComplete} />;
            case 3:
                return <PersonalizationStep onNext={nextStep} onBack={prevStep} updateData={updateUserData} data={userData} />;
            case 4:
                return <NotificationsStep onNext={nextStep} onBack={prevStep} />;
            case 5:
                return <SetDefaultStep onComplete={onComplete} onBack={prevStep} />;
            default:
                return <WelcomeStep onNext={nextStep} />;
        }
    };
    
    // Add a transition effect wrapper
    const stepKey = `step-${step}`;

    return (
        <div className="h-dvh w-screen bg-background text-foreground flex items-center justify-center p-4">
             <div key={stepKey} className="animate-fadeIn w-full h-full">
                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;