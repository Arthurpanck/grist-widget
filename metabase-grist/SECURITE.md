# Sécuriser l'accès de Metabase aux données Grist

Cette note combine des tests (Grist `latest` avec base PostgreSQL, Metabase v0.65.7.3, novembre 2026) et les
pratiques habituelles pour brancher un outil de BI sur les données d'une application.

## 1. Faut-il passer par la base PostgreSQL de Grist ? Non.

Grist utilise deux sortes de bases :

| Base | Contenu | Où |
|---|---|---|
| **Base « home »**, SQLite ou PostgreSQL (`TYPEORM_*`) | Utilisateurs, organisations, espaces, liste des documents, partages, **clés API** | PostgreSQL en prod |
| **Un fichier SQLite par document** (`<docId>.grist`) | Les tables, les lignes, les formules, les règles d'accès du document | Disque du pod ou S3 |

J'ai vérifié sur un Grist branché sur PostgreSQL : après création d'un document de 400 commandes, un `pg_dump`
complet de la base ne contient **aucune** valeur métier (0 occurrence de « Grand compte », « Licence Pro »…). Les
26 tables de PostgreSQL sont `users`, `orgs`, `workspaces`, `docs`, `acl_rules`, `groups`, `service_accounts`,
`secrets`, etc.

Il ne faut surtout pas donner à Metabase un accès à cette base, pour deux raisons :
- elle ne lui servirait à rien : aucune donnée métier ne s'y trouve ;
- **les clés API y sont stockées en clair** (colonne `users.api_key`). Pouvoir la lire, c'est pouvoir se faire passer
  pour n'importe quel utilisateur Grist, propriétaires et administrateurs compris. La table `secrets` contient aussi
  des secrets de documents, comme ceux des webhooks.

Cette base doit être réservée au pod Grist : son propre rôle PostgreSQL, et une NetworkPolicy qui n'accepte que Grist.

L'accès aux données passe donc **par Grist lui-même**, avec son API et ses contrôles d'accès. C'est ce que fait le
connecteur.

## 2. Les pratiques habituelles, appliquées à Grist

Les guides de Metabase et la plupart des retours d'expérience convergent sur la même liste.

| Pratique habituelle | Application ici |
|---|---|
| **Une identité dédiée, jamais le compte d'une personne**, pour pouvoir la révoquer, la faire tourner et l'auditer séparément | Un **compte de service Grist** (voir §3), et non la clé API d'un collaborateur |
| **Lecture seule, moindre privilège** : seulement les données nécessaires | Le compte de service est **lecteur** des seuls documents à analyser. Le connecteur ne fait que des lectures et ouvre l'instantané en lecture seule |
| **Ne pas faire porter la BI par la base de production** : réplica ou base d'analyse | L'instantané local joue ce rôle : les requêtes Metabase ne touchent jamais le document vivant (sans cela, `SQLITE_BUSY` côté Grist) |
| **Secrets hors du code et chiffrés au repos** | Clés dans des Secrets OpenShift, idéalement alimentés par Vault via External Secrets Operator. `MB_ENCRYPTION_SECRET_KEY` chiffre les détails de connexion, dont la clé Grist, dans la base de Metabase |
| **Rotation** | Le compte de service a une **date d'expiration** et une clé régénérable (`POST /api/service-accounts/:id/apikey`). Il suffit ensuite de mettre à jour la base dans Metabase |
| **Isolation réseau et chiffrement** | NetworkPolicy : Grist n'accepte que le routeur et Metabase, sa base n'accepte que Grist. Trafic interne au cluster ; TLS avec un service mesh si la politique de l'entreprise l'exige |
| **Droits côté BI** : groupes, SSO, SQL natif restreint | Permissions Metabase par base (un document = une base) pour des groupes issus du SSO. Le **SQL natif** est réservé à quelques personnes : aucun filtrage par ligne ne s'y applique, même en édition payante |
| **Audit** | Côté Grist, les appels sont journalisés au nom du compte de service. Côté Metabase, les journaux d'audit sont dans l'édition Pro/Enterprise |

## 3. Le compte de service Grist (testé)

Grist propose des comptes de service, **désactivés par défaut** : il faut définir
`GRIST_ENABLE_SERVICE_ACCOUNTS=true` sur Grist. Un utilisateur crée le compte, qui lui reste rattaché :

