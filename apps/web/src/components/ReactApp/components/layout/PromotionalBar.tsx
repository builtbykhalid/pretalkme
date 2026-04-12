import { useState, useEffect } from 'react';
import { X, Zap, TrendingUp, UserCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface PromotionalContent {
    id: string;
    type: 'marketing' | 'upgrade' | 'onboarding';
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
}

export default function PromotionalBar() {
    const { userProfile } = useApp();
    const navigate = useNavigate();
    const [currentContent, setCurrentContent] = useState<PromotionalContent | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    const promotionalContents: PromotionalContent[] = [
        {
            id: 'marketing',
            type: 'marketing',
            title: '✨ Nouvelle fonctionnalité : Analyses avancées',
            description: 'Découvrez les insights détaillés sur vos leads et optimisez vos conversions',
            ctaText: 'Découvrir',
            ctaLink: '/analytics',
            icon: <TrendingUp size={16} />,
            bgColor: 'bg-gradient-to-r from-primary-600 to-accent-600',
            textColor: 'text-white'
        },
        {
            id: 'upgrade',
            type: 'upgrade',
            title: '🚀 Passez au plan Pro pour des formulaires illimités',
            description: 'Créez des expériences client exceptionnelles avec nos thèmes premium',
            ctaText: 'Mettre à niveau',
            ctaLink: '/settings/billing',
            icon: <Zap size={16} />,
            bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-600',
            textColor: 'text-white'
        },
        {
            id: 'onboarding',
            type: 'onboarding',
            title: '� Complétez votre profil pour de meilleurs résultats',
            description: 'Plus votre profil est complet, plus vous attirerez de leads qualifiés',
            ctaText: 'Continuer',
            ctaLink: '/settings/profile',
            icon: <UserCheck size={16} />,
            bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
            textColor: 'text-white'
        }
    ];

    // Default content to show initially
    const defaultContent = promotionalContents.find(c => c.type === 'onboarding') || promotionalContents[0];

    // Calculate onboarding completion
    const getOnboardingCompletion = () => {
        if (!userProfile) return 0;

        let completed = 0;
        const total = 6;

        if (userProfile.first_name && userProfile.last_name) completed++;
        if (userProfile.job_title) completed++;
        if (userProfile.bio) completed++;
        if (userProfile.website) completed++;
        if (userProfile.social_networks && Object.values(userProfile.social_networks).some(v => v)) completed++;
        if (userProfile.avatar_url) completed++;

        return Math.round((completed / total) * 100);
    };

    useEffect(() => {
        // Determine which content to show based on user state
        if (!userProfile) {
            // Default to onboarding if no user profile
            setCurrentContent(promotionalContents.find(c => c.type === 'onboarding') || promotionalContents[0]);
            return;
        }

        const completion = getOnboardingCompletion();
        const isPro = userProfile.plan === 'pro' || userProfile.plan === 'growth' || userProfile.plan === 'enterprise';

        // Priority order: onboarding (if incomplete) > upgrade (if not pro) > marketing
        if (completion < 100) {
            setCurrentContent(promotionalContents.find(c => c.type === 'onboarding') || promotionalContents[0]);
        } else if (!isPro) {
            setCurrentContent(promotionalContents.find(c => c.type === 'upgrade') || promotionalContents[0]);
        } else {
            setCurrentContent(promotionalContents.find(c => c.type === 'marketing') || promotionalContents[0]);
        }

        // Debug logs
        console.log('PromotionalBar - User profile:', userProfile);
        console.log('PromotionalBar - Completion:', completion, 'Is Pro:', isPro);
    }, [userProfile]);

    const handleCtaClick = () => {
        const content = currentContent || defaultContent;
        if (content) {
            navigate(content.ctaLink);
        }
    };

    if (!isVisible) return null;

    // Use current content or default content
    const contentToShow = currentContent || defaultContent;
    if (!contentToShow) return null;

    return (
        <div className={`${contentToShow.bgColor} ${contentToShow.textColor} px-4 py-3 flex items-center justify-between text-sm relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10"></div>
            </div>

            <div className="flex items-center gap-3 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                    {contentToShow.icon}
                    <div>
                        <p className="font-semibold text-sm leading-tight">{contentToShow.title}</p>
                        <p className="text-xs opacity-90 leading-tight">{contentToShow.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
                <button
                    onClick={handleCtaClick}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105"
                >
                    {contentToShow.ctaText}
                    <ArrowRight size={14} />
                </button>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
