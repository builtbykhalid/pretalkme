# Plan Complet - Mission Templates PDF Audit Marketing

## 1) Contexte et objectif business

Tu veux un systeme de documents PDF qui ne soit pas juste "joli", mais qui convertit.

Le but principal:
- Convaincre un prospect de passer a l'etape commerciale suivante.
- Donner au consultant un rendu premium qu'il peut personnaliser, corriger, puis valider.
- Garder une coherence forte entre audit, devis, et contrat.
- Appliquer automatiquement le branding du consultant (logo, couleurs, style) sans casser la lisibilite.

Objectif produit:
- 3 templates de rapport d'audit tres differents visuellement et narrativement.
- Pour chaque template rapport: 2 derives natifs (devis + contrat) de la meme famille visuelle.
- Total final: 9 templates (3 audits + 3 devis + 3 contrats).

## 2) Ce que j'ai analyse dans l'existant

Points positifs detectes:
- Base technique deja presente pour compiler des templates HTML via placeholders.
- Variables de branding deja supportees cote serveur (primaryColor, accentColor, companyLogo, companyName).
- Templates actuels audit/devis/contrat deja relies a la meme logique de theming.
- Table `pdf_templates` + logs de generation deja en place.

Limites actuelles a corriger:
- Style plutot "template unique" avec variations limitees, pas de vraies familles editoriales.
- Coherence narrative audit -> devis -> contrat encore partielle.
- Peu de mecanismes explicites de "preuve" marketing (ROI, impact, urgence, evidence blocks).
- Personnalisation consultant pas assez "guidée" (risque de contenu IA trop generique).

## 3) Besoins fonctionnels (traduits en exigences claires)

### 3.1 Exigences metier
- Le rapport doit rassurer, eduquer, et vendre sans etre agressif.
- Le consultant doit pouvoir:
  - Regenerer IA
  - Editer manuellement
  - Valider version finale
- Le prospect doit comprendre en moins de 2 minutes:
  - Diagnostic
  - Priorites
  - Plan d'action
  - Offre associee

### 3.2 Exigences design
- Trois identites graphiques distinctes pour eviter l'effet repetitif.
- Branding consultant applique automatiquement avec garde-fous contraste/impression.
- PDF lisible sur mobile (consultation) et propre a l'impression (A4/Letter).

### 3.3 Exigences techniques
- Compatibles avec l'infrastructure actuelle de template rendering.
- Placeholders standards + sections conditionnelles.
- Devis et contrat derives du meme "theme pack" que le rapport.
- Tracabilite complete (template utilise, version, statut generation).

## 4) Concept global: 3 familles templates

## Famille A - Executive Impact

Positionnement:
- Pour consultants B2B, direction, decisionnaires presses.
- Tone: clair, direct, premium corporate.

### A1) Rapport Audit (Executive Impact)
Structure proposee:
1. Couverture orientee resultat (promesse + contexte client)
2. Executive summary (1 page)
3. Score de maturite + benchmark court
4. 3 leviers prioritaires (Impact x Effort)
5. Plan 30-60-90 jours
6. Projection ROI (hypotheses explicites)
7. CTA final vers call de cadrage

Codes visuels:
- Grille stricte, beaucoup d'espace blanc, typographie serieuse.
- Blocs KPI numeriques tres visibles.

### A2) Devis derive (Executive Impact Quote)
- Meme en-tete, meme systeme de couleurs, meme iconographie.
- Devis tres lisible: lots, livrables, calendrier, conditions, total TTC.
- Encart "impact attendu" alignant chaque lot avec benefice business.

### A3) Contrat derive (Executive Impact Contract)
- Style legal premium minimaliste.
- Articles compactes, sections obligations/resultats/delais.
- Bloc de synthese commercial en premiere page (objet + valeur + jalons).

## Famille B - Storytelling Transformation

Positionnement:
- Pour consultants coaching, personal branding, offres transformation.
- Tone: humain, narratif, inspirant mais structure.

