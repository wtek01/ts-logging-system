# Terminal 1: Démarrer Redis

docker run -d --name redis -p 6379:6379 redis
docker start redis

# Terminal 2: Service de logging (API) Port 4000

npm run dev:logging

# Terminal 3: Worker (Processeur de logs) Port 4001

npm run dev:worker

# Terminal 4: Service d'auth (Client) Port 5000

npm run dev:auth

# Terminal 5: Service de paiement (Client) Port 5001

npm run dev:payment

# Terminal 6: Service de commande (Client) Port 5002

npm run dev:order

# Test APIs

- Auth Service
  curl -X POST http://localhost:5000/login

- Logging Service
  curl -X POST http://localhost:5001/api/payment

- Order Service
  curl -X POST http://localhost:5002/api/order
