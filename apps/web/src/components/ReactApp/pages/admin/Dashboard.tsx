import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  Users, CreditCard, Calendar as CalendarIcon, Bot,
  ArrowUpRight, ArrowDownRight, Edit2, Check,
  Search, ChevronLeft, ChevronRight, Clock, Calendar,
  ChevronDown, X, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_LAYOUT = {
  lg: [
    { i: 'kpi1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi3', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi4', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'list1', x: 0, y: 2, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'chart1', x: 6, y: 2, w: 6, h: 5, minW: 5, minH: 4 },
    { i: 'chart2', x: 0, y: 7, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'list2', x: 6, y: 7, w: 6, h: 5, minW: 5, minH: 4 },
    { i: 'factory', x: 0, y: 12, w: 4, h: 4, minW: 4, minH: 4 },
    { i: 'ai_agents', x: 4, y: 12, w: 4, h: 4, minW: 4, minH: 4 },
    { i: 'ai_models', x: 8, y: 12, w: 4, h: 4, minW: 4, minH: 4 },
  ]
};

const WIDGET_TITLES: Record<string, string> = {
  kpi1: 'Total Utilisateurs',
  kpi2: 'Abonnements Actifs',
  kpi3: 'Rendez-vous Totaux',
  kpi4: 'Leads Capturés',
  list1: 'Rendez-vous Récents',
  chart1: 'Croissance Audience',
  chart2: 'Rendez-vous / Jour',
  list2: 'Formulaires Populaires',
  factory: 'Factory (Forms)',
  ai_agents: 'Agents IA utilisés',
  ai_models: 'Modèles IA utilisés'
};

// --- Dummy Data for Charts ---
const areaData = [
  { name: 'Mon', value: 20 },
  { name: 'Tue', value: 65 },
  { name: 'Wed', value: 10 },
  { name: 'Thu', value: 60 },
  { name: 'Fri', value: 140 },
  { name: 'Sat', value: 50 },
  { name: 'Sun', value: 130 },
];

const barData = [
  { name: 'Mon', val: 40 },
  { name: 'Tue', val: 20 },
  { name: 'Wed', val: 32 },
  { name: 'Thu', val: 60 },
  { name: 'Fri', val: 33 },
  { name: 'Sat', val: 39 },
  { name: 'Sun', val: 39 },
];

// Reusable Segmented Control
const DateRangePicker = ({ startDate, endDate, onApply, onCancel }: {
  startDate: Date,
  endDate: Date,
  onApply: (start: Date, end: Date) => void,
  onCancel: () => void
}) => {
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [viewMonth, setViewMonth] = useState(new Date(tempStart.getFullYear(), tempStart.getMonth(), 1));

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
      <div className="flex-1 min-w-[320px]">
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-[17px] font-semibold text-dark">{monthNames[month]} {year}</span>
          <div className="flex gap-2">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <span key={d} className="text-[12px] font-semibold text-neutral-400 py-3">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const current = new Date(year, month, day);
            const isSelected = (tempStart && current.getTime() === tempStart.getTime()) || (tempEnd && current.getTime() === tempEnd.getTime());
            const isInRange = tempStart && tempEnd && current > tempStart && current < tempEnd;

            return (
              <button
                key={day}
                onClick={() => {
                  if (!tempStart || (tempStart && tempEnd)) {
                    setTempStart(current);
                    setTempEnd(null as any);
                  } else if (current < tempStart) {
                    setTempEnd(tempStart);
                    setTempStart(current);
                  } else {
                    setTempEnd(current);
                  }
                }}
                className={`text-[14px] font-bold w-10 h-10 rounded-xl transition-all flex items-center justify-center
                                    ${isSelected ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' :
                    isInRange ? 'bg-primary-50 text-primary-600' :
                      'text-dark hover:bg-neutral-100'}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-full mt-4 right-0 bg-white border border-neutral-200 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-[100] p-10 animate-in fade-in slide-in-from-top-4 w-[780px] max-w-[95vw] border-t-8 border-t-primary-500">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6 border-b border-neutral-100 pb-10">
        <div className="flex items-center gap-6 bg-neutral-50 px-8 py-5 rounded-[28px] border border-neutral-100 shadow-inner">
          <div className="flex flex-col">
            <span className="text-xs  font-semibold text-neutral-400 tracking-widest mb-1">From</span>
            <span className="text-[16px] font-semibold text-dark">{tempStart ? tempStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select...'}</span>
          </div>
          <div className="w-10 h-[2px] bg-neutral-200 mx-2 rounded-full" />
          <div className="flex flex-col">
            <span className="text-xs  font-semibold text-neutral-400 tracking-widest mb-1">To</span>
            <span className="text-[16px] font-semibold text-dark">{tempEnd ? tempEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select...'}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => { setTempStart(new Date()); setTempEnd(new Date()); }} className="text-[14px] font-semibold text-neutral-400 hover:text-dark transition-colors">Clear All</button>
          <button onClick={onCancel} className="px-7 py-3 text-[14px] font-bold text-neutral-500 hover:bg-neutral-50 rounded-2xl transition-all">Cancel</button>
          <button
            onClick={() => tempStart && tempEnd && onApply(tempStart, tempEnd)}
            disabled={!tempStart || !tempEnd}
            className="px-10 py-3.5 bg-primary-600 text-white text-[14px] font-semibold rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Apply Range
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <label className="text-[12px] font-semibold text-neutral-400  tracking-[0.25em] mb-6 block">Select START Date</label>
          {renderCalendar(viewMonth)}
        </div>
        <div className="flex-1">
          <label className="text-[12px] font-semibold text-neutral-400  tracking-[0.25em] mb-6 block">Select END Date</label>
          {renderCalendar(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-neutral-50">
      <button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs font-bold text-neutral-500">{current} / {total}</span>
      <button
        onClick={() => onPageChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalBookings: 0,
    totalLeads: 0,
    totalForms: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [popularForms, setPopularForms] = useState<any[]>([]);
  const [agentUsage, setAgentUsage] = useState<any[]>([]);
  const [modelUsage, setModelUsage] = useState<any[]>([]);
  const [templateUsage, setTemplateUsage] = useState<any[]>([]);
  const [totalTemplateUsage, setTotalTemplateUsage] = useState(0);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [bookingsByDay, setBookingsByDay] = useState<any[]>([]);
  const [customRange, setCustomRange] = useState<{ start: Date, end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pages, setPages] = useState({
    bookings: 1,
    forms: 1,
    agents: 1,
    models: 1,
    templates: 1
  });
  const ITEMS_PER_PAGE = 5;

  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetStore, setShowWidgetStore] = useState(false);
  const [layouts, setLayouts] = useState<any>(DEFAULT_LAYOUT);

  useEffect(() => {
    // Load saved layout
    const savedLayout = localStorage.getItem('admin_dashboard_layout');
    if (savedLayout) {
      try { setLayouts(JSON.parse(savedLayout)); } catch (e) { }
    }
    fetchStats();
    fetchRecentBookings();

    // Real-time subscriptions
    const profilesChannel = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
      .subscribe();

    const bookingsChannel = supabase.channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchStats();
        fetchRecentBookings();
      })
      .subscribe();

    const leadsChannel = supabase.channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(leadsChannel);
    };
  }, [customRange]); // Re-fetch on customRange change

  const fetchRecentBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setRecentBookings(data);
  };

  const fetchStats = async () => {
    try {
      const startDateISO = customRange.start.toISOString();
      const endDateISO = customRange.end.toISOString();

      const [
        { count: usersCount, data: usersData },
        { count: subsCount },
        { count: bookingsCount, data: bookingsData },
        { count: leadsCount },
        { data: formsData, count: formsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }).gte('created_at', startDateISO).lte('created_at', endDateISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').gte('created_at', startDateISO).lte('created_at', endDateISO),
        supabase.from('bookings').select('scheduled_at', { count: 'exact' }).gte('scheduled_at', startDateISO).lte('scheduled_at', endDateISO),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', startDateISO).lte('created_at', endDateISO),
        supabase.from('forms').select('*', { count: 'exact' }).order('leads_count', { ascending: false }).limit(10)
      ]);

      setStats({
        totalUsers: usersCount || 0,
        activeSubscriptions: subsCount || 0,
        totalBookings: bookingsCount || 0,
        totalLeads: leadsCount || 0,
        totalForms: formsCount || 0,
      });

      // Process Popular Forms
      if (formsData) {
        setPopularForms(formsData.map(f => ({
          id: f.id,
          name: f.title || 'Untitled',
          val1: f.views_count > 0 ? Math.round((f.leads_count / f.views_count) * 100) + '%' : '0%',
          val2: f.leads_count.toLocaleString()
        })));

        // AI Models usage extraction
        const models: Record<string, number> = {};
        formsData.forEach((f: any) => {
          const model = f.ai_config?.model || 'GPT-4o';
          models[model] = (models[model] || 0) + 1;
        });
        setModelUsage(Object.entries(models).map(([name, count]) => ({ name, count })));
      }

      // Process Growth Data
      if (usersData) {
        const diffTime = Math.abs(customRange.end.getTime() - customRange.start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const rangeDays = diffDays <= 7 ? 7 : diffDays;

        const days: Record<string, number> = {};
        const dates = [...Array(rangeDays)].map((_, i) => {
          const d = new Date(customRange.start);
          d.setDate(d.getDate() + i);
          return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        });
        dates.forEach(date => days[date] = 0);

        usersData.forEach(u => {
          const date = new Date(u.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
          if (days[date] !== undefined) days[date]++;
        });
        setGrowthData(Object.entries(days).map(([name, value]) => ({ name, value })));
      }

      // Process Bookings per day
      if (bookingsData) {
        const diffTime = Math.abs(customRange.end.getTime() - customRange.start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const rangeDays = diffDays <= 7 ? 7 : diffDays;

        const bDays: Record<string, number> = {};
        const dates = [...Array(rangeDays)].map((_, i) => {
          const d = new Date(customRange.start);
          d.setDate(d.getDate() + i);
          return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        });
        dates.forEach(date => bDays[date] = 0);

        bookingsData.forEach(b => {
          const date = new Date(b.scheduled_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
          if (bDays[date] !== undefined) bDays[date]++;
        });
        setBookingsByDay(Object.entries(bDays).map(([name, val]) => ({ name, val })));
      }

      // Fetch Agents usage
      const { data: installedAgents } = await supabase.from('user_installed_agents').select('agent_id');
      const { data: agentsLib } = await supabase.from('agents_library').select('id, name');
      if (installedAgents && agentsLib) {
        const counts: Record<number, number> = {};
        installedAgents.forEach(ia => counts[ia.agent_id] = (counts[ia.agent_id] || 0) + 1);
        setAgentUsage(agentsLib.map(a => ({
          name: a.name,
          count: counts[a.id] || 0
        })).sort((a, b) => b.count - a.count));
      }

      // Fetch Template usage
      const { data: allTemplates } = await supabase.from('pdf_templates').select('id, name');
      const { data: formsWithTemplates } = await supabase.from('forms').select('pdf_template_id').not('pdf_template_id', 'is', null);

      if (allTemplates && formsWithTemplates) {
        const counts: Record<string, number> = {};
        formsWithTemplates.forEach(f => {
          if (f.pdf_template_id) counts[f.pdf_template_id] = (counts[f.pdf_template_id] || 0) + 1;
        });

        const usageData = allTemplates.map(t => ({
          name: t.name,
          count: counts[t.id] || 0
        })).sort((a, b) => b.count - a.count);

        setTemplateUsage(usageData);
        setTotalTemplateUsage(formsWithTemplates.length);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const onLayoutChange = (_currentLayout: Layout, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem('admin_dashboard_layout', JSON.stringify(allLayouts));
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUT);
    localStorage.removeItem('admin_dashboard_layout');
  };

  const removeWidget = (id: string) => {
    const newLayout = {
      ...layouts,
      lg: layouts.lg.filter((w: any) => w.i !== id)
    };
    setLayouts(newLayout);
    localStorage.setItem('admin_dashboard_layout', JSON.stringify(newLayout));
  };

  const addWidget = (id: string) => {
    if (layouts.lg.some((w: any) => w.i === id)) return;
    const newWidget: any = { i: id, x: 0, y: Infinity, w: 4, h: 4, minW: 4, minH: 4 };
    if (id.startsWith('kpi')) {
      newWidget.w = 3;
      newWidget.h = 2;
      newWidget.minW = 2;
      newWidget.minH = 2;
    }
    const newLayout = { ...layouts, lg: [...layouts.lg, newWidget] };
    setLayouts(newLayout);
    localStorage.setItem('admin_dashboard_layout', JSON.stringify(newLayout));
  };

  const renderKPI = (title: string, value: string | number, growth: string, isPositive: boolean, Icon: any, id: string, suffix = '') => (
    <div key={id} className={`w-full h-full bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-5 sm:p-6 flex flex-col justify-between group/kpi ${isEditing ? 'cursor-move ring-2 ring-primary-500 ring-offset-2' : ''}`}>
      {isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/kpi:opacity-100 transition-opacity z-10 shadow-lg"
        >
          ×
        </button>
      )}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[13px] font-bold text-neutral-500 tracking-wide">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-dark">
          <Icon size={14} />
        </div>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="text-3xl font-semibold text-dark tracking-tight leading-none mt-2 truncate max-w-full">
          {value}{suffix}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-1 whitespace-nowrap ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {growth}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-dark tracking-tight flex items-center gap-3">
            Tableau de bord
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-3 bg-white border border-neutral-200 rounded-full px-5 py-2.5 shadow-sm hover:bg-neutral-50 transition-all font-bold text-sm text-dark"
            >
              <Calendar size={16} className="text-primary-600" />
              <span>{customRange.start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {customRange.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
              <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
              <DateRangePicker
                startDate={customRange.start}
                endDate={customRange.end}
                onApply={(start, end) => {
                  setCustomRange({ start, end });
                  setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
              />
            )}
          </div>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
            />
          </div>
          {isEditing && (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowWidgetStore(!showWidgetStore)}
                className="px-4 py-2 rounded-full text-sm font-bold bg-white border border-neutral-200 text-primary-600 hover:bg-primary-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Bot size={16} /> Ajouter Widget
              </button>
              {showWidgetStore && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl z-[60] p-4 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-semibold text-neutral-400 mb-3">Widgets Disponibles</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(WIDGET_TITLES).filter(([id]) => !layouts.lg.some((w: any) => w.i === id)).map(([id, title]) => (
                      <button
                        key={id}
                        onClick={() => { addWidget(id); setShowWidgetStore(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-dark hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-between"
                      >
                        {title}
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={resetLayout}
                className="px-4 py-2 rounded-full text-sm font-bold bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm"
              >
                Défaut
              </button>
            </div>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${isEditing ? 'bg-primary-600 text-white' : 'bg-white border text-dark hover:bg-neutral-50'
              }`}
          >
            {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
            <span className="hidden sm:inline">{isEditing ? 'Terminer' : 'Personnaliser'}</span>
          </button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
      >
        {/* ROW 1: KPIs */}
        <div key="kpi1">
          {renderKPI("Utilisateurs", stats.totalUsers.toLocaleString(), "3.67", true, Users, "kpi1")}
        </div>
        <div key="kpi2">
          {renderKPI("Abonnements", stats.activeSubscriptions.toLocaleString(), "2.87", false, CreditCard, "kpi2")}
        </div>
        <div key="kpi3">
          {renderKPI("Rendez-vous", stats.totalBookings.toLocaleString(), "2.54", true, CalendarIcon, "kpi3")}
        </div>
        <div key="kpi4">
          {renderKPI("Leads Capturés", stats.totalLeads.toLocaleString(), "1.37", false, Bot, "kpi4", "%")}
        </div>

        {/* Rendez-vous Récents */}
        <div key="list1" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-6 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); removeWidget('list1'); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 shadow-lg"
            >
              ×
            </button>
          )}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-semibold text-dark tracking-tight">Rendez-vous Récents</h3>
            <button className="text-xs font-bold text-neutral-500 hover:text-dark transition-colors">Voir Tout</button>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {recentBookings.length > 0 ? recentBookings.slice((pages.bookings - 1) * ITEMS_PER_PAGE, pages.bookings * ITEMS_PER_PAGE).map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary-50 flex items-center justify-center font-bold text-primary-600 text-xs ">
                      {item.guest_name?.substring(0, 2) || '??'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-dark text-sm leading-tight mb-0.5 truncate">{item.guest_name || 'Anonyme'}</div>
                      <div className="text-xs font-medium text-neutral-400 flex gap-2 whitespace-nowrap">
                        <span>{new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> • <span>{item.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${item.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <CalendarIcon size={24} className="mb-2" />
                  <p className="text-xs font-bold">Aucun rendez-vous</p>
                </div>
              )}
            </div>
            <Pagination
              current={pages.bookings}
              total={Math.ceil(recentBookings.length / ITEMS_PER_PAGE)}
              onPageChange={(p) => setPages({ ...pages, bookings: p })}
            />
          </div>
        </div>

        {/* Croissance Area Chart */}
        <div key="chart1" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-6 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); removeWidget('chart1'); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 shadow-lg"
            >
              ×
            </button>
          )}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-semibold text-dark tracking-tight flex items-center gap-2">Croissance d'Audience <span className="text-xs text-neutral-400 font-bold">(Users)</span></h3>
          </div>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.length > 0 ? growthData : areaData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 700, color: '#111827' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rendez-vous / Jour */}
        <div key="chart2" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-6 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); removeWidget('chart2'); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 shadow-lg"
            >
              ×
            </button>
          )}
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[15px] font-semibold text-dark tracking-tight">Rendez-vous par Jour</h3>
          </div>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsByDay.length > 0 ? bookingsByDay : barData} barSize={12}>
                <defs>
                  <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                      style={{ stroke: '#0d9488', strokeWidth: 1 }} />
                  </pattern>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <Tooltip cursor={{ fill: '#f3f4f6', radius: 4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="val" fill="url(#diagonalHatch)" radius={[6, 6, 6, 6]} stroke="#0d9488" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formulaires Populaires */}
        <div key="list2" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-6 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); removeWidget('list2'); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/widget:opacity-100 transition-opacity z-10 shadow-lg"
            >
              ×
            </button>
          )}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-semibold text-dark tracking-tight">Formulaires Populaires</h3>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center text-xs font-bold text-neutral-400 px-2">
                <div className="flex-1">Nom du Flux</div>
                <div className="w-24 text-right">Taux Conv.</div>
                <div className="w-24 text-right">Leads</div>
              </div>
              {popularForms.slice((pages.forms - 1) * ITEMS_PER_PAGE, pages.forms * ITEMS_PER_PAGE).map((item, i) => (
                <div key={item.id} className="flex items-center px-2 py-1 group hover:bg-neutral-50 rounded-lg transition-colors -mx-2">
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-xs shadow-sm flex-shrink-0">
                      {((pages.forms - 1) * ITEMS_PER_PAGE) + i + 1}
                    </div>
                    <div className="font-bold text-dark text-[13px] truncate">{item.name}</div>
                  </div>
                  <div className="w-24 text-right font-medium text-neutral-500 text-[13px]">{item.val1}</div>
                  <div className="w-24 text-right font-semibold text-dark text-[13px] tracking-tight">{item.val2}</div>
                </div>
              ))}
            </div>
            <Pagination
              current={pages.forms}
              total={Math.ceil(popularForms.length / ITEMS_PER_PAGE)}
              onPageChange={(p) => setPages({ ...pages, forms: p })}
            />
          </div>
        </div>

        {/* FACTORY WIDGET - Templates PDF Stats */}
        <div key="factory" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-5 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button onClick={(e) => { e.stopPropagation(); removeWidget('factory'); }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center z-10 shadow-lg">×</button>
          )}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-semibold text-dark tracking-tight flex items-center gap-2 truncate pr-2">
              <span className="truncate">Factory PDF</span>
              <span className="text-xs text-neutral-400 font-bold whitespace-nowrap">Utilisations</span>
            </h3>
            <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg whitespace-nowrap">{totalTemplateUsage} Global</div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {templateUsage.slice((pages.templates - 1) * ITEMS_PER_PAGE, pages.templates * ITEMS_PER_PAGE).map((template, i) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <div className="text-[12px] font-bold text-dark truncate mr-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                    {template.name}
                  </div>
                  <div className="text-[12px] font-semibold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-md">{template.count}</div>
                </div>
              ))}
            </div>
            <Pagination
              current={pages.templates}
              total={Math.max(1, Math.ceil(templateUsage.length / ITEMS_PER_PAGE))}
              onPageChange={(p) => setPages({ ...pages, templates: p })}
            />
          </div>
        </div>

        {/* AI AGENTS WIDGET - Chart Format */}
        <div key="ai_agents" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-6 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button onClick={(e) => { e.stopPropagation(); removeWidget('ai_agents'); }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center z-10 shadow-lg">×</button>
          )}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-semibold text-dark tracking-tight truncate mr-2">Utilisation par Agent</h3>
          </div>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentUsage.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#111827' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {agentUsage.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index === 1 ? '#0ea5e9' : index === 2 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI MODELS WIDGET */}
        <div key="ai_models" className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-100 p-5 flex flex-col overflow-hidden group/widget ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2 cursor-move' : ''}`}>
          {isEditing && (
            <button onClick={(e) => { e.stopPropagation(); removeWidget('ai_models'); }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center z-10 shadow-lg">×</button>
          )}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-semibold text-dark tracking-tight truncate mr-2">Modèles IA utilisés</h3>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 pr-1">
              {modelUsage.slice((pages.models - 1) * ITEMS_PER_PAGE, pages.models * ITEMS_PER_PAGE).map((model, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-[13px] font-bold text-dark truncate mr-2">{model.name}</div>
                  <div className="text-[13px] font-semibold text-dark bg-neutral-100 px-2 py-0.5 rounded-lg whitespace-nowrap">{model.count} instances</div>
                </div>
              ))}
            </div>
            <Pagination
              current={pages.models}
              total={Math.ceil(modelUsage.length / ITEMS_PER_PAGE)}
              onPageChange={(p) => setPages({ ...pages, models: p })}
            />
          </div>
        </div>
      </ResponsiveGridLayout>

      {/* Editing Overlay notification */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark/90 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 font-medium text-sm z-50 animate-fade-in border border-white/10">
          <Edit2 size={16} className="text-primary-400" />
          Mode édition : glissez-déposez ou redimensionnez les widgets
        </div>
      )}
    </div>
  );
}
