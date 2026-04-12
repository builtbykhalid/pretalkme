STRATÉGIE DE MIGRATION ET D'ARCHITECTURE : LEADR (OPTION B - FORK STANDALONE)
1. VISION ARCHITECTURALE CIBLE
L'objectif est de lancer le SaaS Leadr (leadr.so) avec un Time-to-Market minimal en capitalisant sur l'infrastructure frontend de Pretalk, tout en garantissant une scalabilité asynchrone maximale pour les webhooks WhatsApp.

Frontend (UI/UX) : Astro + React (Client-Side Rendering via react-router-dom).

State Management : Zustand (pour l'état global et l'Inbox temps réel).

Backend Core : NestJS + RabbitMQ (Microservices, Event-driven).

Base de Données / Auth : Supabase (PostgreSQL + RLS).

Communication : REST (Axios) + WebSockets (Socket.io).

2. PROTOCOLE DE CLONAGE RÉUSSI (ASSETS EXTRACTION)
Étape 1 : Bifurcation (Fork) et Nettoyage du Codebase
L'idée n'est pas de repartir de zéro, mais d'utiliser Pretalk comme un boilerplate exclusif.

Clonage : Dupliquer le repository pretalk-hub vers un nouveau dépôt leadr-web.

Strip-down (Purge) : * Supprimer les routes et composants liés à la génération de formulaires.

Supprimer la logique métier spécifique (ex: LeadReview.tsx).

Supprimer le backend Express léger intégré.

Conservation (Le Trésor) :

Pages statiques Astro (Landing, Pricing, Login/Register).

Système de routing React existant.

L'intégralité du Design System (Tailwind CSS, composants Shadcn/ui, animations Framer Motion).

La couche d'authentification frontend Supabase.

Étape 2 : Sécurisation et Isolation du Backend (NestJS)
Le frontend et le backend sont désormais physiquement et logiquement séparés.

Déploiement Backend : Héberger le service NestJS sur un sous-domaine dédié (ex: api.leadr.so).

Gestion des CORS : Configurer NestJS pour n'accepter que les requêtes provenant strictement de https://leadr.so.

Authentification Transversale : Le frontend React génère le JWT via Supabase. Ce token doit être injecté dans les headers de chaque requête HTTP vers NestJS (Axios Interceptors) et dans le handshake d'initialisation de Socket.io.

Étape 3 : Implémentation du Temps Réel (L'Inbox)
L'absence de Next.js exige une gestion d'état frontend robuste pour l'interface de chat.

Socket.io Client : Instancier la connexion WebSocket uniquement lors du montage du composant Inbox.tsx.

Zustand Store : Créer un store dédié (useChatStore) pour stocker les messages entrants. Lorsqu'un événement Webhook Meta est traité par NestJS et poussé via WebSocket, Zustand met à jour l'UI React instantanément sans re-render complet de l'application.

Étape 4 : Adaptation des Composants Complexes
Le CRM (Kanban) : Réutiliser la base visuelle du Kanban de Pretalk, mais recâbler les requêtes API pour interagir avec les endpoints NestJS (pipelines de vente liés aux commandes e-commerce).

IA et Audio : Déléguer 100% de la lourdeur des requêtes LLM et de la génération audio (FastAPI/ElevenLabs) à NestJS via RabbitMQ. Le frontend React ne gère que les états d'attente (indicateur "IA réfléchit...") reçus via WebSocket.

3. CHECKLIST DE SÉCURITÉ ET LIMITES TECHNIQUES
Prévention XSS : L'architecture Client-Side Rendering (CSR) stocke souvent le token d'Auth dans le localStorage. Pour un niveau de sécurité entreprise, configurer l'authentification Supabase pour utiliser des cookies HttpOnly (Cross-Domain si possible) ou déléguer strictement la gestion des sessions au SDK Supabase.

Volume du Bundle JS : Puisque tout le CRM est une SPA React chargée par Astro, veiller à utiliser le Code Splitting (via React.lazy) pour ne pas charger les composants du Flow Builder ou des Statistiques lors du premier affichage de l'Inbox.

Hydratation Framer Motion : En gardant Astro, les problèmes de mismatch d'hydratation serveur/client sont limités, mais s'assurer que les animations lourdes ne se déclenchent qu'une fois le composant React totalement monté (useEffect).