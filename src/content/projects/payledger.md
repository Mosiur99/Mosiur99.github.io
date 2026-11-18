---
title: PayLedger
summary: >-
  A double-entry payments ledger built as two Spring Boot services. Designed so that money moves
  exactly once, even when clients retry and message brokers fail.
kind: system
status: complete
featured: true
year: 2026
stack: [Java, Spring Boot, PostgreSQL, Kafka, Keycloak, Kubernetes, Testcontainers]
highlights:
  - Concurrent transfers lock accounts in a fixed order to avoid deadlocks
  - Idempotency keys stored in the same database transaction as the payment
  - Transactional outbox to Kafka, with retries and a dead-letter topic on the consumer
  - Keycloak security, Prometheus and Grafana metrics, distributed tracing, Helm chart; 142 tests
flow: [Client, payments-service, PostgreSQL + outbox, Kafka, notification-service]
links:
  - label: Source code
    url: https://github.com/Mosiur99/payledger
order: 1
---
