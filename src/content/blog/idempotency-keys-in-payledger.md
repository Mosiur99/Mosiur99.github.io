---
title: How an idempotency key keeps a payment from running twice
description: >-
  Why retries are dangerous for payment APIs, and how PayLedger stores the idempotency key's
  response in the same transaction as the money.
date: 2026-11-18
tags: [backend, payments, postgresql, spring-boot]
draft: true
---

A client sends a transfer request. The network drops the response. The client does not know if
the money moved, so it sends the same request again. Without protection, the customer pays twice.

This post shows how [PayLedger](https://github.com/Mosiur99/payledger), a double-entry payments
backend I built with Spring Boot and PostgreSQL, makes retries safe.

## The idea: an idempotency key

Every `POST /transfers` and `POST /deposits` request carries an `Idempotency-Key` header, a value
the client generates once per payment and reuses on every retry of that payment.

A servlet filter claims the pair `(caller, key)` by inserting a row, stores a SHA-256 hash of the
request body, and saves the response when the request finishes. Later requests with the same key
get one of these answers:

| Situation                                | Result                                      |
| ---------------------------------------- | ------------------------------------------- |
| Same key, same request, already finished | The stored response is replayed             |
| Same key, still running                  | `409 Conflict`                              |
| Same key, different request body         | `422 Unprocessable Content`                 |
| The first attempt failed with a `5xx`    | The key is released so the client can retry |

A test sends the same request ten times at once and checks that exactly one transfer happens.

## The gap that is easy to miss

Claiming the key and moving the money are two different steps. Imagine this order:

1. The filter claims the key.
2. The transfer commits. The money has moved.
3. The service crashes before the response is stored.

The key now stays "unfinished" forever. Every retry gets `409`, and the client never learns that
the payment went through.

## Closing the gap with one transaction

The fix is to make storing the response part of the same database transaction as the money. The
filter opens a transaction that the services join, and it stores a successful response in that
transaction just before it commits.

The money moves **if and only if** its response is stored. So an unfinished key can only belong
to a request that is still running, or to one that died without moving any money.

That second case still needs a way out. Each request's transaction times out after 30 seconds,
so a key that has been unfinished for more than a minute is safe to take over: the next retry
claims it and runs the payment.

A recovery test makes storing the response fail on purpose, then checks that the transfer rolls
back and that the retry runs exactly once.

## Why the database and not Redis

The key and the money live in the same PostgreSQL instance. There is no second system that could
disagree with the first, and no distributed transaction to get wrong. The cost is one extra write
per request and a cleanup job for old keys.

## What to take away

- Retries are normal. Design write APIs so a retry is always safe.
- An idempotency key is only as strong as the place where its result is stored.
- If the result and the side effect commit together, there is no window in which they disagree.

The full design, with the other decisions behind PayLedger, is in the
[design document](https://github.com/Mosiur99/payledger/blob/main/docs/design.md).
