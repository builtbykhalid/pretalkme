import { Badge, BtnHero, BtnOutline, Reveal, ArrowIcon, PlayIcon } from "./ui";

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-[60px] bg-white flex items-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-[-100px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,197,94,0.06)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-8 w-full grid grid-cols-2 gap-16 items-center min-h-[calc(100vh-60px)]">
        {/* ── LEFT ── */}
        <div>
          <Reveal delay={0}>
            <div className="mb-6">
              <Badge variant="green" dot>Agents IA — Maintenant disponibles</Badge>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-[clamp(38px,5vw,62px)] font-extrabold leading-[1.04] tracking-[-2px] text-black mb-[22px]">
              Transformez chaque<br />
              prospect en client<br />
              <span className="bg-[linear-gradient(90deg,#16A34A,#22C55E,#16A34A)] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
                avant de parler.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-[17px] text-gray-500 leading-[1.72] max-w-[460px] mb-9">
              Pretalk automatise votre cycle de vente : qualification IA, audit client, scoring, devis et contrats. Closez 3× plus vite sans sacrifier votre positionnement expert.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex items-center gap-3 flex-wrap">
              <BtnHero href="#">
                Démarrer gratuitement <ArrowIcon />
              </BtnHero>
              <BtnOutline href="#pipeline">
                <PlayIcon /> Voir la démo
              </BtnOutline>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="flex items-center gap-3.5 mt-11 pt-7 border-t border-gray-200">
              {/* Avatar stack */}
              <div className="flex">
                {AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white object-cover block"
                    style={{ marginLeft: i === 0 ? 0 : -8 }}
                  />
                ))}
              </div>
              <div>
                <div className="text-[#F59E0B] text-xs tracking-widest mb-0.5">★★★★★</div>
                <span className="text-[13px] text-gray-500">
                  <strong className="text-black font-semibold">+340 consultants</strong> closent mieux ce mois-ci
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT — image slot ── */}
        <Reveal delay={160}>
          <div className="relative h-[560px] flex items-center justify-center">
            <div className="w-full h-full rounded-3xl border-[1.5px] border-dashed border-gray-300 bg-gradient-to-br from-[#F4F7FF] via-[#F9FAFB] to-[#F4FFF8] flex flex-col items-center justify-center gap-3.5 text-gray-400 text-center p-8">
              <svg className="opacity-30" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect x="8" y="8" width="36" height="36" rx="7" stroke="currentColor" strokeWidth="2" />
                <circle cx="21" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M8 38l10-10 7 7 7-9 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px] font-semibold tracking-[0.06em] uppercase leading-[1.7]">
                Image principale<br />
                Consultant 35 ans · Costume sombre<br />
                Stylo digital en main · PNG transparent<br />
                Cadrage 3/4 corps entier
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
