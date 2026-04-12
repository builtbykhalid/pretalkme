---
description: Rules for UI/design system changes — defines which pages are protected from app-wide UI migrations
---

# UI Migration Rules — Page Isolation Policy

## 🚫 PROTECTED PAGES (Never modify during app UI changes)

These pages are **user-customizable** and have their own independent styling system.
They must NEVER be touched during design system migrations:

### 1. PublicProfile.tsx
- **Path**: `src/components/ReactApp/pages/PublicProfile.tsx`
- **Reason**: Uses dynamic theming (`config.theme`, `config.color`, `config.font`) — fully personalized by each user
- **Styling**: All inline hex colors, conditional classes based on user's `page_config`
- **Related layouts**: `LinktreeThemeLayout`, `ShowcaseLayout`

### 2. PublicForm.tsx
- **Path**: `src/components/ReactApp/pages/PublicForm.tsx`
- **Reason**: Uses `DesignConfig` (primaryColor, backgroundColor, font, buttonStyle) — customized per form
- **Styling**: Own color system via `COLORS` map, `adjustHex()` helper

### 3. PublicFormWrapper.tsx
- **Path**: `src/components/ReactApp/PublicFormWrapper.tsx`
- **Reason**: Thin wrapper for PublicForm, inherits its styling

### 4. All modals opened FROM public pages
- Service detail modal (in `DynamicSection`)
- Booking modal (CalendarBooking embedded)
- These use the same dark/light theming as the public page

## ✅ MIGRATION-ELIGIBLE PAGES (internal app)

These pages are part of the Pretalk Hub admin dashboard and should follow the app's design system:

| Page | Status |
|---|---|
| Dashboard.tsx | ✅ Migrated (Phase 4) |
| Automations.tsx | ✅ Migrated (Phase 4) |
| Forms.tsx | ✅ Migrated (Phase 4) |
| Leads.tsx | ✅ Migrated (Phase 4) |
| Settings.tsx | ✅ Migrated (Phase 4) |
| Services.tsx | 🔄 Phase 5 |
| LeadReview.tsx | 🔄 Phase 5 |
| ConsultationPage.tsx | 🔄 Phase 5 |
| Agents.tsx | 🔄 Phase 5 |
| AvailabilitiesPage.tsx | 🔄 Phase 5 |
| Finances.tsx | 🔄 Phase 5 |
| FormBuilder.tsx | ⚠️ Check — may have embedded public preview |
| MyProfile.tsx | 🔄 Phase 5 |
| Templates.tsx | 🔄 Phase 5 |

## ⚠️ SPECIAL CASES

### Home.tsx (Landing Page)
- Uses intentional dark theme with brand colors
- Not part of the dashboard design system
- Treat as separate marketing page

### Auth.tsx / Login.tsx / Onboarding
- These use their own isolated styling
- Can be migrated but are low priority

## Rule Summary

> **When changing the app's design system (colors, tokens, components), NEVER modify files listed in the PROTECTED section.**
> **The public pages use their own dynamic theming system that is personalized by each user.**
