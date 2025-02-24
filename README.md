# 🚀 Microservices Logging System

## 📌 Overview

The **Microservices Logging System** is a centralized logging solution designed to collect, store, and analyze logs from multiple microservices. This system ensures **real-time log aggregation**, **structured storage**, and **scalability** for monitoring and debugging microservices in a distributed architecture.

## ✅ Features

- **Centralized Logging Service**: Receives logs from multiple microservices via an HTTP API.
- **Distributed Microservices**: Logging for authentication, payments, and orders.
- **Structured JSON Logging**: Logs stored in a structured format for easy querying.
- **Asynchronous Log Processing**: (Future) Supports Kafka/Redis for log streaming.
- **Storage Options**: File-based logging, database integration (Elasticsearch), and log queues.
- **Real-time Log Monitoring**: (Future) Kibana/Grafana visualization for log analysis.

## 🏗️ Architecture

### **Microservices & Logging Flow**

1️⃣ **Microservices (Auth, Payment, Order)** generate logs.
2️⃣ **Logs are sent to the Central Logging Service** via HTTP API.
3️⃣ **Logs are processed and stored** in a file system, message queue, or database.
4️⃣ (Future) **Log aggregation & visualization** using Elasticsearch/Kibana or Loki/Grafana.

### **📂 Project Structure**

```
📂 ts-logging-system
 ├── 📂 src
 │    ├── 📂 config                 # Environment & service configs
 │    ├── 📂 logging-service        # Centralized logging system
 │    │    ├── 📂 logs              # Stored log files
 │    │    ├── 📂 middleware        # Express middleware
 │    │    │    ├── logMiddleware.ts # Request logging middleware
 │    │    ├── 📂 services          # Core logic for log processing
 │    │    │    ├── logService.ts   # Handles log processing
 │    │    │    ├── logProcessor.ts # Processes logs asynchronously
 │    │    │    ├── logRepository.ts # Database or file storage handler
 │    │    ├── 📂 transports        # Log storage mechanisms
 │    │    │    ├── fileTransport.ts  # Stores logs in files
 │    │    │    ├── queueTransport.ts # Stores logs in Redis/Kafka queues
 │    │    │    ├── dbTransport.ts    # Stores logs in Elasticsearch/PostgreSQL
 │    │    ├── 📂 routes            # API routes
 │    │    │    ├── logRouter.ts     # API for log ingestion
 │    │    ├── server.ts             # Main Express server
 │    │    ├── logger.ts             # Winston logger setup
 │    │    ├── logConfig.ts          # Logging configuration
 │    ├── 📂 microservices          # Services generating logs
 │    │    ├── 📂 auth-service       # Authentication service
 │    │    │    ├── server.ts        # Express server for auth service
 │    │    │    ├── authController.ts # Handles authentication routes
 │    │    │    ├── authService.ts   # Business logic for authentication
 │    │    │    ├── logger.ts        # Sends logs to logging-service
 │    │    ├── 📂 payment-service    # Payment microservice
 │    │    │    ├── server.ts        # Express server for payment service
 │    │    │    ├── paymentController.ts # Handles payment routes
 │    │    │    ├── paymentService.ts # Business logic for payments
 │    │    │    ├── logger.ts        # Sends logs to logging-service
 │    │    ├── 📂 order-service      # Order microservice
 │    │    │    ├── server.ts        # Express server for order service
 │    │    │    ├── orderController.ts # Handles order routes
 │    │    │    ├── orderService.ts  # Manages orders
 │    │    │    ├── logger.ts        # Sends logs to logging-service
 ├── 📂 tests                        # Unit and integration tests
 │    ├── loggingService.test.ts     # Test centralized logging
 │    ├── authService.test.ts        # Test auth microservice
 │    ├── paymentService.test.ts     # Test payment microservice
 │    ├── orderService.test.ts       # Test order microservice
 ├── package.json
 ├── tsconfig.json
 ├── README.md
```

## 🛠️ Technical Stack

- **Backend Framework**: Node.js (Express.js)
- **Logging Library**: Winston
- **Storage Options**: Local files, Redis, Elasticsearch (Future)
- **Messaging System (Future)**: Kafka/Redis for log streaming
- **Monitoring & Visualization (Future)**: Kibana/Grafana
- **Containerization (Future)**: Docker for microservices deployment

## ⚡ Getting Started

### **1️⃣ Install Dependencies**

```sh
npm install
```

### **2️⃣ Start the Logging Service**

```sh
npm start loggingService
```

### **3️⃣ Start a Microservice (e.g., Auth Service)**

```sh
npm start authService
```

### **4️⃣ Send a Log Event from a Microservice**

```sh
curl -X POST http://localhost:5000/login
```

## 🚀 Next Steps

- ✅ Expand logging to **Payment & Order services**.
- 🔜 Integrate **Kafka/Redis for asynchronous log streaming**.
- 🔜 Store logs in **Elasticsearch for real-time search**.
- 🔜 Implement **Kibana/Grafana for log visualization**.

## 📜 License

MIT License
