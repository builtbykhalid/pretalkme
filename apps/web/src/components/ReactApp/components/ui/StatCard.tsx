import type { LucideIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | boolean;
  icon: LucideIcon;
  color?: string; // Main theme color for the card
  chartData?: number[];
  chartType?: 'area' | 'bar';
  subtext?: string;
}

export const StatCard = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color = '#48D951',
  chartData = [2, 5, 3, 8, 4, 10, 7],
  chartType = 'area',
  subtext
}: StatCardProps) => {
  const isUp = trend === 'up' || trend === true;
  const isDown = trend === 'down' || trend === false;

  // Subtle color version for chart
  const subtleColor = `${color}33`; // 20% opacity for fill/bars if needed, but the user wants "not too flashy"
  // Actually, looking at the image, the bars are often a solid but soft color.
  // I'll use the solid color but with a slightly desaturated/lighter feel or just the provided color with high rounding.

  const formattedData = chartData.map((v, i) => ({ val: v, id: i }));

  return (
    <div className="premium-card p-6 flex flex-col group transition-all duration-500 border-[#EEEEEE] hover:border-transparent hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      {/* Top Row: Label & Icon */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[11px] font-bold text-[#9A9A9A] uppercase tracking-widest leading-none mt-1">{label}</h3>
        <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] flex items-center justify-center text-[#6B6B6B] group-hover:bg-[#0D0D0D] group-hover:text-white transition-all duration-300 border border-[#F0F0F0]">
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>

      {/* Middle Row: Content & Chart side-by-side */}
      <div className="flex items-center justify-between gap-4 h-16">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-3xl font-black text-[#0D0D0D] tracking-tighter leading-none">{value}</p>
            {subtext && <span className="text-[9px] font-bold text-[#AAAAAA] uppercase tracking-wider">{subtext}</span>}
          </div>

          {(change || trend !== undefined) && (
            <div className={`flex items-center gap-1 mt-2.5 text-[10px] font-bold uppercase tracking-wider ${isUp ? 'text-[#16A34A]' : isDown ? 'text-[#EF4444]' : 'text-[#9A9A9A]'
              }`}>
              {isUp ? <ArrowUpRight size={10} strokeWidth={4} /> : isDown ? <ArrowDownRight size={10} strokeWidth={4} /> : null}
              <span>{change || '0%'}</span>
              <span className="text-[#AAAAAA] ml-0.5 lowercase font-medium tracking-normal text-[9px]">ce mois</span>
            </div>
          )}
        </div>

        {/* Small Visualizer to the right */}
        <div className="w-20 h-full shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${label.replace(/\s+/g, '')})`}
                  isAnimationActive={true}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <BarChart data={formattedData} barGap={2}>
                <Bar
                  dataKey="val"
                  fill={color}
                  radius={[4, 4, 4, 4]}
                  isAnimationActive={true}
                  opacity={0.15} // Very subtle like the reference
                  className="group-hover:opacity-40 transition-opacity duration-500"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
