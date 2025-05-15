# Food Ordering System - Microservices Architecture

![Architecture Diagram](docs/architecture.png)

A complete food ordering platform demonstrating hybrid microservices architecture with REST, GraphQL, gRPC, and Kafka.

## Features

- **Multi-protocol API Gateway** (REST + GraphQL)
- **Real-time order tracking** with Kafka events
- **High-performance** gRPC microservices
- **Containerized** with Docker

## Technology Stack

| Component          | Technology               |
|--------------------|--------------------------|
| API Gateway        | Express + Apollo GraphQL |
| Services           | gRPC with Protocol Buffers |
| Event Bus          | Kafka                    |
| REST API           | Express.js               |
| Containerization   | Docker Compose           |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/foodorderz.git
cd foodorderz

# 2. Start all services
docker-compose up -d --build

# 3. Verify services
docker-compose ps