```bash
curl -X POST "$GRIST/api/service-accounts" -H "Authorization: Bearer $CLE_PROPRIETAIRE" \
  -H 'Content-Type: application/json' \
  -d '{"label":"metabase-reader","description":"Lecture seule pour Metabase","expiresAt":"2027-06-30"}'
# -> {"login":"<uuid>@serviceaccounts.invalid","key":"…","expiresAt":"2027-06-30T00:00:00.000Z",…}
```

On le partage ensuite **en lecteur** sur chaque document à analyser, avec son `login` comme adresse :

```bash
curl -X PATCH "$GRIST/api/docs/$DOC/access" -H "Authorization: Bearer $CLE_PROPRIETAIRE" \
  -H 'Content-Type: application/json' -d '{"delta":{"users":{"<login>":"viewers"}}}'
```

| Test avec la clé du compte de service | Résultat |
|---|---|
| Télécharger un document partagé en lecteur | 200, et le connecteur fonctionne (400 lignes lues dans Metabase) |
| Télécharger un document non partagé | 403 `No view access`. Metabase refuse d'ajouter la base, avec un message clair |
| Écrire dans un document partagé | 403 `No write access` |
| Lister les documents | Il ne voit que ceux qu'on lui a partagés, ce qui convient au script d'auto-enregistrement |

Le script `scripts/register_docs.py` avec cette clé n'enregistre donc **que** les documents explicitement partagés au
compte de service. Le partage dans Grist devient l'interrupteur qui décide de ce qui part dans Metabase.

## 4. Les règles d'accès fines de Grist

| Avec une règle « table Clients cachée aux non-propriétaires » | Résultat pour le compte de service |
|---|---|
| `/download`, dont se sert le connecteur | **403** `not authorized to download this document` |
| `/sql` | **403** `insufficient document access` |
| `/tables/Commandes/records` | 200, la table est autorisée |
| `/tables/Clients/records` | 403 `Blocked by table read access rules` |

Le connecteur ne peut donc pas faire fuiter une donnée protégée par une règle : il échoue en bloc. Pour un document
qui en contient, trois options :

1. **Un document d'export dédié**, sans règle restrictive, qui ne contient que ce que Metabase doit voir. C'est le plus
   simple.
2. **Donner au compte de service l'accès complet** et refaire le cloisonnement dans Metabase (permissions par groupe,
   filtrage par ligne en Pro/Enterprise). C'est acceptable si les règles Grist protégeaient des données que les
   publics Metabase ont de toute façon le droit de voir.
3. **Le mode « Appliquer les règles d'accès Grist de ce compte » du connecteur.** La copie est construite à partir de
   l'API `/records`, table par table, comme le fait la source Grist de [dlt](https://dlthub.com/context/source/grist) :
   les règles Grist du compte de la clé sont appliquées. **Développé et testé**, voir §6.

Les règles Grist portent sur des tables et des colonnes, pas sur les **formules qui en dérivent**. Dans le test, la
colonne `Région client` (`$Client.Region`) de la table Commandes restait lisible alors que Clients était cachée. Si
une règle sert à protéger une donnée, il faut cacher aussi les colonnes qui la recopient.

## 5. En résumé pour OpenShift

1. Activer `GRIST_ENABLE_SERVICE_ACCOUNTS=true` sur Grist. Créer un compte de service `metabase-reader` avec une
   expiration, et le partager en lecteur sur les documents à publier.
2. Stocker sa clé dans un Secret, alimenté par Vault et External Secrets Operator si l'entreprise en dispose.
   Définir `MB_ENCRYPTION_SECRET_KEY` sur Metabase.
3. Appliquer les NetworkPolicy de `openshift/metabase-grist.yaml`. Ne jamais ouvrir la base PostgreSQL de Grist à
   autre chose que Grist.
4. Dans Metabase :
   - SSO (OIDC/SAML/LDAP) et groupes ;
   - groupe « Tous les utilisateurs » bloqué par défaut ;
   - accès par base (par document) aux groupes concernés ;
   - SQL natif réservé à quelques personnes.
5. Une rotation de la clé par an au plus, à l'expiration du compte de service. Le CronJob d'auto-enregistrement
   utilise une clé API Metabase dédiée, dans son propre Secret.

