import { useState, useEffect } from 'react';
import { Sparkles, Brain, Target, Lightbulb, Rocket } from 'lucide-react';

interface LoadingAnimationProps {
    primaryColorHex?: string;
}

const MOTIVATIONAL_PHRASES = [
    { text: "Analyse de vos réponses en cours...", icon: Brain },
    { text: "Préparation de questions personnalisées...", icon: Target },
    { text: "Un bon diagnostic commence par les bonnes questions", icon: Lightbulb },
    { text: "Bientôt, vous recevrez un audit sur-mesure", icon: Rocket },
    { text: "Merci de votre patience, c'est presque prêt !", icon: Sparkles },
    { text: "Notre IA analyse votre situation...", icon: Brain },
    { text: "Création d'un parcours unique pour vous...", icon: Target },
];

export default function LoadingAnimation({ primaryColorHex = '#6366f1' }: LoadingAnimationProps) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

    // Rotate phrases every 3 seconds with fade effect
    useEffect(() => {
        const interval = setInterval(() => {
            setFadeState('out');
            setTimeout(() => {
                setCurrentPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
                setFadeState('in');
            }, 300);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Animate progress bar (fake progress for UX)
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev; // Stop at 90% until real completion
                return prev + Math.random() * 3;
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = MOTIVATIONAL_PHRASES[currentPhraseIndex].icon;

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
            {/* Animated Icon */}
            <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse"
                style={{ backgroundColor: `${primaryColorHex}15` }}
            >
                <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center animate-spin-slow"
                    style={{ backgroundColor: `${primaryColorHex}25` }}
                >
                    <Sparkles 
                        size={28} 
                        style={{ color: primaryColorHex }}
                        className="animate-pulse"
                    />
                </div>
            </div>

            {/* Main Loading Text */}
            <h2 className="text-xl font-bold text-dark mb-2">
                Analyse en cours...
            </h2>

            {/* Progress Bar */}
            <div className="w-full max-w-xs h-2 bg-neutral-100 rounded-full mb-6 overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                        width: `${progress}%`,
                        backgroundColor: primaryColorHex 
                    }}
                />
            </div>

            {/* Rotating Motivational Phrase */}
            <div 
                className={`flex items-center gap-3 p-4 rounded-xl transition-opacity duration-300 ${
                    fadeState === 'in' ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundColor: `${primaryColorHex}10` }}
            >
                <CurrentIcon 
                    size={20} 
                    style={{ color: primaryColorHex }}
                    className="shrink-0"
                />
                <p 
                    className="text-sm font-medium"
                    style={{ color: primaryColorHex }}
                >
                    {MOTIVATIONAL_PHRASES[currentPhraseIndex].text}
                </p>
            </div>

            {/* Dots animation */}
            <div className="flex gap-2 mt-8">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ 
                            backgroundColor: primaryColorHex,
                            animationDelay: `${i * 0.2}s`,
                            opacity: 0.6 + (i * 0.15)
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// Add custom animation to tailwind (put in index.css or tailwind config)
// @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
// .animate-spin-slow { animation: spin-slow 3s linear infinite; }





