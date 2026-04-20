/**
 * ServiceCases — Freelance mini-pipeline
 *
 * Only visible when tenant.mode_freelance = true.
 * Shows engagements from shared.engagements in a 4-column Kanban:
 *   Discovery → Proposed → Signed → Invoiced
 *
 * Each card links back to the WA conversation it originated from,
 * and shows the linked shared.document (devis / contrat) if one exists.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import {
  Search, MessageCircle, FileText, CheckCircle2,
  Clock, TrendingUp, Plus, ExternalLink, Loader2, AlertCircle,
} from 'lucide-react';

type EngagementStatus = 'discovery' | 'proposed' | 'signed' | 'invoiced' | 'lost';

interface Engagement {
  id: string;
  title: string | null;
  description: string | null;
  amount: number | null;
  currency: string;
  status: EngagementStatus;
  source_id: string | null;     // conversation_id
  updated_at: string;
  contact?: { full_name: string | null; phone: string | null };
  document?: { id: string; type: string; status: string; title: string };
}

const COLUMNS: { id: EngagementStatus; label: string; color: string; icon: typeof Clock }[] = [
  { id: 'discovery', label: 'Découverte',  color: 'border-blue-200 bg-blue-50',   icon: MessageCircle },
  { id: 'proposed',  label: 'Proposé',     color: 'border-amber-200 bg-amber-50', icon: FileText      },
  { id: 'signed',    label: 'Signé',       color: 'border-green-200 bg-green-50', icon: CheckCircle2  },
  { id: 'invoiced',  label: 'Facturé',     color: 'border-purple-200 bg-purple-50',icon: TrendingUp   },
];

const STATUS_BADGE: Record<EngagementStatus, string> = {
  discovery: 'bg-blue-100 text-blue-700',
  proposed:  'bg-amber-100 text-amber-700',
  signed:    'bg-green-100 text-green-700',
  invoiced:  'bg-purple-100 text-purple-700',
  lost:      'bg-neutral-100 text-neutral-500',
};

const IS_PROD = typeof window !== 'undefined' && window.location.hostname.endsWith('pretalk.me');
const CRM_BASE = IS_PROD ? 'https://pretalk.me/app' : 'http://localhost:5174';

export default function ServiceCases() {
  const { tenant } = useApp() as any;
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Guard — redirect if not freelance mode
  useEffect(() => {
    if (tenant && tenant.mode_freelance === false) {
      navigate('/', { replace: true });
    }
  }, [tenant]);

  useEffect(() => {
    if (!tenant?.id) return;
    fetchEngagements();
  }, [tenant?.id]);

  async function fetchEngagements() {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .schema('shared')
        .from('engagements')
        .select(`
          id, title, description, amount, currency, status, source_id, updated_at,
          contact:contacts ( full_name, phone )
        `)
        .eq('tenant_id', tenant.id)
        .neq('status', 'lost')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch linked documents
      const enriched = await Promise.all(
        (data || []).map(async (eng: any) => {
          const { data: docs } = await (supabase as any)
            .schema('shared')
            .from('documents')
            .select('id, type, status, title')
            .eq('engagement_id', eng.id)
            .order('created_at', { ascending: false })
            .limit(1);
          return { ...eng, document: docs?.[0] || null };
        })
      );
      setEngagements(enriched);
    } catch (err) {
      console.error('ServiceCases fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function moveEngagement(id: string, newStatus: EngagementStatus) {
    setEngagements(prev =>
      prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
    );
    await (supabase as any)
      .schema('shared')
      .from('engagements')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  const filtered = engagements.filter(e =>
    !search ||
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.contact?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.contact?.phone?.includes(search)
  );

  const total = engagements
    .filter(e => e.status === 'invoiced' && e.amount)
    .reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111B21]">Dossiers de Service</h1>
          <p className="text-[#54656F] text-sm mt-0.5">Pipeline freelance — de la découverte à la facturation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-2">
            <p className="text-xs text-[#54656F] font-medium">Total facturé</p>
            <p className="text-lg font-bold text-[#00A884]">{total.toLocaleString('fr-MA')} {engagements[0]?.currency || 'MAD'}</p>
          </div>
          <a
            href={`${CRM_BASE}/leads`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D7DB] rounded-xl text-sm font-medium text-[#54656F] hover:border-[#00A884]/40 hover:text-[#00A884] transition-all"
          >
            <ExternalLink size={14} />
            Ouvrir dans Consultant
          </a>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696A0]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un dossier…"
          className="w-full pl-9 pr-4 py-2 border border-[#D1D7DB] rounded-xl text-sm bg-white focus:outline-none focus:border-[#00A884]/60"
        />
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#8696A0] gap-2">
          <Loader2 size={20} className="animate-spin" />
          Chargement des dossiers…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {COLUMNS.map(({ id: colId, label, color, icon: ColIcon }) => {
            const cards = filtered.filter(e => e.status === colId);
            return (
              <div
                key={colId}
                className={`rounded-2xl border-2 p-3 min-h-[400px] flex flex-col gap-3 ${color}`}
                onDragOver={e => e.preventDefault()}
                onDrop={() => draggingId && moveEngagement(draggingId, colId)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <ColIcon size={14} className="text-[#54656F]" />
                    <span className="text-sm font-bold text-[#111B21]">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#8696A0] bg-white/60 px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                {cards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-[#8696A0] italic text-center">Aucun dossier</p>
                  </div>
                )}
                {cards.map(eng => (
                  <EngagementCard
                    key={eng.id}
                    engagement={eng}
                    onDragStart={() => setDraggingId(eng.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}

                {/* Add placeholder */}
                {colId === 'discovery' && (
                  <button
                    className="mt-auto flex items-center gap-2 text-xs text-[#8696A0] hover:text-[#00A884] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/60"
                    onClick={() => {/* TODO: create from conversation */}}
                  >
                    <Plus size={12} />
                    Depuis une conversation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EngagementCard({
  engagement: eng,
  onDragStart,
  onDragEnd,
}: {
  engagement: Engagement;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const WA_BASE = IS_PROD ? 'https://app.pretalk.me' : 'http://localhost:5173';
  const DOC_ICON: Record<string, typeof FileText> = { proposal: FileText, contract: CheckCircle2, invoice: TrendingUp };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl border border-[#E9EDEF] p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2"
    >
      {/* Title & name */}
      <div>
        <p className="text-sm font-semibold text-[#111B21] leading-tight line-clamp-1">
          {eng.title || eng.contact?.full_name || 'Nouveau dossier'}
        </p>
        {eng.contact?.full_name && (
          <p className="text-xs text-[#54656F] truncate mt-0.5">{eng.contact.phone}</p>
        )}
      </div>

      {/* Amount */}
      {eng.amount && (
        <p className="text-sm font-bold text-[#111B21]">
          {eng.amount.toLocaleString('fr-MA')} <span className="font-normal text-[#8696A0]">{eng.currency}</span>
        </p>
      )}

      {/* Document badge */}
      {eng.document && (() => {
        const DocIcon = DOC_ICON[eng.document.type] || FileText;
        return (
          <div className="flex items-center gap-1.5 bg-[#F0F2F5] px-2 py-1 rounded-lg w-fit">
            <DocIcon size={11} className="text-[#54656F]" />
            <span className="text-[10px] font-semibold text-[#54656F] uppercase tracking-wide">
              {eng.document.type === 'proposal' ? 'Devis' : eng.document.type === 'contract' ? 'Contrat' : 'Facture'}
            </span>
            <span className={`text-[9px] px-1 rounded font-bold uppercase ${
              eng.document.status === 'signed' || eng.document.status === 'paid'
                ? 'text-green-600 bg-green-50'
                : 'text-amber-600 bg-amber-50'
            }`}>
              {eng.document.status}
            </span>
          </div>
        );
      })()}

      {/* Footer: date + WA link */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-[#8696A0]">
          {new Date(eng.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
        {eng.source_id && (
          <a
            href={`${WA_BASE}/whatsapp/inbox?conversation=${eng.source_id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-[#00A884] hover:underline font-medium"
          >
            <MessageCircle size={10} />
            Conversation
          </a>
        )}
      </div>
    </div>
  );
}
