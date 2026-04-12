# 🛡️ Audit de Sécurité & Analyse de Risques - Pretalk

Ce document répertorie les audits de sécurité, les tests effectués et les scénarios d'attaque analysés pour la plateforme Pretalk.

## 📋 Sommaire
1. [Module: Authentification & Login](#module-authentification--login)
2. [Module: Gestion des Profils](#module-gestion-des-profils) (À venir)
38. [Module: Formulaires Publics](#module-formulaires-publics) (À venir)
9. [⚡ Module: Performance & Optimisation RLS](#module-performance--optimisation-rls)

---

## 🔐 Module: Authentification & Login

L'authentification est le premier rempart de l'application. Elle repose sur **Supabase Auth**.

### 🔍 Analyse de l'Architecture
- **Fournisseur**: Supabase Auth (GoTrue).
- **Méthodes**: Email/Mot de passe, Magic Links, Google OAuth.
- **Stockage des sessions**: LocalStorage (géré par Supabase SDK).
- **Sécurité Transport**: HTTPS requis.

### 🧪 Scénarios de Test & Analyse

#### 1. Tentative de Connexion Brute Force
- **Scénario**: Un attaquant tente des milliers de combinaisons email/mot de passe.
- **Analyse**: Supabase intègre une protection native contre le brute force (rate limiting par IP et par email).
- **Risque**: Faible.
- **Recommandation**: S'assurer que les limites de Supabase sont configurées de manière stricte en production (Dashboard Supabase > Auth > Rate Limits).

#### 2. Énumération d'Emails (Inscription)
- **Scénario**: Un attaquant teste des emails au hasard dans le formulaire d'inscription.
- **Analyse**: Le code source de `Login.tsx` (lignes 66-73) effectue une requête `SELECT` sur la table `profiles` avant l'inscription. Si un profil est trouvé, il affiche : *"Un compte avec cet email existe déjà"*.
- **Risque**: 🟠 **Moyen**. Permet de confirmer l'existence d'utilisateurs sur la plateforme.
- **Recommandation**: Supprimer la vérification manuelle. Laisser `supabase.auth.signUp` gérer l'erreur ou renvoyer un message ambigu.

#### 3. Interception de Tokens OAuth & "Token Rescue"
- **Scénario**: Vol de tokens Google via XSS.
- **Analyse**: Le mécanisme de "rescue" dans `supabase.ts` stocke les tokens dans `sessionStorage`. 
- **Observation**: Bien que pratique, le `sessionStorage` est accessible par n'importe quel script JS sur le même domaine.
- **Risque**: 🟠 **Moyen**. Surtout si des scripts tiers (analytics, etc.) sont présents.
- **Recommandation**: S'assurer que les tokens sont supprimés du `sessionStorage` dès qu'ils sont synchronisés en base de données (ce qui semble être fait dans `AuthContext.tsx:124`).

#### 4. Analyse des Politiques RLS (Base de Données)
- **Scénario**: Accès direct à l'API Supabase via la clé Anon.
- **Analyse**: Historiquement, certaines migrations (ex: `202602010025_disable_rls_dev.sql`) ont désactivé l'RLS. Cependant, la migration `202602040005_comprehensive_rls_fix.sql` a ré-instauré des politiques strictes.
- **Vérification Requise**: Il faut confirmer qu'aucune table sensible (ex: `finance`, `leads`) n'a l'RLS désactivé en production.
- **Risque**: 🔴 **Critique** (si RLS désactivé).

#### 5. Injection NoSQL / SQL via Inputs
- **Scénario**: Caractères `'` ou `--` dans les champs.
- **Analyse**: Supabase utilise PostgREST qui paramètre toutes les requêtes.
- **Risque**: Très Faible.

---

## 🗄️ Module: Base de Données & RLS

L'analyse des migrations Supabase a révélé des points critiques sur l'isolation des données des utilisateurs.

### 🔍 Analyse de l'Architecture DB
- **Tables**: Environ 69 migrations analysées.
- **RLS**: Row Level Security utilisé pour l'isolation.
- **Accès Public**: Via des Vues (`views`) et des fonctions RPC.

### 🧪 Scénarios de Test & Analyse

#### 1. RLS Désactivé (Verrou Ouvert)
- **Scénario**: Accès aux tables sans session utilisateur.
- **Analyse**: La migration `202602010025` a désactivé l'RLS sur les tables clés.
- **Action**: Script de réactivation globale fourni (commande `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

#### 2. Tunnel via les Vues (Security Invoker)
- **Scénario**: Lecture de `public_profiles` ou `public_forms_view`.
- **Analyse**: Les vues PostgreSQL ignorent par défaut l'RLS de la table source.
- **Observation**: Les vues `public_profiles`, `public_forms_view` et `public_bookings` ne forcent pas l'identité de l'appelant.
- **Risque**: 🔴 **Critique**. Contournement possible des politiques de confidentialité.
- **Recommandation**: Appliquer `ALTER VIEW ... SET (security_invoker = true)`.

#### 3. Fuite de données via `public_bookings`
- **Scénario**: Appel de la vue publique des réservations.
- **Analyse**: La vue fait un `SELECT *` sur la table `bookings`.
- **Risque**: 🔴 **Critique**. Fuite potentielle des emails et détails des rendez-vous.

### 🚩 Points de Vigilance & Actions Correctives (Base de Données)

| Objet | Observation | Gravité | Statut |
| :--- | :--- | :--- | :--- |
| Tables `public` | RLS potentiellement "Disabled" (verrou ouvert). | 🔴 Critique | ⚠️ Script fourni |
| `public_bookings` | `SELECT *` expose des données sensibles. | 🔴 Critique | ⚠️ À corriger |
| Vues Publiques | Absence de `security_invoker`. | 🔴 Critique | ⚠️ À corriger |

---

## 🛡️ Audit Supabase Security Advisor (Analyses Automatisées)

L'outil interne de Supabase a détecté plusieurs vulnérabilités de configuration.

### 🔍 Analyse des Alertes Orange (WARN)

118. **Correction**: Activer "Leaked Password Protection" dans les paramètres Auth du Dashboard Supabase.

#### 5. RLS Policy Always True (Security advisor fix)
- **Analyse**: Détecté sur `bookings` et `waitlist` (accès public trop permissif).
- **Risque**: 🟠 **Moyen**. Permet à n'importe qui d'insérer des données vides ou malformées.
- **Correction**: Ajout de clauses `WITH CHECK` strictes vérifiant que le `form_id` est valide (pour les bookings) ou que l'email est présent (pour la waitlist).

---

## ⚡ Module: Performance & Optimisation RLS

Afin de répondre aux alertes du **Performance Advisor** de Supabase, un audit complet du cache RLS a été réalisé.

### 🔍 Analyse du Performance Advisor
Supabase a détecté deux types de ralentissements majeurs :
1.  **`auth_rls_initplan`** : Les fonctions comme `auth.uid()` étaient ré-évaluées pour chaque ligne de résultat, ralentissant considérablement les grosses tables.
2.  **`multiple_permissive_policies`** : La présence de plusieurs règles `SELECT` (ex: Public + Owner) forçait Postgres à évaluer plusieurs conditions inutilement.

### 🛠️ Actions Correctives (Version 5.6)
Le script `docs/corrective_performance_optimized.sql` a été déployé pour harmoniser la base :

-   **Optimisation du Cache** : Remplacement systématique de `auth.uid()` par `(SELECT auth.uid())`. Cela permet à Postgres de mettre le résultat en cache pour toute la durée de la requête.
-   **Consolidation des Règles** : Fusion des politiques redondantes. Utilisation de politiques individuelles par commande (`FOR SELECT`, `FOR INSERT`, etc.) pour une clarté maximale et zéro conflit.
-   **Durcissement de Syntaxe** : Passage à une syntaxe Postgres stricte (une règle par action) pour éviter les erreurs d'interprétation du moteur RLS.

### 📊 Tables Impactées & Corrigées
- **Profiles** & **Forms** (Propriété directe).
- **Leads** & **Bookings** (Séparation Insert Public / Gestion Propriétaire).
- **Services**, **Deals**, **Notifications**, **Workflows**.
- **Testimonials**, **Waitlist** (Accès Public restreint).
- **Announcements**, **Analytics**, **Report Templates**.

---

---

## 📈 Analyse d'Impact & Recommandations Frontend

### 🔄 Impact sur les Fonctionnalités
- **Soumission de Formulaire** : L'interdiction d'UPDATE sur les Leads peut impacter les formulaires multi-étapes si ceux-ci tentent de modifier un enregistrement existant.
- **Vues Publiques** : L'activation de `security_invoker` garantit que l'utilisateur ne verra que ce que l'RLS autorise (Profils actifs uniquement).
- **Inscription** : Le processus est plus rigoureux (8 caractères min) et plus discret (pas de fuite d'email).

### 🎨 Améliorations Frontend Recommandées

#### 1. Gestion des Erreurs de Mot de Passe (Inscription)
Puisque nous avons augmenté la limite à 8 caractères, il est crucial d'informer l'utilisateur **avant** la soumission :
- **Action** : Ajouter une indication visuelle (ex: "8 caractères minimum") sous le champ mot de passe.
- **Feedback** : Utiliser un message d'erreur clair si la condition n'est pas remplie : *"Votre mot de passe doit contenir au moins 8 caractères pour garantir la sécurité de votre compte."*

#### 2. Feedback sur l'Inscription (Email Enumeration)
Comme le backend ne dit plus si l'email existe déjà, le Frontend doit gérer les deux cas de manière élégante :
- **Message Type** : *"Si cet email correspond à un compte, vous recevrez un lien de confirmation d'ici quelques instants. Pensez à vérifier vos spams."*
- **Pourquoi ?** Cela évite que l'utilisateur pense que le site a buggé s'il ne reçoit rien (car le compte existait déjà).

#### 3. Gestion des Erreurs RLS (403 Forbidden)
Si un utilisateur tente une action interdite (ex: modifier un lead sans droit), Supabase renverra une erreur 403.
- **Action** : Ajouter un `toast` ou une alerte globale catchant les erreurs de base de données.
- **Message** : *"Action non autorisée. Votre session a peut-être expiré."*

#### 4. Indicateur de Force du Mot de Passe
Avec l'activation du "Leaked Password Protection" sur Supabase, une inscription peut échouer si le mot de passe est connu dans des fuites de données.
- **Frontend** : Prévoir un message d'erreur spécifique pour ce cas : *"Ce mot de passe a été compromis dans une fuite de données publique. Par mesure de sécurité, merci d'en choisir un autre."*

---

## 🛠️ Journal des Tests & Actions Effectués

| Date | Test / Action | Résultat | Note |
| :--- | :--- | :--- | :--- |
| 14/03/2026 | Validation Login | ✅ Pass | Flux nominal fonctionnel. |
| 14/03/2026 | Protection Enumeration | ✅ Pass | `Login.tsx` nettoyé. |
| 14/03/2026 | Protection Identifiants | ✅ Pass | Supabase instance cachée. |
| 14/03/2026 | Analyse RLS Advisor | 🔴 Alerte | **Fail Critique** sur l'UPDATE des leads. |
| 14/03/2026 | Audit Correctif SQL | ✅ Appliqué | Script `corrective_audit_supabase.sql` exécuté. |
| 14/03/2026 | Correction RLS INFO | ✅ Terminé | Fusionné dans l'audit de performance. |
| 14/03/2026 | Audit Performance RLS | ✅ V5.6 Appliquée | Optimisation `(SELECT auth.uid())` et consolidation. |
| 14/03/2026 | Protection "Always True" | ✅ Pass | `bookings` et `waitlist` désormais sécurisés. |

---

*Ce document est évolutif et sera complété au fur et à mesure des développements.*
