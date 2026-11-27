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
3. **Faire évoluer le connecteur** pour construire l'instantané à partir de l'API `/records`, table par table, comme le
   fait la source Grist de [dlt](https://dlthub.com/context/source/grist). Les règles Grist du compte de service
   seraient alors appliquées. C'est faisable, mais non développé ici.

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

## Sources

- Metabase, [Security best practices for a self-hosted Metabase](https://www.metabase.com/docs/latest/installation-and-operation/security-best-practices-self-hosting)
- Metabase, [Data isolation methods](https://www.metabase.com/docs/latest/permissions/data-isolation-methods) et [Impersonation](https://metabase.com/docs/master/permissions/impersonation)
- Metabase, [Encrypting database details at rest](https://www.metabase.com/docs/latest/databases/encrypting-details-at-rest)
- Grist, [REST API](https://support.getgrist.com/rest-api/) ; [API des comptes de service (miroir)](https://apis.io/apis/grist/grist-service-accounts-api/)
- Grist, [documentation de la base « home »](https://code.garrettmills.dev/Archives/gristlabs_grist-core/src/branch/main/documentation/database.md) (miroir de grist-core)
- dltHub, [Grist source](https://dlthub.com/context/source/grist)
- Red Hat, [OpenShift network policy](https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_security/network-policy)
- Basedash, [How to safely connect a BI tool to your production database](https://www.basedash.com/blog/how-to-safely-connect-a-bi-tool-to-your-production-database)
- Metabase, [Read replica](https://www.metabase.com/glossary/read-replica)
