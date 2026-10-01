# Architecture

Three flows. The first is the AI assistant, the second and third are the contribution automation. They share Discord and nothing else.

All identifiers are placeholders: SERVER_IP_REMOVED, VECTOR_STORE_ID_REMOVED, AIRTABLE_BASE_ID_REMOVED, DISCORD_CHANNEL_ID_REMOVED.

---

## 1. Discord AI Q&A flow

```
  Discord message
        |
        v
  Node.js Discord bot            (PM2, Ubuntu, SERVER_IP_REMOVED)
        |
        v
  Route selector                 channel -> exactly one store
        |                        unmapped channel -> no answer
        v
  OpenAI vector store            VECTOR_STORE_ID_REMOVED
        |                        one edition per store
        v
  AI answer                      from documents only,
        |                        source document named,
        |                        fixed phrase if not found
        v
  Discord reply
```

**Notes**

- The route selector runs before the model. Edition isolation is a property of the wiring, not of the prompt.
- There is no default store. An unmapped channel gets no answer at all, because a fallback store is how a question about one product gets answered from another's documents.
- The answer step has three required behaviours: answer only from what is explicitly in the documents; name the source; where two documents disagree, present both and say they conflict rather than choosing.
- Absence is never evidence. "The document does not say you may" is not "you may not".

---

## 2. Contribution scoring flow

```
  Discord message
        |
        v
  Listener bot                   qualifying activity only
        |
        v
  Make webhook
        |
        v
  Duplicate check                already logged? stop here
        |
        v
  AI classifier                  what kind of contribution is this
        |
        v
  Activity type                  -> daily cap for that type
        |
        v
  Airtable contribution log      AIRTABLE_BASE_ID_REMOVED
        |
        v
  Member score                   recomputed from the log
        |
        v
  Rank automation                (flow 3)
```

**Notes**

- The duplicate check sits before classification so a repeat costs nothing downstream.
- Score is derived from the log rather than incremented in place. A score you can rebuild from its own history is a score you can audit when a member disputes it.
- The daily cap is applied per activity type, not per member per day. Without it the cheapest activity to repeat becomes the only activity anyone does.

---

## 3. Rank promotion flow

```
  Airtable members
        |
        v
  Rank requirements              score + days served + warning state
        |
        v
  Make scenario                  evaluate every member, every run
        |
        +-- lower ranks  -------> auto-approve
        |
        +-- higher ranks -------> hold for staff / admin approval
                                        |
        v                               v
  Airtable rank update  <---------------+
        |
        v
  Discord role sync
```

**Notes**

- Every member is re-evaluated on every run. Nothing is excluded by a terminal status field — that was the cause of the promotion bug described in [../examples/rank-promotion-logic.md](../examples/rank-promotion-logic.md).
- The split between automatic and approved ranks is deliberate. The automation prepares the decision for the higher ranks; a person makes it.
- Discord role sync is the last step, so the member record is the source of truth and roles are a reflection of it. If the two disagree, the record wins and the next run corrects the role.
