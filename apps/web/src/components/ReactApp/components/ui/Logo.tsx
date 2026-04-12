interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  textColor?: string;
  className?: string;
  logoColor?: 'white' | 'primary' | 'current' | 'dark';
  iconClassName?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
  custom: '',
};

export default function Logo({
  size = 'md',
  showText = true,
  textColor = 'text-dark',
  logoColor = 'primary',
  className = '',
  iconClassName = ''
}: LogoProps) {
  const getLogoColor = () => {
    if (logoColor === 'white') return '#ffffff';
    if (logoColor === 'dark') return '#0D0D0D';
    if (logoColor === 'primary') return '#00A884';
    return 'currentColor';
  };

  return (
    <a 
      href="https://pretalk.me" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-2 transition-all hover:opacity-80 active:scale-95 ${className}`}
    >
      <svg
        className={`${sizeMap[size]} ${iconClassName} shrink-0`}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="matrix(1,0,0,1,-892.082857,0)">
          <g transform="matrix(1,0,0,1,892.082857,0)">
            <rect x="0" y="0" width="500" height="500" fill="none" />
            <g transform="matrix(1.415137,0.394589,-0.394589,1.415137,-11.807117,-204.449377)">
              <g opacity="0.15" fill={getLogoColor()}>
                <path d="M310.885,174.623C338.473,174.623 362.582,189.631 375.488,211.921C381.843,222.896 385.481,235.636 385.481,249.219C385.481,262.802 381.843,275.542 375.488,286.517C362.582,308.807 338.473,323.815 310.885,323.815L208.506,323.815C206.827,323.815 205.161,323.76 203.51,323.65L203.51,360.351C178.026,358.662 156.023,344.151 143.903,323.218C137.549,312.243 133.91,300.1 133.91,286.517L171.339,286.517C171.339,286.65 171.338,286.622 171.339,286.517L310.885,286.517C331.47,286.517 348.183,269.804 348.183,249.219C348.183,228.634 331.47,211.921 310.885,211.921L241.027,211.921L241.027,174.623L310.885,174.623Z" />
                <path d="M203.51,174.788L203.51,212.034C185.283,214.479 171.208,230.109 171.208,249L133.91,249C133.949,235.499 137.583,222.837 143.903,211.921C156.023,190.988 178.026,176.477 203.51,174.788Z" />
              </g>
            </g>
            <g transform="matrix(1.401476,0.440658,-0.440658,1.401476,4.001881,-232.81737)">
              <path fill={getLogoColor()} d="M310.885,174.623C338.473,174.623 362.582,189.631 375.488,211.921C381.843,222.896 385.481,235.636 385.481,249.219C385.481,262.802 381.843,275.542 375.488,286.517C362.582,308.807 338.473,323.815 310.885,323.815L208.506,323.815C206.827,323.815 205.161,323.76 203.51,323.65L203.51,360.351C178.026,358.662 156.023,344.151 143.903,323.218C137.549,312.243 133.91,300.1 133.91,286.517L171.339,286.517C171.339,286.65 171.338,286.622 171.339,286.517L310.885,286.517C331.47,286.517 348.183,269.804 348.183,249.219C348.183,228.634 331.47,211.921 310.885,211.921L241.027,211.921L241.027,174.623L310.885,174.623Z" />
              <path fill={getLogoColor()} d="M203.51,174.788L203.51,212.034C185.283,214.479 171.208,230.109 171.208,249L133.91,249C133.949,235.499 137.583,222.837 143.903,211.921C156.023,190.988 178.026,176.477 203.51,174.788Z" />
            </g>
          </g>
        </g>
      </svg>
      {showText && (
        <span className={`font-bold ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'} ${textColor}`}>
          Pretalk
        </span>
      )}
    </a>
  );
}

