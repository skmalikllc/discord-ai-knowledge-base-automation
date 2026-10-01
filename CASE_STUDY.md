# Case study — Discord AI knowledge base and contribution automation

Sanitized write-up of a completed engagement. The client is referred to throughout as CLIENT_NAME_REMOVED. Products are referred to by letter, and editions by number, rather than by their real titles. Nothing in this document is taken from the client's own files.

---

## 1. Client challenge

CLIENT_NAME_REMOVED runs a Discord community around a catalogue of documentation-heavy products. Several of those products have more than one edition in active use at the same time, each with its own document set, and the sets were assembled over years by different people.

Three problems ran together.

**Support did not scale.** The same questions arrived every week and were answered by hand by a small number of people. The documentation already contained the answers.

**A naive assistant would have made it worse.** The straightforward build — one knowledge base holding everything, one assistant reading it — produces blended answers across editions. A member acts on an answer, another member contradicts it from their own copy, the dispute is settled against the assistant, and from that point the assistant is something people check rather than something people use. Recovering that trust is harder than earning it the first time.

**Contribution went unrecognised.** The community wanted active members recognised and ranks awarded on a consistent basis, instead of depending on who happened to be watching a channel that week.

## 2. Solution overview

Two independent systems sharing only Discord.

**The Q&A path.** A Node.js Discord bot running under PM2 on an Ubuntu server at SERVER_IP_REMOVED. A message in a mapped channel is routed to exactly one knowledge store, the store is queried, and the answer is posted back with its source document named. The bot is not allowed to answer in channels that are not mapped.

**The automation path.** A listener forwards qualifying activity to a Make.com webhook. The activity is deduplicated and classified, scored under a per-day cap, and written to the member's contribution log in Airtable. Member score drives a rank evaluation, and approved rank changes are synced back to Discord as role changes.

Keeping the two apart was deliberate. The knowledge base can be rebuilt, or the assistant taken offline entirely, without touching scoring; and a scoring fault cannot change what the assistant says.

## 3. AI knowledge routing

The central design decision is that **versions are isolated, not tagged**.

The tempting approach is to put every edition in one store, label each document with its edition, and let the model filter. It does not hold up. Once a document is a chunk of text among other chunks, retrieval has no reliable way to tell which edition that passage belongs to, and metadata filtering is only as good as the labelling — which in a real document set is inconsistent. The output is a paragraph from edition two joined to a paragraph from edition three, in one confident reply that matches neither printed copy.

So: one edition, one store, one channel. The routing layer resolves the store from the channel before the model is involved, which means the model is never in a position to mix them.

Three rules sit on top of routing:

1. **Unmapped means unanswered.** The route selector returns nothing rather than a default store. A default store is exactly how a question about one product quietly gets answered from another's documents.
2. **Refusal is a feature.** Where the answer is not explicitly present, the assistant returns one fixed phrase and adds nothing after it. Absence is never treated as proof of the negative — "the document does not say you may" is not "you may not". A fixed refusal string has a second use that is easy to miss: it makes gaps countable. Search the logs for that exact sentence and you have a ranked list of what the documentation does not cover, which is the most useful thing to hand back to whoever owns the documents.
3. **Conflicts surface, they do not resolve.** Real document sets contradict themselves — a base document and a variant, an original and an amendment nobody merged. Left alone the model picks one silently and the conflict is never discovered. The instruction is to present both, name each, and state that they disagree.

A sketch of the routing shape is in [examples/route-selector-example.js](examples/route-selector-example.js).

## 4. Contribution scoring workflow

Activity in Discord becomes a scored, auditable record:

1. A qualifying message or event is picked up by the listener.
2. It is checked against the existing log so the same contribution cannot be counted twice.
3. It is classified by activity type.
4. The daily cap for that activity type is applied.
5. What survives is written to the contribution log in Airtable, base AIRTABLE_BASE_ID_REMOVED.
6. The member's running score is updated from the log.

The daily cap per activity type is what stops the path being farmed. Without it, the cheapest activity to repeat becomes the only activity anyone does, and the score stops describing contribution at all.

Full step-by-step in [examples/contribution-scoring-flow.md](examples/contribution-scoring-flow.md).

## 5. Rank promotion automation

Rank is evaluated from the member record rather than awarded by hand. The checks are score, days served, and warning state.

The ranks are split. **Lower ranks promote automatically** when the requirements are met. **Higher ranks are held for staff or admin approval** — a scoring system is a reasonable way to recognise participation and a poor way to hand out standing in a community, so the automation prepares the decision and a person makes it. Approved changes are synced to Discord as role updates.

One real bug is worth recording, because it is the kind that hides well: a member's promotion status was being set to a terminal "promoted" value, and the evaluation then skipped anyone carrying that value. The first promotion worked. Every promotion after it silently never happened, and from the outside the automation looked healthy. Fixed by treating promotion status as the result of the most recent evaluation rather than a permanent flag on the member.

