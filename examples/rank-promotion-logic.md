# Rank promotion — logic and the bug

How rank is evaluated, which promotions are automatic, and the failure that hid in this for a while.

---

## The checks

Every member is evaluated against the requirements for the next rank:

- **Score** — from the contribution log, derived rather than incremented. See [contribution-scoring-flow.md](contribution-scoring-flow.md).
- **Days served** — time in the current rank. Score alone rewards a burst of activity; days served is what makes a rank mean sustained participation.
- **Warning state** — active warnings block promotion.

All three are checked. Meeting the score requirement is not sufficient on its own.

## Two tiers, deliberately

**Lower ranks promote automatically.** The requirements are met, the rank is updated, the Discord role follows. No human in the loop, because there does not need to be one — these ranks recognise participation, and participation is exactly what the score measures.

**Higher ranks require staff or admin approval.** The automation does the evaluation and puts the member forward; a person decides. Standing in a community is not the same thing as a point total, and the cases where someone qualifies numerically but should not be promoted are precisely the cases an automation cannot see.

The automation's job at the top end is to make sure nobody eligible is overlooked — not to decide.

## Discord role sync

Once a rank change is approved, the role is applied in Discord.

The member record is the source of truth and the role is a reflection of it. If the two disagree — a role removed by hand, a sync that failed halfway — the record wins and the next run corrects the role. That direction is worth fixing early; the other direction gives you two systems that each think they are authoritative.

---

## The bug: `Promotion Status = Promoted` blocked all future checks

**Symptom.** Members were promoted once and then never again. Nobody reported it as a bug, because one successful promotion looks like the system working, and the absence of a second promotion months later looks like not having earned it yet.

**Cause.** Promotion status was being written as a terminal value — `Promoted` — on the member record, and the evaluation excluded members carrying that value. The exclusion was there for a sensible-sounding reason: don't re-process someone who has just been promoted. But it was written as a permanent property of the member instead of a property of one evaluation run, so the exclusion never expired.

The result: the scenario ran on schedule, reported success every time, and promoted nobody. From the dashboard it was healthy.

**Fix.** Promotion status became the **outcome of the most recent evaluation** rather than a flag that sticks to the member. Every member is re-evaluated on every run; the status field records what the last run decided, and a member who was promoted last month is simply evaluated again against the requirements for their new rank.

**The general lesson.** A terminal status field will eventually be the reason something stops running, and it will stop quietly. If a value excludes a record from future processing, something has to clear it — and "something has to remember to clear it" is not a mechanism. Deriving the status from the latest run removes the need to clear anything at all.

**What it changed about monitoring.** "Last run succeeded" was true throughout. The automation-health panel in [../docs/dashboard-mockup-note.md](../docs/dashboard-mockup-note.md) shows counts rather than status because of this bug: a run that processed zero members is not the same as a run that worked.
