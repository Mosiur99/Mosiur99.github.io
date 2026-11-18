---
title: Real-Time Score Broadcaster
summary: >-
  Pushes live score updates to every connected browser without a page refresh, using a RabbitMQ
  fanout exchange and STOMP over WebSocket.
kind: real-time
status: complete
year: 2026
stack: [Java, Spring Boot, MySQL, RabbitMQ, WebSocket]
highlights:
  - Per-instance queues keep delivery reliable across multiple application servers
  - Score history stored as an append-only event log for a full match timeline
links:
  - label: Source code
    url: https://github.com/Mosiur99/Real_Time_Score_Broadcaster
order: 4
---
