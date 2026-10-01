# Privacy and sanitization

This repository is a **sanitized portfolio case study**. It describes work I did, at the level of design decisions, architecture and operational lessons. It is not the delivered system, and it is not a redacted copy of the delivered system.

## What is not here, and will not be

- The client's name, the community's name, and the names of any individuals involved
- Product and edition titles from the client's catalogue
- Any rules text, document content, or file from the client's document set
- Server address or hostname
- API keys, bot tokens, webhook URLs, OAuth credentials, `.env` files or any part of their contents
- Vector store IDs, Airtable base or table IDs, Discord server/channel/role IDs, record IDs
- Client email addresses, message history, or screenshots of any conversation
- Member names, usernames, handles, scores or rank records
- Screenshots of the live Discord server, the Airtable base, the Make scenarios, the dashboard or the server
- Order numbers, invoices, pricing or anything else identifying the commercial arrangement
- Any code from the client's implementation

## Placeholders

Where a value would otherwise appear, the repository uses a visible placeholder so it is obvious that something was removed rather than never existed:

```
SERVER_IP_REMOVED
VECTOR_STORE_ID_REMOVED
AIRTABLE_BASE_ID_REMOVED
DISCORD_CHANNEL_ID_REMOVED
CLIENT_NAME_REMOVED
```

Products are referred to by letter and editions by number. The mapping from those letters to real titles is not published and is not derivable from anything here.

## The example files

`examples/route-selector-example.js` was written from scratch for this repository. It is an illustrative sketch of the routing shape described in the case study — not an extract from, a copy of, or a reconstruction of the client's code. The environment variable names in it are invented for the example.

## Why the sanitization goes this far

Two reasons.

The obvious one is that credentials and identifiers are live attack surface, and a community's channel and role IDs are not mine to publish.

The less obvious one is that **identification is cumulative**. A product title, a community size, and a platform combination are each harmless alone and together are enough for anyone to find the specific server this was built for. The members of that community did not agree to anything. So the rule applied here is not "remove the secrets" but "remove anything that narrows the field" — and where I was unsure whether a detail identifies the client, I left it out.

## What this costs the reader

Some specificity, honestly. A named product and a real document set would make the case study more vivid.

What survives sanitization is the part that transfers: why editions must be physically isolated rather than labelled, why a retrieval assistant should be built around declining, why every failure in this stack is silent, and what a scoring system should and should not be allowed to decide on its own. None of that depends on knowing whose community it was.
