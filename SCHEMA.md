# Flow: microservices → logger.ts → Redis → logWorker.ts → app.log

## logger.ts: Front-end of logging system

- Receives logs via HTTP
- Shows all logs in console
- Queues logs in Redis

## logWorker.ts: Back-end processor

- Runs as separate process
- Filters logs by importance
- Writes filtered logs to file
- Handles persistent storage
