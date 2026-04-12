import os

files_replacements = {
    'src/components/ReactApp/pages/LeadReview.tsx': [
        ('text-[11px] font-black text-dark uppercase tracking-wider flex items-center gap-2', 'text-xs font-semibold text-dark flex items-center gap-2'),
        ('text-[9px] font-black px-2 py-0.5 rounded-full', 'text-xs px-2 py-0.5 rounded-full'),
        ('text-[10px] text-neutral-400 font-bold uppercase', 'text-xs text-neutral-400'),
        ('text-lg font-black text-dark', 'text-lg font-semibold text-dark'),
        ('text-[10px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20', 'text-sm hover:bg-emerald-600 transition-all'),
        ('text-[10px] font-bold text-neutral-400 uppercase', 'field-label'),
        ('text-[10px] font-black text-neutral-400 tracking-wider', 'text-xs text-neutral-400'),
        ('text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block', 'field-label mb-1.5 block'),
        ('text-2xl font-black text-dark tracking-tight uppercase', 'text-xl font-semibold text-dark'),
        ('text-neutral-400 font-bold text-[10px] uppercase tracking-widest mt-1', 'text-neutral-400 text-xs mt-1'),
        ('py-2 text-[10px] font-black rounded-lg transition-all', 'py-2 text-sm rounded-lg transition-all'),
        ('text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 block ml-1', 'field-label mb-1.5 block ml-1'),
        ('text-[9px] font-black text-emerald-800 uppercase tracking-widest', 'text-xs text-emerald-800'),
        ('text-[11px] font-black text-emerald-900 uppercase tracking-widest', 'text-xs font-medium text-emerald-900'),
        ('text-base font-black text-emerald-600', 'text-base font-semibold text-emerald-600'),
        ('flex-1 py-4 bg-white text-neutral-500 font-black text-xs rounded-2xl hover:bg-neutral-100 transition-all uppercase tracking-widest', 'flex-1 py-2.5 bg-white text-neutral-500 text-sm rounded-xl hover:bg-neutral-100 transition-all'),
        ('flex-[2] py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest disabled:opacity-50', 'flex-[2] py-2.5 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50'),
    ],
    'src/components/ReactApp/pages/FormBuilder.tsx': [
        ('text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-violet-100 text-violet-600 inline-block', 'text-xs px-3 py-1.5 rounded-xl bg-violet-100 text-violet-600 inline-block'),
        ('text-xs font-black text-neutral-400 uppercase tracking-widest', 'text-xs text-neutral-400'),
        ('text-sm md:text-base font-black text-primary-900 uppercase tracking-wider', 'text-sm md:text-base font-semibold text-primary-900'),
        ('text-[10px] text-primary-500 font-bold uppercase tracking-widest', 'text-xs text-primary-500'),
        ('text-xs text-neutral-300 font-black', 'text-xs text-neutral-300'),
        ('text-primary-500 text-xs font-black', 'text-primary-500 text-xs'),
        ('hidden sm:inline ml-2 px-2 py-0.5 text-[9px] font-black bg-primary-50 text-primary-600 rounded-full', 'hidden sm:inline ml-2 px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full'),
        ('text-[10px] font-bold text-neutral-400 mb-2 block uppercase tracking-widest', 'field-label mb-2 block'),
        ('flex items-center gap-2 px-4 py-2 bg-white border border-white text-primary-600 text-xs font-black rounded-xl hover:shadow-md transition-all mt-4', 'flex items-center gap-2 px-4 py-2 bg-white border border-white text-primary-600 text-xs rounded-xl hover:shadow-md transition-all mt-4'),
        ('py-6 md:py-8 border-2 border-dashed border-primary-200 bg-primary-50/20 text-primary-600 font-black text-xs rounded-2xl hover:bg-primary-50/50 hover:border-primary-400 group transition-all', 'py-6 md:py-8 border-2 border-dashed border-primary-200 bg-primary-50/20 text-primary-600 text-sm rounded-2xl hover:bg-primary-50/50 hover:border-primary-400 group transition-all'),
        ('py-6 md:py-8 border-2 border-dashed border-violet-200 bg-violet-50/20 text-violet-600 font-black text-xs rounded-2xl hover:bg-violet-50/50 hover:border-violet-400 group transition-all', 'py-6 md:py-8 border-2 border-dashed border-violet-200 bg-violet-50/20 text-violet-600 text-sm rounded-2xl hover:bg-violet-50/50 hover:border-violet-400 group transition-all'),
        ('text-sm font-black text-dark uppercase tracking-wider', 'text-sm font-semibold text-dark'),
        ('text-[10px] text-neutral-400 font-bold uppercase tracking-widest', 'text-xs text-neutral-400'),
        ('text-xs font-black text-dark uppercase tracking-widest', 'field-label'),
        ('text-xs font-black text-dark uppercase tracking-widest mb-2 block', 'field-label mb-2 block'),
    ],
    'src/components/ReactApp/pages/PublicForm.tsx': [
        # Skip .toUpperCase() JS calls — those are logic, not CSS
        ('text-2xl font-black', 'text-2xl font-semibold'),
        ('text-lg font-black', 'text-lg font-semibold'),
        ('text-[10px] font-black uppercase tracking-widest', 'text-xs'),
        ('font-black ${designConfig.buttonStyle}', 'font-medium ${designConfig.buttonStyle}'),
        ('text-xs font-black uppercase tracking-wider underline', 'text-xs underline'),
        ('block opacity-60 uppercase tracking-widest text-[9px] mb-0.5', 'block opacity-60 text-xs mb-0.5'),
        ('text-3xl font-black', 'text-3xl font-semibold'),
        ('inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm w-full mt-4 transition-all hover:scale-[1.02] shadow-xl', 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm w-full mt-4 transition-all hover:scale-[1.02] shadow-xl'),
        ('text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity', 'text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity'),
        ('font-black ${themeStyles.textColor}', 'font-semibold ${themeStyles.textColor}'),
    ],
    'src/components/ReactApp/pages/PublicProfile.tsx': [
        # Skip .toUpperCase() JS calls
        ('text-white text-3xl font-black', 'text-white text-3xl font-semibold'),
        ('font-black ${textColor} tracking-tight text-center leading-tight', 'font-semibold ${textColor} text-center leading-tight'),
        ('px-8 py-4.5 rounded-[20px] text-[15px] font-black shadow-2xl hover:scale-[1.03] transition-all active:scale-95', 'px-8 py-4 rounded-2xl text-base font-medium shadow-2xl hover:scale-[1.03] transition-all active:scale-95'),
        ('mt-10 text-[10px] font-black uppercase tracking-widest', 'mt-10 text-xs'),
        ('flex-1 py-2.5 px-5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap', 'flex-1 py-2.5 px-5 rounded-xl text-sm transition-all whitespace-nowrap'),
        ('text-xl font-black', 'text-xl font-semibold'),
        ('absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg', 'absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs shadow-lg'),
        ('text-white/40 text-xs font-bold uppercase tracking-[0.2em]', 'text-white/40 text-xs'),
        ('text-5xl md:text-6xl text-white font-black shadow-2xl border-2 border-white/10', 'text-5xl md:text-6xl text-white font-semibold shadow-2xl border-2 border-white/10'),
        ('text-3xl md:text-5xl font-black text-white tracking-tight leading-tight', 'text-3xl md:text-5xl font-semibold text-white leading-tight'),
        ('text-sm font-bold ${textColor} uppercase tracking-[0.2em] mb-6 text-center opacity-50', 'text-sm font-medium ${textColor} mb-6 text-center opacity-50'),
        ('text-[10px] text-white font-black uppercase tracking-wider', 'text-xs text-white'),
    ],
}

for path, replacements in files_replacements.items():
    with open(path, encoding='utf-8') as f:
        content = f.read()
    count = 0
    not_found = []
    for old, new in replacements:
        n = content.count(old)
        if n:
            content = content.replace(old, new)
            count += n
        else:
            not_found.append(old[:55])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    fb = content.count('font-black')
    uc = content.count('uppercase')
    print(f'{os.path.basename(path)}: {count} replacements. font-black={fb}, uppercase={uc}')
    if not_found:
        for nf in not_found:
            print(f'  NOT FOUND: {nf}')

print('All done.')
