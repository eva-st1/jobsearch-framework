---
name: write-linkedin-articles
description: Research, plan, draft, revise, and repurpose evidence-based LinkedIn articles or newsletter editions for a job seeker or professional, using AIDA without sounding formulaic and adapting to the author's demonstrated personality and prior tone of voice. Use when Codex needs to develop LinkedIn thought leadership, turn career experience into an article, find a timely professional angle, improve an article draft, create titles or calls to action, or assess voice fidelity and LinkedIn readiness.
---

# Write LinkedIn articles

Create useful, credible LinkedIn long-form content that sounds recognizably like the author. Treat attention as earned through specificity, not manufactured through hype.

## Prepare

1. Read `references/linkedin-writing-method.md` completely.
2. Read `references/research-basis.md` when researching an angle, evaluating LinkedIn practices, or making platform-specific recommendations.
3. Establish the article's topic, intended reader, professional objective, language, and desired reader action from available context.
4. Use the job-search profile when career evidence or professional voice is relevant. Run `npm run jobsearch -- health` and `npm run jobsearch -- profile show`; when available, use the imported `portfolio` text snapshot as the base professional narrative before supplementing it with interview or LinkedIn evidence. Do not expose private fields in chat.
5. Never invent, strengthen, or imply a career fact. Treat newly supplied facts as unverified until the user confirms them. Label draft placeholders rather than laundering uncertainty into prose.

## Build the voice model

Use evidence in this order:

1. Writing samples the user identifies as representative.
2. The user's prior authored messages or drafts in the current context.
3. Verified profile-source text that the user authored.
4. Explicit preferences and corrections.

Infer a compact voice card covering register, sentence rhythm, directness, warmth, humor, vocabulary, metaphor density, formatting, and recurring habits. Distinguish stable voice traits from topic-specific quirks. Preserve multilingual or non-native features when they are intentional and clear; improve errors without erasing personality.

If fewer than two representative samples exist or confidence is low, ask for two to five samples and one short calibration answer. Ask no more than three questions at a time. Useful questions are:

- Who should feel that this was written specifically for them?
- Which past piece sounds most like you, and what about it feels right?
- Which tones or common LinkedIn patterns should never appear in your writing?

Do not mimic another living writer or manufacture quirks to appear human. Do not use the inferred voice card as permission to add facts, opinions, or emotions the user has not expressed.

## Research the angle

1. Browse for current information because LinkedIn features, guidance, and professional conversations change. Prefer LinkedIn's own help, newsroom, and research, then primary studies and credible subject-matter sources.
2. Check the publication date, event date, and retrieval date. Refresh the baseline in `references/research-basis.md` when guidance has materially changed.
3. Separate source facts, the author's verified experience, and agent inference in working notes.
4. Seek an angle at the intersection of audience need, timely relevance, the author's defensible experience, and a non-obvious point of view.
5. Reject topics that require pretending to have expertise or experience the author cannot support.

## Shape with AIDA

Use AIDA as a diagnostic sequence, not visible section labels:

- **Attention:** Earn the click with a precise promise, tension, observation, or question. Make the headline and opening accurate enough to repay attention.
- **Interest:** Explain why the issue matters now. Add concrete context, a scene, credible research, or a useful contradiction.
- **Desire:** Help the reader want the better state: clearer judgment, less risk, a repeatable practice, or a new professional possibility. Support it with evidence, examples, and practical detail.
- **Action:** Offer one proportionate next step. For thought leadership this may be trying a practice, reconsidering an assumption, sharing a grounded example, or continuing the conversation—not necessarily buying anything.

If AIDA makes the piece salesy or linear, preserve the reader journey while using a story, argument, field note, case study, or how-to structure.

## Draft and revise

1. Create a one-sentence thesis and an evidence map before drafting.
2. Propose two or three materially different angles when the topic is broad or the positioning choice matters.
3. Draft for substance first. Use informative subheads, short readable paragraphs, and a headline that states a real benefit or tension.
4. Default to roughly 500–1,000 words only when current LinkedIn guidance still supports it; let the idea determine the final length.
5. Add citations or source links for external claims when useful. Never imply that research findings are the author's lived experience.
6. Run four revision passes:
   - truth and evidence;
   - usefulness and AIDA flow;
   - voice fidelity against the voice card and samples;
   - anti-slop editing for generic claims, canned hooks, false intimacy, engagement bait, inflated certainty, repetitive rhetorical templates, and decorative jargon.
7. Read the draft aloud conceptually. Vary rhythm only where the author's samples support it. Prefer precise nouns and verbs over manufactured punchiness.
8. Offer a cover-image concept and a short feed introduction only when useful or requested. Do not generate or publish media without authorization.

## Deliver

Provide the smallest useful package:

- the recommended title and final article;
- source links or a concise research note for factual claims;
- any fact, opinion, or anecdote still awaiting user confirmation;
- a one- or two-sentence voice-fidelity note when adaptation materially affected the draft.

When a decision materially changes positioning, show the alternatives before finalizing. Never claim or imply that the article was published. Do not create durable per-article files in this repository; keep durable job-search state in local PostgreSQL through the `jobsearch` CLI when a supported record type exists.
