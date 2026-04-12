import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

interface UnifiedEmptyStateProps {
  layout: 'centered' | 'split';
  title: string;
  subtitle?: string;
  hook?: string; // e.g. "Prends 60 secondes"
  primaryAction?: {
    label: string;
    onClick?: () => void;
    path?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    path?: string;
  };
  demoImage?: string; // Path to demo asset
  demoComponent?: React.ReactNode; // For more complex interactive demos
}

export default function UnifiedEmptyState({
  layout,
  title,
  subtitle,
  hook,
  primaryAction,
  secondaryAction,
  demoImage,
  demoComponent
}: UnifiedEmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = (action?: { label: string; onClick?: () => void; path?: string }) => {
    if (action?.onClick) action.onClick();
    if (action?.path) navigate(action.path);
  };

  if (layout === 'split') {
    return (
      <div className="flex flex-col lg:flex-row min-h-[600px] w-full bg-white rounded-3xl overflow-hidden border border-[#E8E8E8] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Left Content Side */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center gap-8 relative z-10 bg-white">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
            <Sparkles className="text-emerald-500" size={24} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#0D0D0D] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-[#6B6B6B] leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            {primaryAction && (
              <button
                onClick={() => handleAction(primaryAction)}
                className="px-8 py-3.5 bg-[#1A1A1A] text-white rounded-xl font-semibold hover:bg-black transition-all active:scale-95 flex items-center gap-2"
              >
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={() => handleAction(secondaryAction)}
                className="px-8 py-3.5 bg-white text-[#0D0D0D] border border-[#E8E8E8] rounded-xl font-semibold hover:bg-[#F8F8F8] transition-all active:scale-95"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Right Demo Side */}
        <div className="flex-1 bg-[#FDFDFD] border-l border-[#F0F0F0] relative overflow-hidden flex items-center justify-center p-8 lg:p-16">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {demoComponent ? (
            <div className="w-full h-full flex items-center justify-center scale-90 lg:scale-100">
              {demoComponent}
            </div>
          ) : (
            <div className="relative group max-w-md w-full">
              <div className="absolute -inset-4 bg-emerald-100 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
              {demoImage && (
                <img 
                  src={demoImage} 
                  alt="Feature Demo" 
                  className="relative w-full rounded-2xl shadow-2xl border border-[#E8E8E8] transform group-hover:scale-[1.02] transition-transform duration-500 opacity-90 blur-[1px]" 
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Centered Layout (Link in bio / Stats style)
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center text-center gap-12 animate-in fade-in duration-700">
      <div className="max-w-2xl space-y-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-[#0D0D0D] leading-[1.15]">
          {hook && <span className="text-emerald-500 underline decoration-2 underline-offset-8 mr-2">{hook}</span>}
          {title}
        </h2>
        
        {primaryAction && (
          <button
            onClick={() => handleAction(primaryAction)}
            className="px-10 py-4 bg-[#1A1A1A] text-white rounded-xl text-lg font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10 mx-auto"
          >
            {primaryAction.label}
          </button>
        )}
      </div>

      <div className="w-full max-w-5xl relative mt-4">
        <div className="absolute -inset-20 bg-emerald-50 rounded-full blur-[120px] opacity-40 mix-blend-multiply pointer-events-none" />
        
        <div className="relative bg-white/40 backdrop-blur-sm rounded-[40px] border border-white/60 p-1 lg:p-2 shadow-2xl overflow-hidden group">
          {demoImage ? (
            <img 
              src={demoImage} 
              alt="Demo Preview" 
              className="w-full rounded-[30px] opacity-90 grayscale-[0.2] blur-[1px] group-hover:blur-0 group-hover:grayscale-0 transition-all duration-700 h-[400px] object-cover object-top"
            />
          ) : (
            <div className="w-full h-[400px] bg-gray-50 flex items-center justify-center rounded-[30px]">
               {demoComponent}
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
