# Discord AI Knowledge Base + Contribution Automation System

A production Discord system for a documentation-heavy community: an AI assistant that answers questions from an approved document set, and a separate automation path that scores member contributions and drives rank promotion.

This is a sanitized portfolio case study. The client is not named, and no code, configuration, document set or identifier from the live system appears here. The two short examples in `examples/` were written from scratch for this repository.

## Problem solved

A community of this kind accumulates a large body of written material — one document set per edition of each product, built up over years by different hands. The material exists. Almost nobody reads it. The same questions repeat every week, and one or two people answer them by hand indefinitely.

Pointing a retrieval model at the documents and dropping it into a channel is the obvious fix, and it is where most of these builds go wrong. They do not fail loudly. They fail by producing answers that sound right and are not — blending two editions of the same ruleset into one confident reply that matches neither printed copy — until members stop trusting the assistant and go back to asking a human.

A second, unrelated problem ran alongside it: the community wanted member contribution recognised and ranks awarded consistently, rather than by whoever happened to be paying attention.

## My role

Sole implementer. Server setup and process management, the Discord bot, knowledge-base preparation and loading, the routing layer, the scoring and rank automation, the operator dashboard concept, testing and verification, and the written handover.

## Key features

- **Per-edition knowledge isolation.** One edition, one knowledge store, one channel. The routing layer picks the store before the model sees the question, so editions cannot blend.
- **Refusal as a designed behaviour.** When the answer is not explicitly in the documents, the assistant returns one fixed phrase and stops. No speculation, no inference that something is disallowed because it is absent.
- **Source attribution on every answer.** A disputed answer can be checked in seconds against the member's own copy.
- **Conflict surfacing.** Where two documents disagree, both are presented and named as conflicting rather than silently resolved.
- **Contribution scoring.** Qualifying activity is classified, deduplicated, capped per day per activity type, and logged against the member record.
- **Rank promotion automation.** Lower ranks promote automatically against score, time served and warning state; higher ranks are held for staff approval. Role changes are synced back to Discord.
- **Operator dashboard concept.** One screen for assistant status, server health, usage credit balance, member counts, items needing attention, per-store performance, room coverage and automation health.

## Tech stack

Node.js · Discord bot · OpenAI vector stores · Airtable · Make.com · Google Drive · PM2 · Ubuntu server

## High-level architecture

```
   Approved documents, one set per edition
                     |
      +--------------+--------------+
      v              v              v
  +--------+     +--------+     +--------+
  | store  |     | store  |     | store  |
  | ed. 1  |     | ed. 2  |     | prod B |
  +--------+     +--------+     +--------+
      ^              ^              ^
      +--------------+--------------+
                     |
            reads exactly one
                     |
           +--------------------+
           |   Routing layer    |
           |  channel -> store  |
           +--------------------+
             ^              |
    question |              | answer, with
   + channel |              | source named
             |              v
           +--------------------+
           |      Discord       |
           +--------------------+
                     | activity events
                     v
           +--------------------+
           | Scoring automation |
           | dedupe, classify,  |
           | daily caps         |
           +--------------------+
                     v
           +--------------------+
           |  Member records    |
           | score, rank, log   |
           +--------------------+
                     v
           +--------------------+
           |     Role sync      |
           +--------------------+
```

The Q&A path and the scoring path share Discord and nothing else. The assistant can be taken offline for a knowledge-base rebuild without stopping scoring, and a scoring bug cannot change what the assistant answers. Full diagrams are in [docs/architecture.md](docs/architecture.md).

## Results

- Six knowledge bases loaded and routed, covering multiple editions of several separate products plus a general support set. Two further products were identified as not yet wired, and recorded as outstanding rather than quietly left out. See [docs/loaded-knowledge-bases.md](docs/loaded-knowledge-bases.md).
- Answers verified against the source documents for the routed stores, including deliberate out-of-scope questions to confirm the assistant refuses rather than improvises.
- Cross-edition contamination closed: questions asked in one edition's channel are answered only from that edition's store.
- Contribution scoring and rank promotion running end to end, with a promotion-status bug fixed that had been stopping members from being re-evaluated after their first promotion.

No throughput, accuracy-rate or engagement figures are published here. They were not measured under conditions I would be willing to quote, and I am not going to estimate them.

## Privacy note

This repository contains no client or community name, no server address, no API key or bot token, no store, base, table or channel identifier, no client document or rules text, no product names from the client's catalogue, no member names, and no screenshots of the live system. Placeholder values are used throughout. The reasoning is in [docs/privacy-and-sanitization.md](docs/privacy-and-sanitization.md).

## Repository contents

| Path | What it is |
|---|---|
| [CASE_STUDY.md](CASE_STUDY.md) | The full engagement write-up |
| [docs/architecture.md](docs/architecture.md) | Three flow diagrams, with notes on each |
| [docs/loaded-knowledge-bases.md](docs/loaded-knowledge-bases.md) | What was loaded and routed, sanitized |
| [docs/privacy-and-sanitization.md](docs/privacy-and-sanitization.md) | What is excluded and why |
| [docs/dashboard-mockup-note.md](docs/dashboard-mockup-note.md) | The operator dashboard concept |
| [examples/route-selector-example.js](examples/route-selector-example.js) | Illustrative routing sketch |
| [examples/contribution-scoring-flow.md](examples/contribution-scoring-flow.md) | The scoring path, step by step |
| [examples/rank-promotion-logic.md](examples/rank-promotion-logic.md) | The promotion rules and the bug |

## License

MIT.
