import React from 'react';
import { Check, Minus, Info, type LucideIcon } from 'lucide-react';

interface PricingTableProps {
  className?: string;
  children: React.ReactNode;
}

export function PricingTable({ className, children }: PricingTableProps) {
  return (
    <div className={`relative w-full overflow-x-auto ${className || ''}`}>
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  );
}

export function PricingTableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function PricingTableBody({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <tbody className={className || ''}>
      {children}
    </tbody>
  );
}

export function PricingTableRow({ children, className }: { children: React.ReactNode, className?: string }) {
  return <tr className={`bg-white hover:bg-neutral-50/50 transition-colors ${className || ''}`}>{children}</tr>;
}

export function PricingTableCell({
  className,
  children,
  align = 'center'
}: {
  className?: string;
  children: boolean | string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  
  return (
    <td className={`p-4 align-middle whitespace-nowrap border-neutral-50 ${alignmentClass} ${className || ''}`}>
      {children === true ? (
        <div className="flex justify-center text-emerald-500">
            <Check size={18} strokeWidth={3} />
        </div>
      ) : children === false ? (
        <div className="flex justify-center text-neutral-300">
            <Minus size={18} strokeWidth={2} />
        </div>
      ) : (
        <span className="font-medium text-neutral-600">{children}</span>
      )}
    </td>
  );
}

export function PricingTableHead({ className, children, width }: { className?: string; children?: React.ReactNode; width?: string }) {
  return (
    <th
      className={`p-4 text-left align-middle font-bold text-neutral-400 uppercase tracking-widest text-[10px] whitespace-nowrap border-neutral-100 ${className || ''}`}
      style={{ width }}
    >
      {children}
    </th>
  );
}

export function PricingTablePlan({
  name,
  badge,
  price,
  compareAt,
  icon: Icon,
  popular,
  className,
  billingCycle
}: {
  name: string;
  badge: React.ReactNode;
  price: string;
  compareAt?: string;
  icon: LucideIcon;
  popular?: boolean;
  className?: string;
  billingCycle?: 'monthly' | 'annual';
}) {
  return (
    <div className={`relative p-6 rounded-2xl border transition-all duration-300 ${popular ? 'border-primary-500 bg-white shadow-xl ring-4 ring-primary-500/5' : 'border-[#EEEEEE] bg-white'} ${className || ''}`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest">
          Conseillé
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${popular ? 'bg-primary-50 text-primary-500' : 'bg-neutral-100 text-neutral-500'}`}>
          <Icon size={18} />
        </div>
        <h3 className="font-black text-dark tracking-tight">{name}</h3>
      </div>
      
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-dark">{price}</span>
          <span className="text-neutral-400 text-sm font-bold">/mois</span>
        </div>
        {compareAt && (
           <div className="text-[10px] text-neutral-400 font-bold line-through ml-0.5">{compareAt}</div>
        )}
      </div>
      <div className="mt-4">
        {badge}
      </div>
    </div>
  );
}

export type FeatureItem = {
  label: string;
  tooltip?: string;
  values: (boolean | string)[];
};
