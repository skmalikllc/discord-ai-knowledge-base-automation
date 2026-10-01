# Loaded knowledge bases

What was prepared, loaded and routed in this phase, with product titles withheld. Each store holds exactly one edition of one product; no store holds two editions.

| Knowledge area | Covers | Vector stores |
|---|---|---|
| A | Product A, early line | 3 — one per edition |
| B | Product B | 1 |
| C | Product C, a large two-theatre edition | 1 |
| D | Product D | 1 |
| E | Product E | 1 |
| GEN | General support and customer-service material | 1 |
| **Total** | **6 knowledge areas** | **8 vector stores** |

**Six routed knowledge areas, backed by eight vector stores.** The two numbers differ because Product A's three editions are three separate stores on three separate channels — which is the whole point of the design: a question asked in the edition-2 channel is answered from the edition-2 documents and from nothing else. A knowledge area is a product or support line; a store is one edition's documents.

The general support store is the one store that is not edition-specific. It covers ordering, shipping, replacement parts and similar questions, where there are no editions to confuse and the risk of a blended answer does not exist.

## Identified but not wired in this phase

Two further products were confirmed as **not yet wired**:

- Product F
- Product G

Neither has a store or a mapped channel. Questions about them are not answered by the assistant, which is the correct behaviour under the routing rule — an unmapped channel returns nothing rather than falling back to a store that would answer from the wrong documents.

These are recorded here rather than left out. A list that quietly omits what is missing is worse than useless to the person who has to plan the next phase.

## A note on counting

Six routed knowledge areas, backed by eight vector stores, means eight stores built, routed and tested against their own documents. It is not a claim about how much of each product's documentation is complete — several document sets had gaps, and the assistant's fixed refusal phrase is what makes those gaps countable. Closing them is the document owner's work, not the assistant's.