## 6. Un utilisateur qui ne voit qu'une partie d'un document (Metabase open source, testé)

Le scénario testé : un agent est **lecteur** d'un document Grist soumis à trois règles. Il ne voit que les commandes
et les clients de Bretagne, et la colonne `Prix_unitaire` lui est cachée. Le connecteur a un mode **« Appliquer les
règles d'accès Grist de ce compte »** (`respect-access-rules`) : la copie est reconstruite à partir de l'API
`/records`, que Grist filtre avec les règles du compte de la clé. `scripts/acl_test.py` rejoue tout le scénario.

| Vérification | Résultat |
|---|---|
| Commandes dans la base Metabase de l'agent | **14** (que la Bretagne) au lieu de 400 |
| Clients | **1** au lieu de 30 |
| Colonne `Prix_unitaire` | **absente** de la copie, et le SQL natif qui la vise échoue |
| Règles, historique, tables `_grist_*` de Grist | **absents** de la copie |
| L'agent interroge sa base dans l'éditeur graphique | OK |
| L'agent interroge la base complète | **refusé** |
| L'agent fait du SQL natif | **refusé** (droit non donné) |
| L'accès de l'agent est retiré dans Grist | sa base Metabase **cesse de répondre** dès l'actualisation suivante |

**Oui, ça marche en open source**, mais selon un modèle précis. Metabase open source ne transmet pas au connecteur
l'identité de la personne qui regarde : une base Metabase correspond toujours à **une** identité Grist. Le
cloisonnement se fait donc **par public** :

```
Grist : règles d'accès  ──►  1 identité Grist par public  ──►  1 base Metabase par (document, public)  ──►  1 groupe Metabase
        (lignes, colonnes)    (compte de service conseillé)     (mode « règles Grist »)                    (droits sur cette base seule)
```

`scripts/register_docs.py` industrialise ce modèle. Il se lance une fois par public :

```bash
RESPECT_ACCESS_RULES=true AUDIENCE=Bretagne METABASE_GROUP="Agents Bretagne" GRIST_API_KEY=<clé du public> \
  python3 scripts/register_docs.py
```

Il crée `Espace / Document — Bretagne`, la ferme à tous les groupes et l'ouvre en éditeur graphique au groupe
« Agents Bretagne ».

### Quelle identité Grist derrière chaque base ?

| Option | Verdict |
|---|---|
| **Un compte de service par public** (`metabase-bretagne`), lecteur du document, avec des règles Grist écrites pour lui. Le plus simple : une table d'habilitations `Email → Région` utilisée par les règles, où l'on ajoute le login du compte de service à côté des humains. Les mêmes règles servent aux deux. | **Recommandé** : lecture seule, date d'expiration, aucune clé personnelle en circulation |
| **La clé API personnelle de l'agent** (testé : ça marche) | Pour un pilote seulement. La clé porte *tous* ses droits Grist, y compris l'écriture sur ses autres documents. Elle est stockée dans Metabase et saisie par un admin (en open source, seuls les admins ajoutent des bases), et elle meurt avec son compte |
| **« Même e-mail des deux côtés », sans clé**. Le connecteur devrait agir *au nom* de l'utilisateur, ce qui suppose que Grist fasse confiance à un en-tête d'identité (`GRIST_FORWARD_AUTH_HEADER`) envoyé par Metabase | **À refuser** : le pod Metabase pourrait alors se faire passer pour n'importe qui, propriétaires compris et avec droit d'écriture. Et Metabase open source ne transmet de toute façon pas l'identité de la personne qui regarde |

### Et le LDAP ?

