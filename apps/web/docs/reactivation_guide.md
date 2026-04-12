# Guide de Réactivation des Fonctionnalités de Design

Ce document explique comment réactiver les options de thème et de forme d'avatar qui ont été désactivées à la demande de l'utilisateur.

## 1. Réactivation du Choix des Thèmes
Pour permettre à nouveau aux utilisateurs de choisir entre les thèmes (Minimal, Dark, Black, Glass), vous devez décommenter la section correspondante dans le fichier suivant :

**Fichier :** `src/components/ReactApp/components/profile/DesignModal.tsx`

**Action :** Décommentez le bloc `{/* Themes - Hidden as requested ... */}`.

```tsx
{/* Themes */}
<section>
    <div className="flex items-center gap-2 mb-4">
        <Palette size={14} className="text-indigo-500" />
        <h4 className="text-xs font-semibold text-neutral-400">Thème visuel</h4>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEMES.map(theme => (
            // ... reste du code
        ))}
    </div>
</section>
```

## 2. Réactivation du Choix des Formes (Avatar/Hero)
Pour permettre à nouveau de changer la forme de l'avatar (Cercle, Rectangle, Hexagone, etc.), vous devez décommenter la section correspondante dans le même fichier :

**Fichier :** `src/components/ReactApp/components/profile/DesignModal.tsx`

**Action :** Décommentez le bloc `{/* Shapes - Hidden as requested ... */}`.

```tsx
{/* Shapes */}
<section>
    <div className="flex items-center gap-2 mb-4">
        <Hexagon size={14} className="text-indigo-500" />
        <h4 className="text-xs font-semibold text-neutral-400">Forme des cartes</h4>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {HERO_SHAPES.map(shape => (
            // ... reste du code
        ))}
    </div>
</section>
```

## 3. Paramètres par défaut
Si vous souhaitez remettre le thème "Dark" par défaut pour les nouveaux utilisateurs, modifiez la valeur par défaut dans :

**Fichier :** `src/components/ReactApp/pages/PublicProfile.tsx`

```tsx
// Ligne ~223
const config: PageConfig = profile.page_config || { theme: 'minimal', ... };
```
Changez `'minimal'` en `'dark'`.

## Notes Additionnelles
- La personnalisation de la couleur des boutons et des titres a été conservée et renommée "Couleur des boutons & titres" dans le menu de design.
- Le background est actuellement fixé par le thème "Minimal" (blanc).
