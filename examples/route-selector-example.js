/**
 * Route selector — illustrative example.
 *
 * Written from scratch for this portfolio repository. This is NOT the client's
 * code and not a reconstruction of it; it is a sketch of the routing shape
 * described in CASE_STUDY.md section 3.
 *
 * The one rule worth taking from it: a channel maps to exactly one knowledge
 * store, and anything unmapped resolves to null rather than to a default.
 * A default store is how a question about one product quietly gets answered
 * from another product's documents.
 *
 * All identifiers come from the environment. Nothing real is hard-coded here,
 * and nothing real should be hard-coded anywhere.
 */

'use strict';

/**
 * channel id -> vector store id
 *
 * One edition per store. Never two editions in one store: once a document is
 * a chunk of text among other chunks, retrieval cannot reliably tell which
 * edition a passage belongs to, and the model will join a paragraph from one
 * edition to a paragraph from another without any sign that it has done so.
 */
const CHANNEL_ROUTES = Object.freeze({
  [process.env.CHANNEL_PRODUCT_A_ED1]: process.env.STORE_PRODUCT_A_ED1,
  [process.env.CHANNEL_PRODUCT_A_ED2]: process.env.STORE_PRODUCT_A_ED2,
  [process.env.CHANNEL_PRODUCT_A_ED3]: process.env.STORE_PRODUCT_A_ED3,
  [process.env.CHANNEL_PRODUCT_B]:     process.env.STORE_PRODUCT_B,
  [process.env.CHANNEL_PRODUCT_C]:     process.env.STORE_PRODUCT_C,
  [process.env.CHANNEL_GENERAL]:       process.env.STORE_GENERAL_SUPPORT,
});

/**
 * Keyword fallback, scoped to ONE product's channel only.
 *
 * This exists for the case where a single channel legitimately covers more
 * than one document set — for example a general channel that should reach the
 * support store for ordering questions. It is deliberately narrow: it can only
 * ever select among stores explicitly listed for that channel, so it cannot
 * reach across to another product.
 */
const KEYWORD_ROUTES = Object.freeze({
  [process.env.CHANNEL_GENERAL]: [
    { match: /\b(order|shipping|delivery|replacement|missing piece)\b/i,
      store: process.env.STORE_GENERAL_SUPPORT },
  ],
});

/**
 * Resolve the single knowledge store for a message.
 *
 * @param {{channelId: string, content: string}} message
 * @returns {string|null} store id, or null when nothing is mapped
 */
function selectStore(message) {
  const { channelId, content } = message;

  if (!channelId) return null;

  // 1. Keyword rules, but only among stores allowed for THIS channel.
  const scoped = KEYWORD_ROUTES[channelId];
  if (Array.isArray(scoped)) {
    for (const rule of scoped) {
      if (rule.store && rule.match.test(content ?? '')) {
        return rule.store;
      }
    }
  }

  // 2. The channel's own store.
  const store = CHANNEL_ROUTES[channelId];
  if (store) return store;

  // 3. Nothing mapped. Return null — never a default.
  return null;
}

/**
 * Guard to call before querying anything.
 *
 * An unmapped channel is not an error to be worked around. It is the designed
 * behaviour: the assistant stays silent rather than answering from documents
 * that do not apply.
 */
function shouldAnswer(message) {
  return selectStore(message) !== null;
}

module.exports = { selectStore, shouldAnswer, CHANNEL_ROUTES, KEYWORD_ROUTES };
