import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 340, suffix: "+", label: "Consultants actifs", animate: true },
  { value: "€2.1M", label: "Générés via Pretalk" },
  { value: "3×", label: "Taux de closing moyen" },
  { value: "38h", label: "Économisées / mois" },
];

function CountUp({ target, duration = 1600 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
          n += step;
          if (n >= target) { setVal(target); clearInterval(t); return; }
          setVal(Math.floor(n));
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}</span>;
}

export default function ProofBar() {
  return (
    <div className="bg-gray-50 border-y border-gray-200 py-5 px-8">
      <div className="max-w-[1160px] mx-auto flex items-center justify-center gap-12 flex-wrap">
        {STATS.map((s, i) => (
          <>
            <div key={i} className="flex items-center gap-3">
              <span className="text-[26px] font-extrabold text-black tracking-[-0.8px]">
                {s.animate ? (
                  <><CountUp target={s.value} />{s.suffix}</>
                ) : s.value}
              </span>
              <span className="text-[13px] text-gray-500">{s.label}</span>
            </div>
            {i < STATS.length - 1 && (
              <div key={`div-${i}`} className="w-px h-8 bg-gray-200" />
            )}
          </>
        ))}
      </div>
    </div>
  );
}
