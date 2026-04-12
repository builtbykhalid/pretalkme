#!/usr/bin/env python3
# Fix Settings.tsx - pass 2: remaining sections and modals

with open('src/components/ReactApp/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

replacements = [
    # Username line missed due to quotes
    ("text-sm font-bold text-neutral-400 uppercase tracking-widest", "text-sm text-neutral-400"),
    # PRO badge
    ("bg-dark text-white text-xs font-black px-3 py-1 rounded-lg ml-2 align-middle", "bg-dark text-white text-xs px-3 py-1 rounded-lg ml-2 align-middle"),
    # Setting card panels with rounded-[2.5rem]
    ("rounded-[2.5rem] space-y-6 hover:shadow-xl transition-all group flex flex-col text-left", "rounded-2xl space-y-6 hover:shadow-xl transition-all group flex flex-col text-left"),
    ("rounded-[2.5rem] space-y-6 hover:shadow-xl transition-all group flex flex-col focus-within:ring-2 focus-within:ring-emerald-500/20 text-left", "rounded-2xl space-y-6 hover:shadow-xl transition-all group flex flex-col focus-within:ring-2 focus-within:ring-emerald-500/20 text-left"),
    # h4 headings in feature cards
    ('text-sm font-black text-dark uppercase tracking-tight">', 'text-sm font-medium text-dark">'),
    ('text-sm font-black text-dark uppercase tracking-tight leading-none">', 'text-sm font-medium text-dark leading-none">'),
    ('text-sm font-black text-rose-600 uppercase tracking-tight leading-none">', 'text-sm font-medium text-rose-600 leading-none">'),
    # Configurer/Gérer/Modify buttons in feature cards
    ('text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all', 'text-xs rounded-xl hover:bg-indigo-600 transition-all'),
    ('text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-neutral-100', 'text-xs rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-neutral-100'),
    ('text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-neutral-100', 'text-xs rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-neutral-100'),
    # locale/timezone
    ('text-[11px] text-neutral-400 font-bold leading-relaxed uppercase', 'text-xs text-neutral-400 leading-relaxed'),
    # Security section
    ('rounded-[3rem] border border-neutral-100 text-left shadow-inner', 'rounded-2xl border border-neutral-100 text-left shadow-inner'),
    ('text-lg font-black text-dark uppercase tracking-tight">', 'text-base font-semibold text-dark">'),
    # Security row cards
    ('rounded-3xl group gap-4 shadow-sm hover:border-neutral-200 transition-all', 'rounded-2xl group gap-4 shadow-sm hover:border-neutral-200 transition-all'),
    ('rounded-3xl group shadow-sm hover:border-neutral-200 transition-all', 'rounded-2xl group shadow-sm hover:border-neutral-200 transition-all'),
    ('rounded-3xl group hover:bg-rose-50 transition-all', 'rounded-2xl group hover:bg-rose-50 transition-all'),
    # Session/Assistance/Suppression buttons
    ('text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-100', 'text-xs rounded-xl transition-all border border-rose-100'),
    ('text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 shadow-dark/10', 'text-xs rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 shadow-dark/10'),
    ('text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-blue-100 flex items-center gap-2 leading-none', 'text-xs rounded-xl transition-all border border-blue-100 flex items-center gap-2 leading-none'),
    ('text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-200 shadow-sm active:scale-95', 'text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-200 shadow-sm active:scale-95'),
    # Toast notification
    ('rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-500', 'rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-500'),
    ('text-xs font-black uppercase tracking-widest">', 'text-xs">'),
    # Modal panels
    ('rounded-[3rem] p-10 w-full max-w-lg', 'rounded-2xl p-8 w-full max-w-lg'),
    # Modal icon container
    ('rounded-[1.8rem] flex items-center justify-center mx-auto mb-4', 'rounded-xl flex items-center justify-center mx-auto mb-4'),
    # Modal h3
    ('text-3xl font-black text-dark tracking-tight leading-none', 'text-xl font-semibold text-dark leading-none'),
    ('text-3xl font-black text-dark tracking-tight leading-none uppercase tracking-tighter', 'text-xl font-semibold text-dark leading-none'),
    # Modal cancel buttons
    ('flex-1 px-8 py-4 bg-neutral-50 hover:bg-neutral-100 text-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-neutral-100"', 'flex-1 px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-dark text-sm rounded-xl transition-all border border-neutral-100"'),
    # Modal submit buttons
    ('flex-1 px-8 py-4 bg-dark text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-dark/20"', 'flex-1 px-5 py-2.5 bg-dark text-white text-sm rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-dark/20"'),
    # Password mismatch warning
    ('text-[10px] font-black uppercase tracking-widest">', 'text-xs">'),
]

for old, new in replacements:
    count = content.count(old)
    content = content.replace(old, new)
    status = 'OK' if count > 0 else 'MISS'
    print(f'[{status}] {count}x: {old[:70]}')

with open('src/components/ReactApp/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone.')
print(f'font-black remaining: {content.count("font-black")}')
print(f'uppercase remaining: {content.count("uppercase")}')
