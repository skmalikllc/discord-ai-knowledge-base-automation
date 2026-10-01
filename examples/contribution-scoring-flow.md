# Contribution scoring — step by step

The scoring path turns Discord activity into an auditable record. Each step exists because of a specific way the previous version of this idea goes wrong.

All identifiers are placeholders.

---

## 1. Message received

The listener picks up activity in the channels that count. Not every message is a contribution, and the filter sits here rather than downstream — anything that obviously does not qualify should never reach the webhook, because every step after this one costs something.

## 2. Duplicate check

Before anything is classified, the event is checked against the existing contribution log.

This is second, not last, for two reasons: a repeat costs nothing downstream if it is caught here, and a scoring system that can double-count is a scoring system members stop trusting the first time someone notices. An edited message, a retried webhook and a replayed event all arrive looking like new activity.

If it is already logged, the flow stops here.

## 3. AI classification

What kind of contribution is this? The classifier reads the content and assigns a type.

Classification is a judgement, so it has a third outcome besides the types: **unresolved**. An event the classifier cannot place is not forced into the nearest category — it goes to the needs-attention queue for a person to look at. Guessing a type is how a scoring system drifts away from describing anything real.

## 4. Activity type

The assigned type determines what the contribution is worth. Types are deliberately coarse. A long list of finely-weighted activity types looks more precise and is harder to explain, and a scoreboard members cannot explain to each other generates disputes.

## 5. Daily cap

Each activity type has a cap per member per day. What exceeds it is logged as activity but does not score.

This is the step that makes the whole thing work. **Without a cap, the cheapest activity to repeat becomes the only activity anyone does** — the score stops measuring contribution and starts measuring persistence. The cap is per type rather than per member overall, so a member doing several different kinds of thing is not penalised for being active in more than one way.

## 6. Airtable log

The surviving contribution is written to the log in base AIRTABLE_BASE_ID_REMOVED: who, what type, when, and the reference needed to find the original.

The log is the record. Everything else is derived from it.

## 7. Member score update

The member's score is **recomputed from the log**, not incremented in place.

A derived score can be rebuilt, which matters the first time a member says their total is wrong: the log can be read back and the number explained. An incremented counter cannot be audited — once it is wrong, there is nothing to compare it against, and the only repair is a guess.

---

## What the score then drives

Score, together with days served and warning state, feeds the rank evaluation in [rank-promotion-logic.md](rank-promotion-logic.md). Scoring does not promote anyone by itself.