### B1) Rapport Audit (Storytelling Transformation)
Structure proposee:
1. Couverture orientee "avant -> apres"
2. Votre situation actuelle (diagnostic narratif)
3. Bloc "ce qui vous freine vraiment"
4. Nouveau scenario cible (vision claire)
5. Plan en 3 etapes (fondations -> acceleration -> stabilisation)
6. Etudes de cas courtes/preuves sociales
7. Prochaine etape + engagement consultant

Codes visuels:
- Alternance blocs couleur douce + citations + timeline.
- Mise en avant de phrases clefs et micro-resumes.

### B2) Devis derive (Storytelling Offer)
- Devis presente comme "programme d'accompagnement".
- Chaque phase = objectifs, livrables, resultat attendu.
- Bloc "Pourquoi ce format" pour limiter objections prix.

### B3) Contrat derive (Storytelling Agreement)
- Ton legal clair + humain.
- Rappel de la mission et cadre collaboratif.
- Annexes: process de suivi, communication, revision.

## Famille C - Data-Driven Evidence

Positionnement:
- Pour consultants growth, ops, data, performance marketing.
- Tone: analytique, factuel, decisionnel.

### C1) Rapport Audit (Data-Driven Evidence)
Structure proposee:
1. Couverture "performance snapshot"
2. Tableau des indicateurs (actuel vs cible)
3. Analyse des ecarts et causes racines
4. Priorisation par score (impact, risque, effort)
5. Scenarios d'implementation (prudent / standard / agressif)
6. Roadmap + points de controle
7. Annexes data et hypotheses

Codes visuels:
- Graphiques compacts, tableaux propres, etiquettes de confiance.
- Palette contrastee et lisibilite imprimee.

### C2) Devis derive (Data Scope Quote)
- Ligne par deliverable + estimation charge + dependances.
- Section assumptions + exclusions + risques.
- Option packs (Core / Growth / Scale).

### C3) Contrat derive (Data Performance Contract)
- Clauses precises SLA, responsabilites data, conformite.
- Milestones de validation et criteres d'acceptation.
- Bloc securite/confidentialite renforce.

## 5) Architecture de contenu commune (audit)

Pour harmoniser la qualite IA + edition consultant:
- Bloc 1: Contexte prospect
- Bloc 2: Probleme principal
- Bloc 3: Consequences business
- Bloc 4: Opportunites a court terme
- Bloc 5: Plan recommande
- Bloc 6: Proposition de passage a l'action

Regles redactionnelles:
- Une idee cle par section.
- Maximum 3 priorites majeures par audit.
- Toute recommandation doit inclure: objectif, action, delai, indicateur.

## 6) Branding consultant: moteur de personnalisation

## 6.1 Sources branding
- Logo consultant / societe
- Primary color
- Accent color
- Nom entreprise et signature consultant

## 6.2 Regles automatiques
- Fallback couleurs par defaut si absentes.
- Correction automatique contraste texte/fond (AA minimum).
- Version "print-safe" si couleur trop claire ou saturations extremes.

## 6.3 Tokens de theme (proposes)
- --brand-primary
- --brand-accent
- --brand-ink
- --brand-muted
- --brand-surface
- --brand-border

## 7) Workflow IA -> consultant -> PDF final

Workflow cible:
1. IA genere brouillon structure selon famille template choisie.
2. Consultant edite sections (texte, priorites, offre).
3. Validation consultant (lock version).
4. Generation PDF audit.
5. A partir de l'audit valide, generation devis + contrat de la meme famille.
6. Eventuellement seconde passe de personnalisation legale/commerciale.
7. Envoi prospect + logging generation.

Garde-fous:
- Avertir si sections critiques vides (prix, delai, obligations).
- Avertir si contenu trop court ou trop generique.
- Historique versions pour rollback rapide.

## 8) Mapping technique avec l'existant

Ce qui est deja alignable immediatement:
- `pdfTemplateService` compile deja branding + placeholders.
- `templateCompiler` gere variables, conditions, loops.
- `pdf_templates` accepte `template_type` (audit/devis/contrat...).

