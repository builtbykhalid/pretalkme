import { useState } from 'react';
import { N8N_CERVEAU_WEBHOOK } from '../lib/n8n';

interface CerveauInteractifPayload {
  static_answers: Record<string, any>;
  ai_config: {
    role: string;
    expertise: string;
    service_name: string;
  };
}

interface CerveauInteractifResponse {
  questions: string[];
  analysis: string;
  score: number;
}

export function useCerveauInteractif() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (
    expertise: string,
    serviceName: string,
    userAnswers: Record<string, any>
  ): Promise<CerveauInteractifResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Mode production : appel réel au webhook n8n
      const payload: CerveauInteractifPayload = {
        static_answers: userAnswers,
        ai_config: {
          role: 'consultant',
          expertise: expertise,
          service_name: serviceName
        }
      };

      const response = await fetch(N8N_CERVEAU_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de l\'appel au Cerveau Interactif:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuestions,
    loading,
    error
  };
}

// Fonctions de simulation pour le développement
export function generateSimulatedQuestions(expertise: string): string[] {
  const questionsByExpertise: Record<string, string[]> = {
    marketing: [
      'Quelle est votre stratégie digitale actuelle ?',
      'Comment mesurez-vous votre ROI marketing ?',
      'Quels sont vos principaux canaux d\'acquisition ?',
      'Quel est votre budget marketing mensuel ?',
      'Utilisez-vous des outils d\'automatisation marketing ?'
    ],
    tech: [
      'Quelle est votre architecture technique actuelle ?',
      'Comment gérez-vous les performances de votre application ?',
      'Quels sont vos principaux défis techniques ?',
      'Utilisez-vous des pratiques DevOps ?',
      'Comment assurez-vous la sécurité de vos données ?'
    ],
    sales: [
      'Quel est votre processus de vente actuel ?',
      'Comment qualifiez-vous vos prospects ?',
      'Quels sont vos outils CRM utilisés ?',
      'Quel est votre taux de conversion moyen ?',
      'Comment suivez-vous vos performances commerciales ?'
    ],
    other: [
      'Quels sont vos principaux défis métier ?',
      'Comment mesurez-vous votre performance ?',
      'Quels outils utilisez-vous actuellement ?',
      'Quel est votre objectif principal ?',
      'Comment organisez-vous vos processus ?'
    ]
  };

  return questionsByExpertise[expertise] || questionsByExpertise.other;
}

export function generateSimulatedAnalysis(
  expertise: string, 
  serviceName: string, 
  _userAnswers: Record<string, any>
): string {
  const analysisTemplates: Record<string, string> = {
    marketing: `
      <h2>🎯 Analyse Marketing - ${serviceName}</h2>
      <p>Basé sur vos réponses, voici votre diagnostic personnalisé :</p>
      
      <h3>✅ Points forts identifiés</h3>
      <ul>
        <li>Conscience des enjeux digitaux</li>
        <li>Motivation pour l'amélioration</li>
        <li>Vision claire des objectifs</li>
      </ul>
      
      <h3>⚠️ Axes d'amélioration</h3>
      <ul>
        <li>Optimisation de la stratégie d'acquisition</li>
        <li>Mesure et analyse des performances</li>
        <li>Automatisation des processus marketing</li>
      </ul>
      
      <h3>🚀 Recommandations prioritaires</h3>
      <ol>
        <li><strong>Audit SEO complet</strong> - Améliorer votre visibilité naturelle</li>
        <li><strong>Mise en place d'un funnel optimisé</strong> - Convertir plus efficacement</li>
        <li><strong>Stratégie de contenu</strong> - Engager votre audience cible</li>
      </ol>
    `,
    tech: `
      <h2>💻 Analyse Technique - ${serviceName}</h2>
      <p>Diagnostic de votre infrastructure et processus de développement :</p>
      
      <h3>✅ Forces techniques</h3>
      <ul>
        <li>Awareness des enjeux de performance</li>
        <li>Volonté d'optimisation continue</li>
        <li>Vision architecturale</li>
      </ul>
      
      <h3>⚠️ Points d'attention</h3>
      <ul>
        <li>Optimisation des performances</li>
        <li>Mise à l'échelle de l'architecture</li>
        <li>Modernisation des processus DevOps</li>
      </ul>
      
      <h3>🚀 Plan d'action technique</h3>
      <ol>
        <li><strong>Audit de performance</strong> - Identifier les goulots d'étranglement</li>
        <li><strong>Revue d'architecture</strong> - Optimiser la scalabilité</li>
        <li><strong>Mise en place CI/CD</strong> - Automatiser les déploiements</li>
      </ol>
    `,
    sales: `
      <h2>💼 Analyse Commerciale - ${serviceName}</h2>
      <p>Évaluation de votre processus de vente et performance commerciale :</p>
      
      <h3>✅ Atouts commerciaux</h3>
      <ul>
        <li>Compréhension du marché</li>
        <li>Motivation pour l'optimisation</li>
        <li>Vision business claire</li>
      </ul>
      
      <h3>⚠️ Opportunités d'amélioration</h3>
      <ul>
        <li>Qualification des prospects</li>
        <li>Optimisation du cycle de vente</li>
        <li>Automatisation des suivis</li>
      </ul>
      
      <h3>🚀 Actions prioritaires</h3>
      <ol>
        <li><strong>Audit du funnel de vente</strong> - Identifier les points de fuite</li>
        <li><strong>Mise en place d'un CRM optimisé</strong> - Structurer le suivi</li>
        <li><strong>Formation équipe commerciale</strong> - Améliorer les techniques</li>
      </ol>
    `
  };

  const defaultAnalysis = `
    <h2>🎯 Analyse Personnalisée - ${serviceName}</h2>
    <p>Diagnostic basé sur vos réponses et votre domaine d'expertise :</p>
    
    <h3>✅ Forces identifiées</h3>
    <ul>
      <li>Vision claire de vos objectifs</li>
      <li>Motivation pour l'amélioration</li>
      <li>Compréhension des enjeux métier</li>
    </ul>
    
    <h3>⚠️ Zones d'optimisation</h3>
    <ul>
      <li>Structuration des processus</li>
      <li>Mesure des performances</li>
      <li>Automatisation des tâches</li>
    </ul>
    
    <h3>🚀 Recommandations</h3>
    <ol>
      <li><strong>Audit complet</strong> - Faire un état des lieux précis</li>
      <li><strong>Plan d'optimisation</strong> - Définir les priorités d'action</li>
      <li><strong>Mise en place d'indicateurs</strong> - Mesurer les progrès</li>
    </ol>
  `;

  return analysisTemplates[expertise] || defaultAnalysis;
}
