---
title: MarketPulse
summary: >-
  A Python service on Binance's live trade feed. An LLM agent answers market questions by calling
  the service's own tools, cites the API docs it searched, and is measured by retrieval and answer
  evaluations.
kind: ai
status: complete
year: 2026
stack: [Python, FastAPI, PostgreSQL, pgvector, Groq, Docker, Prometheus]
highlights:
  - 'Hand-written tool-calling agent: validated arguments, step and time limits, prompt-injection guard'
  - 'Hybrid search (pgvector + full-text), improved by its own eval: hit rate 0.80 to 0.90'
  - 'Answer eval graded by rule on a frozen market snapshot: 14 of 15, no made-up figures'
  - Telegram alerts and an AI-written daily summary, never sent twice; Docker, Prometheus, 199 tests
flow: [Binance feed, Ingestor, PostgreSQL + pgvector, Agent + tools, Telegram]
links:
  - label: Source code
    url: https://github.com/Mosiur99/marketpulse
order: 4
---