Ça ne complique rien, et c'est même ce qui rend le modèle propre :
- **Metabase open source** sait se connecter en LDAP et **synchroniser les groupes LDAP** vers ses groupes
  (`ldap-group-sync` et `ldap-group-mappings` sont dans le code open source, sans verrou de licence). OIDC, SAML et
  JWT sont payants ([doc](https://www.metabase.com/docs/latest/people-and-groups/google-and-ldap)).
- **Grist** n'a pas de LDAP natif. On passe par **OIDC** avec un Keycloak fédéré au LDAP, ou par un proxy
  d'authentification ([doc OIDC](https://support.getgrist.com/install/oidc/),
  [forward auth](https://support.getgrist.com/install/forwarded-headers/)). Dans les deux cas, l'e-mail est le même
  des deux côtés.
- Il reste une limite : **Grist ne lit pas les groupes LDAP**. Ses règles portent sur l'e-mail, sur des tables
  d'habilitations du document ou sur ses équipes. La table d'habilitations est donc à tenir à jour, à la main ou par
  un petit script qui la synchronise depuis le LDAP.

### Les pièges de Metabase open source (tous constatés dans le test)

1. **Une nouvelle base est ouverte à « Tous les utilisateurs »**, SQL natif compris. `register_docs.py` la ferme
   aussitôt. Une base ajoutée à la main doit être fermée à la main.
2. **Un nouveau groupe reçoit l'accès complet à toutes les bases.** Les droits s'additionnent entre groupes, et le
   plus large l'emporte. Il faut fermer chaque nouveau groupe.
3. **Le réglage « Bloqué » est payant** (réponse 402 en open source). Conséquence : une question de l'**éditeur
   graphique** construite sur la base complète et rangée dans une collection que voit l'agent **lui montre les
   données**, alors qu'il n'a aucun droit de requête sur cette base. **Fuite constatée.** Les questions en SQL natif,
   elles, restent protégées, car il faut le droit SQL sur la base pour les voir.

   Parades en open source :
   - une collection par public ;
   - retirer « Nos analyses » au groupe « Tous les utilisateurs » ;
   - une règle d'équipe : on ne range dans la collection d'un public que des questions bâties sur *sa* base ;
   - des comptes administrateurs peu nombreux.

   Si les données sont vraiment sensibles, deux solutions sûres : une instance Metabase par niveau de
   confidentialité, ou l'édition Pro.
4. Désactiver le **partage public** et l'**intégration** (Admin → Paramètres → Partage public) ; surveiller les
   **abonnements** par e-mail vers l'extérieur.
5. Les **administrateurs Metabase voient tout** : toutes les bases et toutes les clés saisies.

### Deux corrections apportées au connecteur pendant ce test

- **Une copie par clé.** Le nom de la copie ne dépendait que du document. Deux bases sur le même document avec deux
  clés différentes (le propriétaire et l'agent, par exemple) auraient partagé la même copie. Le nom de la copie
  dépend désormais aussi de la clé et du mode.
- **Échec fermé.** Quand Grist répond 401, 403 ou 404 à une actualisation, la copie est supprimée et la base cesse de
  répondre. Avant, l'ancienne copie restait servie, ce qui était voulu pour une panne réseau mais dangereux pour une
  révocation. En cas de panne de Grist (erreur réseau ou 5xx), l'ancienne copie reste servie.

## Sources

- Metabase, [Security best practices for a self-hosted Metabase](https://www.metabase.com/docs/latest/installation-and-operation/security-best-practices-self-hosting)
- Metabase, [Data isolation methods](https://www.metabase.com/docs/latest/permissions/data-isolation-methods) et [Impersonation](https://metabase.com/docs/master/permissions/impersonation)
- Metabase, [Encrypting database details at rest](https://www.metabase.com/docs/latest/databases/encrypting-details-at-rest)
- Grist, [REST API](https://support.getgrist.com/rest-api/) ; [API des comptes de service (miroir)](https://apis.io/apis/grist/grist-service-accounts-api/)
- Grist, [documentation de la base « home »](https://code.garrettmills.dev/Archives/gristlabs_grist-core/src/branch/main/documentation/database.md) (miroir de grist-core)
- dltHub, [Grist source](https://dlthub.com/context/source/grist)
- Metabase, [Google Sign-In or LDAP](https://www.metabase.com/docs/latest/people-and-groups/google-and-ldap) ; [Collection permissions](https://www.metabase.com/docs/latest/permissions/collections)
- Grist, [OpenID Connect](https://support.getgrist.com/install/oidc/) ; [Forwarded headers](https://support.getgrist.com/install/forwarded-headers/)
- Red Hat, [OpenShift network policy](https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_security/network-policy)
- Basedash, [How to safely connect a BI tool to your production database](https://www.basedash.com/blog/how-to-safely-connect-a-bi-tool-to-your-production-database)
- Metabase, [Read replica](https://www.metabase.com/glossary/read-replica)
