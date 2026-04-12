#!/usr/bin/env python3
# Fix MyProfile.tsx, Templates.tsx, Finances.tsx, Sidebar.tsx

files_fixes = {
    'src/components/ReactApp/pages/MyProfile.tsx': [
        # VisibilityToggle
        ('text-[10px] font-black uppercase tracking-wider', 'text-xs'),
        # Sticky h1
        ('text-base font-black text-dark tracking-tight leading-none uppercase tracking-tighter', 'text-sm font-semibold text-dark leading-none'),
        # Username span
        ('text-[10px] font-bold text-neutral-400 font-mono truncate max-w-[120px]', 'text-xs text-neutral-400 font-mono truncate max-w-[120px]'),
        # Preview button
        ('bg-white hover:bg-neutral-50 border border-neutral-100 text-dark rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm', 'bg-white hover:bg-neutral-50 border border-neutral-100 text-dark rounded-xl text-sm transition-all active:scale-95 shadow-sm'),
        # Save button
        ('bg-dark text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105', 'bg-dark text-white rounded-xl text-sm hover:scale-105'),
        # Card border radius
        ('bg-white rounded-[2.5rem] border border-neutral-100 p-8 shadow-sm', 'bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm'),
        # Section heading
        ('text-sm font-black text-dark uppercase tracking-tight text-left', 'text-sm font-semibold text-dark text-left'),
        ('text-sm font-black text-dark uppercase tracking-tight">', 'text-sm font-semibold text-dark">'),
        # Sub-label
        ('text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5 text-left', 'text-xs text-neutral-400 mt-0.5 text-left'),
        # Add social button
        ('text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-40', 'text-xs rounded-xl transition-all disabled:opacity-40'),
        # Select dropdown inside social links
        ('text-xs font-black bg-transparent outline-none w-28 shrink-0 text-dark uppercase tracking-wider cursor-pointer', 'text-xs bg-transparent outline-none w-28 shrink-0 text-dark cursor-pointer'),
        # Social link input
        ('flex-1 min-w-0 px-4 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl', 'flex-1 min-w-0 px-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl'),
    ],
    'src/components/ReactApp/pages/Templates.tsx': [
        # H1
        ('text-2xl md:text-4xl font-black text-dark tracking-tight leading-none', 'page-title'),
        # Design sur mesure button
        ('bg-dark text-white rounded-2xl text-sm font-black hover:bg-neutral-800', 'bg-dark text-white rounded-xl text-sm hover:bg-neutral-800'),
        # Empty state
        ('p-8 bg-neutral-50 rounded-[2.5rem] text-neutral-200 shadow-inner', 'p-6 bg-neutral-50 rounded-2xl text-neutral-200 shadow-inner'),
        ('text-xl font-black text-dark">', 'text-lg font-semibold text-dark">'),
        # Template cards
        ('bg-white border border-neutral-100 rounded-[2.5rem] overflow-hidden', 'bg-white border border-neutral-100 rounded-2xl overflow-hidden'),
        # Actif badge
        ('text-[10px] font-black uppercase tracking-wider">Actif', 'text-xs">Actif'),
        # View button (hover)
        ('bg-white text-dark rounded-2xl font-black text-xs shadow-2xl', 'bg-white text-dark rounded-xl text-sm shadow-lg'),
        # Template tags
        ('text-[10px] font-black rounded-lg border border-white shadow-sm uppercase tracking-tight', 'text-xs rounded-lg border border-white shadow-sm'),
        # Template name
        ('text-xl font-black text-dark tracking-tight leading-tight group-hover:text-primary-600 transition-colors uppercase', 'text-base font-semibold text-dark leading-tight group-hover:text-primary-600 transition-colors'),
        # Template description
        ('text-[11px] text-neutral-400 font-bold leading-relaxed line-clamp-2 mt-1 italic', 'text-xs text-neutral-400 leading-relaxed line-clamp-2 mt-1'),
        # Activate button
        ("rounded-2xl font-black text-xs transition-all active:scale-95", "rounded-xl text-sm transition-all active:scale-95"),
        # Divider labels
        ('text-[11px] font-black text-neutral-400 uppercase tracking-widest leading-none', 'text-xs text-neutral-400 leading-none'),
        ('text-[11px] font-black text-neutral-300 uppercase tracking-widest', 'text-xs text-neutral-300'),
        # Custom design card
        ('bg-dark border border-white/10 rounded-[2.5rem] p-8 md:p-12', 'bg-dark border border-white/10 rounded-2xl p-8 md:p-12'),
        # Service Premium badge
        ('text-[9px] font-black rounded-full uppercase tracking-[0.2em]', 'text-xs rounded-full'),
        # Design On-Demand label
        ('text-white/40 text-[9px] font-black uppercase tracking-[0.2em]', 'text-white/40 text-xs'),
        # Custom design h4
        ('text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1]', 'text-xl md:text-2xl font-semibold text-white leading-[1.1]'),
        # Custom design button
        ('bg-white text-dark rounded-2xl font-black text-sm hover:scale-105', 'bg-white text-dark rounded-xl text-sm hover:scale-105'),
        # Modal
        ('rounded-t-[1.5rem] md:rounded-[2rem] shadow-2xl', 'rounded-t-2xl md:rounded-2xl shadow-2xl'),
        ('w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-[1.5rem] md:rounded-[2rem]', 'w-14 h-14 md:w-16 md:h-16 bg-emerald-50 rounded-xl'),
        ('text-xl md:text-2xl font-black text-dark', 'text-xl font-semibold text-dark'),
        ('text-xs text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl', 'text-xs text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl'),
        ('text-base md:text-xl font-black text-dark tracking-tight', 'text-base font-semibold text-dark'),
        # Form label in modal
        ('text-[10px] font-bold text-neutral-400 mb-1.5 md:mb-2 block flex items-center gap-1.5 leading-none', 'field-label mb-1.5 md:mb-2 block flex items-center gap-1.5 leading-none'),
    ],
    'src/components/ReactApp/pages/Finances.tsx': [
        # H1
        ('text-xl sm:text-2xl font-black text-dark tracking-tight', 'page-title'),
        # Loading
        ('text-xs font-bold text-neutral-400', 'text-xs text-neutral-400'),
        # KPI labels
        ('text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wide', 'text-xs text-neutral-500'),
        # KPI values
        ('text-xl sm:text-2xl font-black text-dark tracking-tight leading-none', 'text-xl sm:text-2xl font-semibold text-dark leading-none'),
        # KPI trend
        ('mt-1.5 text-[10px] font-bold', 'mt-1.5 text-xs'),
        ('text-[10px] font-bold text-neutral-400 mt-1.5', 'text-xs text-neutral-400 mt-1.5'),
        # Chart headers
        ('text-sm font-black text-dark">', 'text-sm font-medium text-dark">'),
        # Period badge
        ('text-[9px] font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-lg uppercase', 'text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded-lg'),
        # Table header
        ('text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50/50', 'text-xs text-neutral-400 bg-neutral-50/50'),
        # Avatar font
        ('bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px] shrink-0', 'bg-primary-50 text-primary-600 flex items-center justify-center text-xs shrink-0'),
        # Name
        ('text-xs font-bold text-dark truncate max-w-[120px]', 'text-xs text-dark truncate max-w-[120px]'),
        # Amount
        ('text-xs font-black text-dark">', 'text-xs font-semibold text-dark">'),
        # Paid/pending badge — important: use template literal pattern
        ("text-[9px] font-bold uppercase ${deal.status", "text-xs ${deal.status"),
        # Pagination
        ('text-[10px] font-bold text-neutral-400">', 'text-xs text-neutral-400">'),
        # Chart value
        ('font-black text-dark">', 'font-semibold text-dark">'),
    ],
    'src/components/ReactApp/components/layout/Sidebar.tsx': [
        # Section labels (dark sidebar, keep text-white/35 for contrast)
        ('text-[10px] font-bold text-neutral-400 group-hover:text-neutral-200 transition-colors uppercase tracking-wider', 'text-[10px] text-white/35 transition-colors'),
        ('text-[10px] font-bold text-neutral-400 uppercase tracking-wider', 'text-[10px] text-white/35'),
        # Nav badge
        ('text-[10px] font-bold px-2 py-0.5 rounded-full', 'text-[10px] px-2 py-0.5 rounded-full'),
    ],
}

for filepath, replacements in files_fixes.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = 0
    for old, new in replacements:
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            changed += count
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'{filepath}: {changed} replacements, font-black left: {content.count("font-black")}, uppercase left: {content.count("uppercase")}')

print('All done.')
