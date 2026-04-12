#!/usr/bin/env python3
# Fix Settings.tsx UI unification

with open('src/components/ReactApp/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # VisibilityToggle on/off badge
    ('text-[10px] font-black uppercase tracking-wider', 'text-xs'),
    # Category badge "Gestion du compte"
    ('text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded', 'text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded'),
    # H1
    ('text-4xl font-black text-dark tracking-tight', 'page-title'),
    # Subtitle
    ('text-neutral-500 font-medium', 'page-subtitle'),
    # Profile card border radius
    ('rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-500 group', 'rounded-2xl shadow-sm hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-500 group'),
    # User name h2
    ('text-2xl font-black text-dark tracking-tight leading-none', 'text-xl font-semibold text-dark leading-none'),
    # Username p
    ("text-sm font-bold text-neutral-400 uppercase tracking-widest\">{profile.username || 'utilisateur'}", "text-sm text-neutral-400\">{profile.username || 'utilisateur'}"),
    # Emerald Pro badge
    ('text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5', 'text-xs rounded-full flex items-center gap-1.5'),
    # Edit profile button
    ('px-6 py-3 bg-neutral-50 hover:bg-neutral-100 text-dark text-sm font-black rounded-2xl transition-all border border-neutral-100 active:scale-95 flex items-center gap-2', 'px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-dark text-sm rounded-xl transition-all border border-neutral-100 active:scale-95 flex items-center gap-2'),
    # Info cards rounded-3xl + space-y-4
    ('rounded-3xl space-y-4 hover:border-indigo-100 transition-colors text-left shadow-sm">', 'rounded-2xl space-y-4 hover:border-indigo-100 transition-colors text-left shadow-sm">'),
    # All field labels (text only, no flex)
    ('text-[10px] font-black text-neutral-400 uppercase tracking-widest">', 'field-label">'),
    # labels with flex
    ('text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 leading-none', 'field-label flex items-center gap-1.5 leading-none'),
    # Display values bold
    ('text-base font-bold text-dark">{profile.firstName} {profile.lastName}', 'text-base text-dark">{profile.firstName} {profile.lastName}'),
    ('text-base font-bold text-dark">@{profile.username}', 'text-base text-dark">@{profile.username}'),
    ('text-base font-bold text-dark">{profile.email}', 'text-base text-dark">{profile.email}'),
    ('text-base font-bold text-dark tracking-widest', 'text-base text-dark'),
    # Title/Fonction input card radius
    ('rounded-[2.5rem] space-y-4 hover:border-indigo-100 transition-all text-left shadow-sm">', 'rounded-2xl space-y-4 hover:border-indigo-100 transition-all text-left shadow-sm">'),
    # Bio card radius
    ('rounded-[2.5rem] space-y-4 hover:border-indigo-100 transition-all text-left shadow-sm md:col-span-2">', 'rounded-2xl space-y-4 hover:border-indigo-100 transition-all text-left shadow-sm md:col-span-2">'),
    # Input fields
    ('rounded-2xl px-5 py-3.5 text-sm font-bold text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"', 'rounded-xl px-4 py-3 text-sm text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"'),
    ('rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"', 'rounded-xl pl-10 pr-4 py-3 text-sm text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"'),
    ('rounded-[2rem] px-6 py-5 text-sm font-bold text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all resize-none leading-relaxed"', 'rounded-xl px-4 py-3 text-sm text-dark outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all resize-none leading-relaxed"'),
    # Modifier email btn
    ('text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all"', 'text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-all"'),
    # Changer password btn
    ('text-xs font-black uppercase tracking-widest rounded-xl hover:bg-dark hover:text-white transition-all border border-neutral-100"', 'text-xs rounded-xl hover:bg-dark hover:text-white transition-all border border-neutral-100"'),
    # Section h2 Abonnement
    ('text-lg font-black text-dark uppercase tracking-tight text-left', 'text-base font-semibold text-dark text-left'),
    # Subscription card
    ('rounded-[3rem] flex flex-col md:flex-row', 'rounded-2xl flex flex-col md:flex-row'),
    # +1200 social proof
    ('text-[10px] font-black text-neutral-400 uppercase tracking-widest', 'text-xs text-neutral-400'),
    # Mettre à jour button
    ('px-10 py-5 bg-dark text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-dark/20 active:scale-95 whitespace-nowrap', 'px-6 py-2.5 bg-dark text-white text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-dark/20 active:scale-95 whitespace-nowrap'),
    # Billing history row
    ('rounded-[2rem] text-dark shadow-sm transition-all group">', 'rounded-xl text-dark shadow-sm transition-all group">'),
    ('text-sm font-black uppercase tracking-tight', 'text-sm font-medium'),
    ('[11px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5', 'xs text-neutral-400 mt-0.5'),
]

for old, new in replacements:
    count = content.count(old)
    content = content.replace(old, new)
    print(f'[{"OK" if count else "MISS"}] {count}x: {old[:70]}')

with open('src/components/ReactApp/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone writing Settings.tsx')
print(f'page-title present: {"page-title" in content}')
print(f'font-black remaining: {content.count("font-black")}')
