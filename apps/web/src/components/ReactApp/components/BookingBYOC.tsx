// React import removed (JSX runtime automatic) to avoid unused variable linting
import { ArrowRight } from 'lucide-react';

interface Props {
  externalUrl?: string | null;
  displayMode?: 'external' | 'iframe' | 'none';
  formTitle?: string;
  primaryColorHex?: string;
  onNext?: () => void;
}

function isValidHttpUrl(input?: string | null) {
  if (!input) return false;
  try {
    const u = new URL(input);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export default function BookingBYOC({ externalUrl, displayMode = 'external', formTitle, primaryColorHex = '#6366f1', onNext }: Props) {
  const urlValid = isValidHttpUrl(externalUrl);

  // Render when no external link provided
  if (!externalUrl || externalUrl === '') {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${primaryColorHex}20` }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke={primaryColorHex} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 className="text-xl font-bold mt-4">Merci — c'est terminé</h3>
        <p className="text-neutral-500 mt-2">Audit terminé, le consultant vous contactera prochainement.</p>
      </div>
    );
  }

  if (!urlValid) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-bold">Merci — réservation indisponible</h3>
        <p className="text-sm text-neutral-500 mt-2">Le lien de réservation fourni par le consultant semble invalide. Le consultant vous contactera directement.</p>
        <p className="text-xs text-neutral-400 mt-2">Lien fourni: {externalUrl}</p>
      </div>
    );
  }

  // If displayMode is external -> show button
    if (displayMode === 'external') {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold">Prendre rendez-vous</h3>
        <p className="text-neutral-500 mt-2 mb-6">Vous allez être redirigé vers l'agenda du consultant.</p>
        <div className="flex flex-col items-center gap-3">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold shadow-sm"
            style={{ backgroundColor: primaryColorHex }}
          >
            Prendre rendez-vous
            <ArrowRight size={16} />
          </a>
          {onNext && (
            <button onClick={onNext} className="mt-2 px-4 py-2 rounded-lg bg-neutral-100 text-sm font-semibold">Suivant</button>
          )}
        </div>
      </div>
    );
  }

  // If displayMode is iframe -> embed with sandbox
  return (
    <div className="p-4">
      <div className="w-full rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
        <iframe
          title={formTitle || 'Agenda consultant'}
          src={externalUrl || undefined}
          className="w-full h-[700px]"
          sandbox={"allow-scripts allow-same-origin allow-popups allow-forms"}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="text-xs text-neutral-400 mt-3">Si le calendrier ne s'affiche pas, ouvrez-le dans un nouvel onglet.</div>
      {onNext && (
        <div className="mt-4 text-right">
          <button onClick={onNext} className="px-4 py-2 rounded-lg bg-neutral-100 text-sm font-semibold">Suivant</button>
        </div>
      )}
    </div>
  );
}