Details in [examples/rank-promotion-logic.md](examples/rank-promotion-logic.md).

## 6. Dashboard and scoreboard improvements

The scoreboard the community sees and the dashboard the operator needs are different products with different audiences.

The member-facing scoreboard ranks contribution and needs to be legible at a glance, stable enough that members trust it, and clear about what earns points — an opaque scoreboard generates more disputes than it settles.

The operator dashboard answers one question: is anything wrong right now? Assistant status, server health, usage credit balance, member counts, items needing attention, per-store performance, room coverage, automation health. The concept and the reasoning behind each panel are in [docs/dashboard-mockup-note.md](docs/dashboard-mockup-note.md).

## 7. A worked example — Ruleset C

Taking one knowledge base through the full process, with the real title withheld.

Ruleset C is a large two-theatre edition. The document set covers the whole game but is naturally split, and it has a separate document history from the other editions of the same product line.

- **Collect.** Source documents pulled from the shared Google Drive folder the client maintains.
- **Verify before loading.** Each file was checked by reading what had actually been extracted, not by trusting the file name or the indexer's success report. This is where most of the time went, and it is why section 8 exists.
- **Build alongside.** The store, VECTOR_STORE_ID_REMOVED, was built as a new store rather than by emptying and refilling an existing one.
- **Route.** One channel, DISCORD_CHANNEL_ID_REMOVED, mapped to that one store. No fallback.
- **Test.** In-scope questions checked against the printed documents; out-of-scope questions checked for the refusal phrase; a question belonging to a different edition asked deliberately in this channel to confirm it is not answered from here.
- **Repoint.** One routing value changed. The previous store kept for a week, so rollback was one line rather than a re-upload under pressure.

## 8. Testing and verification

What this engagement taught about verification is that **every failure mode in this stack is silent**.

- **Conversion failures do not report themselves.** A PDF with sideways column headers extracts as scrambled text — numbers with no labels attached. File size looks healthy. The indexer reports success. The content is worthless.
- **A near-empty file indexes as complete.** A file can extract to almost nothing and still be accepted into a production store, where it can sit unnoticed for a long time.
- **Filenames lie.** Across one project: a store whose name did not match the edition of the files inside it, a folder of "converted" documents that had never been converted, and a store whose contents belonged to a different product than its name suggested. Verify by reading content, never by reading names.
- **Usage-based billing fails quietly.** An exhausted credit balance returns a 429 and the assistant simply stops answering. Nothing alerts anyone, and members do not report it — a bot that appears broken is not a bug anyone feels responsible for. Monitor the balance, enable auto-recharge, or both.
- **A fixed refusal phrase is a test instrument.** Because the phrase is exact, it can be asserted on. "Does it decline when it should" becomes a check that passes or fails rather than a judgement call.

So the acceptance test for a knowledge base was never "the upload succeeded". It was: read the extracted text, ask questions whose answers you already know, ask questions whose answers are not in the documents, and ask a question from the wrong edition.

## 9. Lessons learned

1. **Design the refusal before the answer.** For a community built on rules, a confident wrong answer costs more than a hundred declined ones.
2. **Isolate, do not tag.** No amount of prompt instruction fixes a knowledge base that physically contains two editions of the same rule.
3. **Return nothing rather than a default.** A fallback store is a silent cross-contamination route.
4. **Make answers checkable.** Naming the source document turns a dispute into a ten-second lookup. Without it, an invented answer, a wrongly retrieved document and a genuinely out-of-date document all look identical from the outside — and all three have different fixes.
5. **Narrow your suppression instructions.** Turning off the retrieval system's ugly inline citation markers with a broad instruction will also remove the plain-text source naming you asked for one line earlier, and nobody notices until someone asks where an answer came from.
6. **Separate the paths that do not need each other.** Being able to rebuild the knowledge base without stopping scoring was worth the small extra cost of keeping them apart.
7. **Cap anything that can be repeated.** An uncapped activity type is the only activity type that will happen.
8. **Treat state as the result of the last evaluation, not a permanent flag.** The promotion bug in section 5 is the general case: a terminal status field will eventually be the reason something stops running, and it will stop quietly.
9. **Automate the recommendation, not the authority.** Low-stakes promotions are a good fit for automation; standing in a community is not.
10. **Record what is not done.** Two products were identified as not yet wired. Writing that down as outstanding is more useful to the client than a clean-looking list that silently omits them.

## Privacy

No client or community name, server address, credential, store, base, table or channel identifier, document content, product title, member name or screenshot appears in this document. See [docs/privacy-and-sanitization.md](docs/privacy-and-sanitization.md).