Extensions recommandees:
- Ajouter metadata de famille template:
  - `template_family` (executive, storytelling, data)
  - `template_variant` (audit, devis, contrat)
  - `is_default_for_family`
- Ajouter validation schema par type pour eviter placeholders manquants.
- Ajouter statut "approved_by_consultant" dans flux generation.

## 9) Plan de mise en place (roadmap)

## Phase 0 - Validation Produit (1 cycle)
- Valider les 3 familles templates.
- Valider ton editorial et niveau de persuasion attendu.
- Valider sections legales minimales contrat/devis.

Livrable:
- Spécification fonctionnelle signee.

## Phase 1 - Design System PDF (1 cycle)
- Definir tokens couleurs, typo, composants PDF (tableaux, KPI, timeline, clauses).
- Definir grilles print-safe communes.

Livrable:
- Kit UI PDF commun + composants reutilisables.

## Phase 2 - Production Templates (2 cycles)
- Produire 3 templates audit (A/B/C).
- Produire 3 templates devis derives.
- Produire 3 templates contrats derives.

Livrable:
- 9 templates HTML/CSS prets generation.

## Phase 3 - Integration + Workflow (1 cycle)
- Relier selection famille dans UI consultant.
- Generer audit -> devis -> contrat automatiquement.
- Ajouter controles de completude avant generation finale.

Livrable:
- Flux complet actif en preproduction.

## Phase 4 - QA + Ajustements (1 cycle)
- Tests multi-profils branding.
- Tests d'impression et de lisibilite mobile.
- Test conversion percue par consultants pilotes.

Livrable:
- Version candidate production.

## 10) Critères d'acceptation

Template audit:
- Lisible en moins de 2 minutes pour comprendre diagnostic + action.
- Branding consultant applique sans rupture visuelle.
- Contenu IA editable et validable sans friction.

Template devis:
- Structure prix claire, sans ambiguite.
- Conditions de paiement et delais visibles au premier ecran.

Template contrat:
- Clauses essentielles presentes (objet, duree, remuneration, obligations, resiliation, confidentialite, signature).
- Mise en page legale claire + impression propre.

KPI pilote:
- Taux de documents valides sans correction majeure.
- Temps moyen consultant pour finaliser un pack (audit+devis+contrat).
- Taux de prise de rendez-vous apres envoi audit.

## 11) Risques et mitigations

Risque:
- IA produit du texte trop generique.
Mitigation:
- Prompts structures par section + checklist qualite pre-generation.

Risque:
- Branding consultant deteriore lisibilite.
Mitigation:
- Normalisation couleurs + fallback + contrast checker.

Risque:
- Contrat juridiquement incomplet selon pays/activite.
Mitigation:
- Base contractuelle modulaire + champs obligatoires + mention validation legale externe.

## 12) Decisions a valider avec toi avant implementation

1. Priorite de lancement des familles: A puis B puis C, ou autre ordre.
2. Longueur cible des audits: court (5-7 pages) ou detaille (8-12 pages).
3. Niveau de personnalisation legale contrat: standard ou secteur-specifique.
4. Langues prioritaires: FR only ou FR + EN des la V1.
5. Niveau d'automatisation: generation 100% auto ou etape validation obligatoire.

## 13) Recommandation de demarrage

Sequence recommandee:
1. Commencer par Famille A (Executive Impact) pour maximiser conversion B2B rapide.
2. Deriver directement A-Devis et A-Contrat pour valider la coherence du triplet.
3. Lancer ensuite Famille C (Data) pour profils analytiques.
4. Finir par Famille B (Storytelling) pour segments coaching/transformation.

Pourquoi:
- Rapport effort/impact tres favorable.
- Permet de tester vite le moteur complet audit -> devis -> contrat.

---

Ce document est pret pour ta validation. Une fois valide, je passe a l'etape execution: production concrete des 3 familles templates (audit + devis + contrat) avec placeholders compatibles generation actuelle.