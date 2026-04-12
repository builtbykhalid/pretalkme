import { useState } from 'react';
import { Star } from 'lucide-react';

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
  count?: number;
};

export default function RatingStars({
  value,
  onChange,
  disabled = false,
  size = 14,
  className = '',
  showValue = true,
  label,
  count,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const interactive = !!onChange && !disabled;
  const displayValue = hoverValue ?? value;

  const handleClick = (starIndex: number, event: any) => {
    if (!interactive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickRatio = (event.clientX - rect.left) / rect.width;
    const nextValue = starIndex - 1 + (clickRatio <= 0.5 ? 0.5 : 1);

    onChange(Math.max(0.5, Math.min(5, Math.round(nextValue * 2) / 2)));
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }, (_, index) => {
          const starIndex = index + 1;
          const fill = Math.max(0, Math.min(1, displayValue - index));

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={(event) => handleClick(starIndex, event)}
              onMouseEnter={() => interactive && setHoverValue(starIndex)}
              onMouseMove={() => interactive && setHoverValue(starIndex)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              className={`relative shrink-0 transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
              aria-label={`Noter ${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
            >
              <div style={{ width: size, height: size }} className="relative">
                <Star size={size} className="absolute inset-0 text-neutral-200" />
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star size={size} className="text-amber-400 fill-amber-400" />
                </div>
              </div>
            </button>
          );
        })}

        {showValue && (
          <span className="ml-1 text-[10px] font-semibold text-[#6B6B6B] tabular-nums">
            {value.toFixed(1)}/5{typeof count === 'number' ? ` · ${count}` : ''}
          </span>
        )}
      </div>

      {label && (
        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9A9A9A]">
          {label}
        </div>
      )}
    </div>
  );
}
