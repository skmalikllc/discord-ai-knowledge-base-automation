# Operator dashboard — concept note

This is a design note, not a shipped screen. No screenshot of the client's dashboard appears in this repository.

## What it is for

The dashboard answers one question: **is anything wrong right now?**

That framing matters, because the alternative — a dashboard that shows how well things are going — is the kind nobody opens after the first week. Every panel below exists because a specific failure in this stack is silent, and a silent failure needs somewhere to become visible.

## Panels

**AI status.** Is the assistant up, and is it answering? Up and answering are different questions: the process can be healthy under PM2 while every reply is a failure, which is what an exhausted credit balance looks like from the outside.

**Server health.** Process state, uptime, restarts, disk and memory on the Ubuntu host. A restart loop is worth seeing as a count rather than discovering in a log.

**Credit balance.** The usage-based billing panel, and the one with the clearest justification. When the balance runs out the API returns a 429, the assistant stops answering, and nothing alerts anyone — members assume the bot is broken and do not report it, because a bot that is down is not a bug anyone feels responsible for. A balance on screen, or auto-recharge, or both.

**Members.** Member count and recent joins, as the denominator for everything else. A drop in questions means one thing in a growing community and another in a shrinking one.

**Needs attention.** The work queue: rank promotions waiting on staff approval, classifications the scoring path could not resolve, and unanswered questions in mapped channels. Anything that needs a human decision belongs here rather than in someone's memory.

**Store performance.** Per knowledge store: questions asked, answers given, and refusals. The refusal count is the useful number — because the refusal phrase is fixed, it is countable, and a store with a high refusal rate is telling you its documentation has a gap, not that the assistant is underperforming. Handing that list to the document owner is the single most valuable output of the whole system.

**Game rooms coverage.** Which rooms have a store mapped and which do not. Unmapped is a legitimate state — unmapped channels deliberately return nothing — but it should be visible as a known gap rather than looking like a broken room.

**Automation health.** Scenario runs, failures and last successful run for the scoring and rank paths. The promotion bug described in [../examples/rank-promotion-logic.md](../examples/rank-promotion-logic.md) is the argument for this panel: the scenario was running, reporting success, and promoting nobody. "Last run succeeded" is not the same as "last run did something", so the panel shows counts, not just status.

## Design constraints

- One screen. If it needs scrolling to find a problem, the problem gets found later.
- Red is reserved for something that is actually broken and actually needs a person. A dashboard that is always a bit red is a dashboard nobody reads.
- Every number on it should be traceable to a record. A figure you cannot drill into is a figure you cannot act on.
