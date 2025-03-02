# Flow: microservices → logger.ts → Redis → logWorker.ts → app.log

# Architecture du Système de Logging

Voici un schéma détaillé du fonctionnement de votre système de logging, du début à la fin du processus :

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Auth Service   │     │ Payment Service │     │  Order Service  │
│    (Port 5000)  │     │    (Port 5001)  │     │    (Port 5002)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         │                       ▼                       │
         │               ┌───────────────┐               │
         └──────────────►│  sendLog()    │◄──────────────┘
                         │  via axios    │
                         └───────┬───────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │   Logging Service   │
                      │     (Port 4000)     │
                      │  (server.ts,        │
                      │   logRouter.ts)     n│
                      │  POST /api/log      │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │   pushLogToQueue()  │
                      │    (logger.ts)      │
                      │  Ajoute au stream   │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │    Redis Stream     │
                      │   "logs-stream"     │
                      │                     │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │     Log Worker      │
                      │                     │
                      │  Lit depuis Redis   │
                      │  Filtre les logs    │
                      │  (warn et error)    │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │    Winston Logger   │
                      │                     │
                      │  Écrit dans le      │
                      │  fichier app.log    │
                      └─────────────────────┘
```

## Flux de données détaillé

1. **Génération des logs (Microservices)**

   - Les microservices (Auth, Payment, Order) génèrent des événements à logger
   - Chaque service utilise la fonction `sendLog(service, level, message)`
   - Cette fonction envoie une requête HTTP POST au service de logging

2. **Réception des logs (Logging Service)**

   - Le service de logging reçoit les logs via l'endpoint `POST /api/log`
   - Il valide les données (service, level, message)
   - Il affiche les logs dans la console pour le débogage
   - Il appelle `pushLogToQueue()` pour transférer le log à Redis

3. **Mise en file d'attente (Redis Stream)**

   - Les logs sont ajoutés à un stream Redis nommé "logs-stream"
   - Format: `{ service, level, message, timestamp }`
   - Redis agit comme tampon entre la réception et le traitement

4. **Traitement des logs (Log Worker)**

   - Le worker s'exécute en continu et lit les logs depuis Redis
   - Il filtre les logs selon leur niveau (ne garde que "warn" et "error")
   - Il transmet les logs importants à Winston pour persistance
   - Il supprime les entrées traitées de Redis (xdel)

5. **Persistance des logs (Winston)**
   - Winston écrit les logs filtrés dans `src/logging-service/logs/app.log`
   - Format JSON: `{ level, message, service, timestamp }`

## Avantages de cette architecture

- **Découplage** : Les services n'ont pas besoin de connaître les détails du logging
- **Asynchrone** : Les services ne sont pas bloqués par l'écriture des logs
- **Résilience** : Redis permet de tamponner les logs en cas de surcharge
- **Filtrage** : Seuls les logs importants sont persistés
- **Extensibilité** : Facile d'ajouter de nouveaux services ou destinations de logs

Cette architecture permet de gérer efficacement les logs de plusieurs microservices tout en maintenant de bonnes performances et une bonne séparation des responsabilités.
