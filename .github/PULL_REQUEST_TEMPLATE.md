<!--
PR title format: <type>: <clear outcome>
Examples:
- feat: add role-scoped operational reports
- fix: preserve vendor documents during profile updates
- chore: strengthen deployment validation

Replace every placeholder below with specific information. Do not leave instructional text in the final PR.
-->

## Résumé exécutif

<!-- Présenter en quelques phrases le résultat livré, sa finalité et les utilisateurs concernés. -->

Cette Pull Request...

## Contexte et objectif

<!-- Expliquer le besoin initial, le problème observé ou l’étape de roadmap concernée. -->

- Besoin métier :
- Problème résolu :
- Résultat attendu :

## Fonctionnalités et changements intégrés

<!-- Détailler les changements fonctionnels et techniques importants. -->

-
-
-

## Parcours, vues et rôles concernés

<!-- Indiquer précisément les routes, écrans et niveaux d’accès modifiés. -->

| Rôle ou public | Vues concernées | Nouvel accès ou comportement |
| --- | --- | --- |
|  |  |  |

## Impact utilisateur et métier

<!-- Décrire les bénéfices, changements visibles et éventuelles nouvelles contraintes. -->

- Pour les organisateurs :
- Pour les équipes terrain :
- Pour les Vendors, Sponsors ou Partners :
- Pour les visiteurs :

## Données, migrations et compatibilité

<!-- Lister les tables, migrations, backfills, changements de contrats ou impacts sur les données existantes. -->

- Migration de base de données :
- Reprise ou recalcul de données :
- Compatibilité avec les données existantes :
- Procédure de retour arrière :

## Sécurité, permissions et confidentialité

<!-- Préciser les contrôles RBAC, protections des fichiers, données sensibles et validations serveur. -->

- Contrôles d’accès :
- Validation côté serveur :
- Stockage ou fichiers protégés :
- Données personnelles ou statistiques anonymisées :

## Configuration et déploiement

<!-- Indiquer les variables d’environnement, tâches planifiées et actions requises après déploiement. -->

- Variables d’environnement :
- Services ou intégrations externes :
- Étapes manuelles après déploiement :
- Surveillance recommandée :

## Validation effectuée

<!-- Donner les commandes exactes et leur résultat. Ajouter les tests manuels importants. -->

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build --webpack`
- [ ] Migrations générées et vérifiées
- [ ] Migrations appliquées sur l’environnement prévu
- [ ] Parcours critiques testés manuellement

Détails des résultats :

## Captures ou démonstration

<!-- Ajouter des captures pour les changements d’interface. Écrire « Non applicable » avec justification sinon. -->

## Risques connus et points de vigilance

<!-- Expliquer les limites, dépendances, cas particuliers et éléments à surveiller. -->

-

## Checklist avant fusion

- [ ] Le titre décrit clairement le résultat livré.
- [ ] La description ne contient plus de texte provisoire.
- [ ] Les permissions ont été vérifiées pour chaque rôle concerné.
- [ ] Les migrations et variables d’environnement sont documentées.
- [ ] Les contrôles de qualité pertinents sont réussis.
- [ ] Le plan de déploiement ou de retour arrière est compréhensible.
