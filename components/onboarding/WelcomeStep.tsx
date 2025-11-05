import React from 'react';
import { Button } from '../ui/Button';

interface WelcomeStepProps {
    onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="animate-fadeInUp">
                <img src="https://i.postimg.cc/59BYkdyG/Posta.png" alt="PostaGate Logo" className="w-24 mx-auto rounded-3xl" />
                <h1 className="text-4xl font-bold text-foreground mt-6">Welcome to PostaGate</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-md">The smartest way to manage your email, powered by AI.</p>
            </div>
            <div className="absolute bottom-10">
                <Button size="lg" onClick={onNext} className="rounded-full backdrop-blur-xl bg-primary/80 border border-white/20 shadow-lg animate-fadeInUp" style={{animationDelay: '0.5s'}}>
                    Get Started <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
            </div>
        </div>
    );
};

export default WelcomeStep;