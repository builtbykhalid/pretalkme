import { MessageCircle, Briefcase } from 'lucide-react';

const IS_PROD = typeof window !== 'undefined' && window.location.hostname.endsWith('pretalk.me');

const CRM_URL = IS_PROD ? 'https://pretalk.me/app' : 'http://localhost:5174';
const WA_URL  = IS_PROD ? 'https://app.pretalk.me'  : 'http://localhost:5173';

const RAIL_BG    = '#F3F4F6';   // ultra-light gray — slightly tinted rail
const MENU_BG    = '#FFFFFF';   // pure white — active item + sidebar
const ICON_MUTED = '#9CA3AF';   // monochrome inactive icons
const ACTIVE_CLR = '#00A884';   // WA green for active icon
const SEPARATOR  = '#E5E7EB';   // 1px right border

type App = 'whatsapp' | 'consultant';

interface AppSwitcherProps {
  currentApp?: App;
}

/**
 * Concave notch: creates an inverted-border-radius curve at the top or bottom
 * of the active tab.
 *
 * Technique: white outer container (blends with active item + sidebar) with a
 * gray inner circle (matches the rail). The circle is clipped to create a
 * concave arc instead of a convex one.
 *
 * Placement:
 *  - top notch → `bottom: 100%` (just above the active item)
 *  - bottom notch → `top: 100%`  (just below the active item)
 * Both are right-aligned so their right edge is flush with the sidebar.
 */
function Notch({ position }: { position: 'top' | 'bottom' }) {
  const isTop = position === 'top';
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        [isTop ? 'bottom' : 'top']: '100%',
        width: 16,
        height: 16,
        overflow: 'hidden',
        backgroundColor: MENU_BG,   // white — blends with active item & sidebar
        pointerEvents: 'none',
      }}
    >
      {/* Gray circle whose visible quadrant creates the concave arc */}
      <div
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: RAIL_BG,   // gray — blends with the rail
          [isTop ? 'bottom' : 'top']: 0,
          right: 0,
        }}
      />
    </div>
  );
}

export default function AppSwitcher({ currentApp = 'whatsapp' }: AppSwitcherProps) {
  const items: { id: App; icon: typeof MessageCircle; label: string; url: string }[] = [
    { id: 'whatsapp',   icon: MessageCircle, label: 'WhatsApp CRM', url: WA_URL  },
    { id: 'consultant', icon: Briefcase,     label: 'Consultant',   url: CRM_URL },
  ];

  return (
    <div
      style={{
        backgroundColor: RAIL_BG,
        borderRight: `1px solid ${SEPARATOR}`,
      }}
      className="fixed left-0 top-0 h-full w-10 flex flex-col items-center z-50"
    >
      {/* ── Logo header ───────────────────────────────────────────────────── */}
      <div className="h-14 flex items-center justify-center w-full shrink-0">
        <svg width="26" height="26" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1,0,0,1,-892.082857,0)">
            <g transform="matrix(1,0,0,1,892.082857,0)">
              <g transform="matrix(1.415137,0.394589,-0.394589,1.415137,-11.807117,-204.449377)">
                <g opacity="0.2" fill={ACTIVE_CLR}>
                  <path d="M310.885,174.623C338.473,174.623 362.582,189.631 375.488,211.921C381.843,222.896 385.481,235.636 385.481,249.219C385.481,262.802 381.843,275.542 375.488,286.517C362.582,308.807 338.473,323.815 310.885,323.815L208.506,323.815C206.827,323.815 205.161,323.76 203.51,323.65L203.51,360.351C178.026,358.662 156.023,344.151 143.903,323.218C137.549,312.243 133.91,300.1 133.91,286.517L171.339,286.517L171.339,286.517L310.885,286.517C331.47,286.517 348.183,269.804 348.183,249.219C348.183,228.634 331.47,211.921 310.885,211.921L241.027,211.921L241.027,174.623L310.885,174.623Z" />
                  <path d="M203.51,174.788L203.51,212.034C185.283,214.479 171.208,230.109 171.208,249L133.91,249C133.949,235.499 137.583,222.837 143.903,211.921C156.023,190.988 178.026,176.477 203.51,174.788Z" />
                </g>
              </g>
              <g transform="matrix(1.401476,0.440658,-0.440658,1.401476,4.001881,-232.81737)">
                <path fill={ACTIVE_CLR} d="M310.885,174.623C338.473,174.623 362.582,189.631 375.488,211.921C381.843,222.896 385.481,235.636 385.481,249.219C385.481,262.802 381.843,275.542 375.488,286.517C362.582,308.807 338.473,323.815 310.885,323.815L208.506,323.815C206.827,323.815 205.161,323.76 203.51,323.65L203.51,360.351C178.026,358.662 156.023,344.151 143.903,323.218C137.549,312.243 133.91,300.1 133.91,286.517L171.339,286.517L171.339,286.517L310.885,286.517C331.47,286.517 348.183,269.804 348.183,249.219C348.183,228.634 331.47,211.921 310.885,211.921L241.027,211.921L241.027,174.623L310.885,174.623Z" />
                <path fill={ACTIVE_CLR} d="M203.51,174.788L203.51,212.034C185.283,214.479 171.208,230.109 171.208,249L133.91,249C133.949,235.499 137.583,222.837 143.903,211.921C156.023,190.988 178.026,176.477 203.51,174.788Z" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* ── Nav icons ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 pt-3 flex-1 w-full">
        {items.map(({ id, icon: Icon, label, url }) => {
          const isActive = id === currentApp;
          return (
            <div key={id} style={{ position: 'relative', width: '100%' }}>

              {isActive && <Notch position="top" />}

              <a
                href={isActive ? undefined : url}
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                onClick={isActive ? (e) => e.preventDefault() : undefined}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: 40,
                  cursor: isActive ? 'default' : 'pointer',
                  backgroundColor: isActive ? MENU_BG : 'transparent',
                  borderRadius: isActive ? '12px 0 0 12px' : 8,
                  color: isActive ? ACTIVE_CLR : ICON_MUTED,
                  transition: 'all 0.3s',
                  position: 'relative',
                  textDecoration: 'none',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ transition: 'all 0.3s' }}
                />

                {/* Tooltip */}
                <span
                  className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 z-50"
                  style={{
                    backgroundColor: '#111B21',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {label}
                </span>
              </a>

              {isActive && <Notch position="bottom" />}
            </div>
          );
        })}
      </div>

      {/* ── Bottom dot ────────────────────────────────────────────────────── */}
      <div
        className="mb-3 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: `${ICON_MUTED}50` }}
      />
    </div>
  );
}
