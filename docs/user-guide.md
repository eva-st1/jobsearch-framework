# Jobsearch user guide

This guide is for the person using Jobsearch and for anyone helping them install it. The everyday workflow does not require coding.

## What Jobsearch is

Jobsearch is a private, local workspace for running a careful job search with an AI assistant. It brings together:

- the user's career evidence and job-search preferences;
- captured job advertisements and company research;
- a comparative match judgment for deciding where to focus;
- tailored CVs, cover letters, and application answers;
- application stages, interviews, feedback, and outcomes;
- a browser portal for reviewing the work and updating progress.

The AI assistant handles the evidence-heavy work through the repository's commands. The user talks to the assistant in ordinary language and uses the portal to review results, download documents, and track applications.

Jobsearch is not a job board, an automatic application bot, a hosted recruitment service, or a promise of employment. It does not submit an application unless the user does that separately, and it never marks one as applied without explicit confirmation.

## How the evidence model works

The framework deliberately keeps different kinds of information separate:

| Record | Meaning |
| --- | --- |
| Source snapshot | A faithful structured capture of a CV, portfolio, professional profile, interview, or job advertisement. It preserves what the source said at that time. |
| Career fact | One reusable claim about the user, such as a role, date, skill, qualification, or measured result. New facts remain unverified until the user confirms them. |
| Job snapshot | The captured vacancy text, source, date, and retrieval method. It remains available if the live advertisement later changes or disappears. |
| Research | Findings from named sources, with inferences labelled separately. |
| Positioning and match | A judgment about how the verified evidence relates to this opportunity. It helps compare opportunities; it is not an employer-response or hiring probability. |
| Artifact | A versioned CV, cover letter, application answer, or outreach message. A new revision is added instead of silently replacing history. |
| Event and outcome | A status change, interview, employer statement, observed result, hypothesis, or validated learning. These evidence classes remain distinct. |

Only verified career facts may appear in final application documents. Reordering, shortening, or rewording evidence is allowed; inventing or strengthening it is not.

## Privacy and ownership

This edition runs on one Mac for one user:

- PostgreSQL stores the structured profile and application history locally.
- Rendered HTML and PDF files are stored by content hash under the private, Git-ignored `.local/artifacts` directory.
- Personal source files, database backups, `.env` files, generated documents, and `.local` data are excluded from Git.
- The portal is available only through the Mac's loopback address; it is not a public website and has no cloud signup.
- Personal material must not be sent to an external AI or other provider unless the user approves both the provider and the information being shared.

Include `.local/artifacts` and `.local/backups` in Time Machine or another encrypted backup. A Git clone alone does **not** back up the user's profile, application history, or rendered documents.

## Permission to install or adapt it

The repository is publicly visible as a portfolio artifact, but public visibility does not make it open source. The owner retains all rights under [NOTICE.md](../NOTICE.md).

A person may view, link to, and discuss the repository. They need Eva Steen's written permission before copying, installing, adapting, deploying, or redistributing it. Permission can be narrow—for example, use by one named person for their own job search on one Mac.

An informal permission message could say:

> I give [name] permission to copy, install, and adapt the Jobsearch framework for their personal, non-commercial job search. This permission is personal and non-transferable and does not permit redistribution, resale, public hosting, or offering it as a service. Copyright and the repository notice remain in effect.

This example is practical wording, not legal advice. Contact Eva through [her portfolio](https://www.eva-steen.com/) or [LinkedIn](https://www.linkedin.com/in/evasteen/) to request permission.

## Choose how to operate it

### Codex on macOS

Codex is the primary supported experience. Clone the authorized copy, open its folder in the Codex app, and say:

> Set up Jobsearch for me. I am not technical, so please handle the setup, explain any permission request, and then interview me.

Codex reads the root `AGENTS.md` operating contract and the repository skills automatically. Official background: [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and [Codex skills](https://developers.openai.com/plugins/concepts/skills).

### Claude Code on macOS

The repository also includes a root `CLAUDE.md` and Claude-compatible project skills. Open the cloned folder in Claude Code and say:

> Read CLAUDE.md, set up Jobsearch for me, and begin the onboarding interview. I am not technical; ask before installing software or sharing personal data.

This requires **Claude Code**, which can read and operate the local repository. A normal browser chat with Claude cannot by itself install the local application or manage its database. Official background: [Claude Code memory](https://code.claude.com/docs/en/memory) and [Claude Code skills](https://code.claude.com/docs/en/slash-commands).

Codex and Claude Code are interfaces to the same local framework. The database and files belong to the user, not to one model. To avoid conflicting edits, use one coding agent at a time and let it finish before switching.

### Manual setup

A technical helper can install the system without an AI coding agent. Requirements are macOS, Node.js 22 or newer, PostgreSQL, and Chromium for Playwright.

```bash
git clone <authorized-repository-url>
cd jobsearch-framework
npm install
npm run setup:browser
npm run setup -- --name "Your Name" --email "you@example.com"
npm run jobsearch -- health
npm run jobsearch -- onboarding-status
npm run dev
```

Open `http://127.0.0.1:5173` after the development server starts. The manual path installs the application, but an agent or technical helper is still useful for importing evidence and operating the structured workflows safely.

## First-time onboarding

The assistant should inspect setup and stored onboarding state before asking questions. It asks one to three focused questions at a time, explains why sensitive information matters, and does not repeat answers already stored unless they appear contradictory or outdated.

The user may start from:

- an existing CV;
- a LinkedIn or other professional-profile export;
- a portfolio or selected work samples;
- qualification records or other career documents;
- an interview with no existing document.

The assistant identifies material gaps across:

1. name and contact details intended for application documents;
2. target roles, seniority, industries, markets, locations, languages, and work arrangements;
3. career history, skills, education, certifications, dates, outcomes, and supporting evidence;
4. compensation constraints and work authorization when relevant;
5. CV length, tone, excluded facts or sectors, cover-letter preference, photographs, references, and accessibility needs;
6. job sources, discovery cadence, relevance threshold, and roles to exclude;
7. which external providers, if any, may receive personal material.

Imported claims are recorded as unverified first. The assistant presents important claims back to the user in compact form and verifies only what the user confirms. “Not yet verified” does not mean “not possessed.”

Before preparing the first real final application, Jobsearch should have sufficient identity information, an evidence source or interview-built evidence base, enough verified facts for the target role, target-role and market preferences, a CV-template decision, and a known privacy boundary.

## Choosing or adapting the CV

Jobsearch includes an ATS-conscious **Evidence CV** template. During onboarding, the assistant shows or describes it and asks the user to choose one of three paths:

- keep the template as it is;
- adapt its visual or content rules;
- provide another CV format to reproduce or support.

The built-in template is a starting point, not an assumption inherited from another person. Durable choices—such as maximum page count, tone, omitted facts, or a different renderer—are stored in the user's preferences. The content structure is documented in [cv-content-contract.md](cv-content-contract.md).

Useful requests include:

- “Show me the built-in CV before I choose.”
- “Keep my CV to two pages unless that removes essential evidence.”
- “Use this CV as my preferred format.”
- “Never include this fact unless I approve it for the specific application.”
- “Make the tone more direct, but do not change any facts.”

## Everyday workflow

### 1. Capture and assess an opportunity

Give the assistant the job link or paste the full advertisement:

> Save this role, preserve the complete advertisement, research the company, and assess its fit with my verified profile: [link or text]

If a source such as LinkedIn cannot be retrieved reliably, the assistant asks the user to paste the description and records it as user-provided. It preserves the listing before analysis.

The resulting match percentage appears on the application list when a stored positioning score exists. Use it to compare roles, then open the application to inspect the evidence and tradeoffs behind it. A higher number does not mean the employer is more likely to hire the user.

### 2. Decide whether to proceed

Ask questions before spending time on an application:

- “What are the strongest and weakest parts of my fit?”
- “Which requirements are unsupported or still unverified?”
- “What should I clarify before applying?”
- “Compare this opportunity with the other roles I am considering.”

Move the application through **Considering**, **Preparing**, and **Ready** as the work progresses. **Researching** is available as an optional working stage when a role needs a separate research pass. The portal labels the initial `discovered` state as Considering.

### 3. Prepare documents

Say:

> Prepare a tailored CV and cover letter for this role, using only verified facts. Do not submit anything. Show me the final PDFs before I decide.

The assistant should preserve the positioning strategy, content decisions, evidence used, quality scorecard, methodology version, and every validated revision. A CV is not ready to submit until its rendered HTML and PDF have been visually checked.

### 4. Review in the portal

Ask the assistant to start Jobsearch, or run `npm run dev`, then open `http://127.0.0.1:5173`.

The application library shows:

- role and company;
- current stage;
- the stored comparative match percentage, when available;
- update date, artifact count, language, search, and filters.

The application detail shows the captured role, research, strategy, source history, current document, quality scorecard, timeline, contacts, interviews, feedback, previews, and downloads.

### 5. Record submission and progress

The normal forward sequence is:

**Considering → Preparing → Ready → Applied → Screening → Interview → Offer → Accepted**

Researching is an optional stage between Considering and Preparing.

**Rejected**, **Withdrawn**, **No response**, and **Archived** are available when relevant.

The user may change stages from the application detail in the portal. Terminal outcomes require confirmation. Applied is special: the user confirms that the application was actually sent and selects the rendered artifact that was submitted. Jobsearch then freezes that artifact's hashes and records the event, preserving exactly what went to the employer.

Example requests:

- “I sent the application using the latest CV. Mark it applied.”
- “Move this application to screening.”
- “Record that my first interview is next Tuesday at 10:00.”
- “The employer rejected me after screening; record their exact feedback separately.”
- “I have withdrawn because the location requirement changed.”

### 6. Learn from outcomes

Jobsearch separates:

- direct employer statements;
- observed outcomes, such as reaching an interview;
- an agent's possible explanation;
- a finding supported by repeated evidence.

This prevents a guess after one rejection from becoming a false rule. Over time, the user can compare sources, positioning, document versions, timing, and funnel outcomes without losing the underlying evidence.

## Changing the system for a new user

The user does not need to edit configuration files. Tell the assistant what has changed:

- “I now want product operations roles in Germany and Switzerland.”
- “Exclude design-system-only roles.”
- “English is my default, but use Polish when the advertisement is in Polish.”
- “Do not create cover letters unless they are required.”
- “Ask me before using any external service.”
- “Review my current preferences and interview me about anything important that is missing.”

The assistant stores only choices the user actually made. It should not reuse example data, another person's profile, or assumptions from a previous installation.

## What can be shared

Share the public repository link to let someone review the framework and its fictional screenshots. To let a specific person install or adapt it:

1. give them written permission appropriate to their use;
2. send them the repository link;
3. have them clone a fresh copy on their Mac;
4. ask them to open the copy in Codex or Claude Code and use the setup prompt above;
5. let the new installation create its own local database and evidence store.

Do not send the original user's PostgreSQL database, `.local` directory, backups, `.env`, source documents, or rendered applications. A fresh clone contains the framework only and does not affect another installation.

## Troubleshooting

### “Setup is incomplete” appears in the portal

Ask the agent: “Run the Jobsearch health check, repair the local setup, and explain before installing anything.” A technical helper can run `npm run jobsearch -- health` and `npm run setup`.

### The portal does not open

Keep the terminal or agent task running after `npm run dev`, and open `http://127.0.0.1:5173`. If the port is already occupied, ask the agent to identify the existing process without terminating unrelated software.

### Personal data appears in Git

Stop before committing or pushing. Do not merely delete the visible file and continue. Ask the agent to inspect Git history, the working tree, ignored files, and any remote exposure, then choose a safe remediation.

### A fact is wrong or uncertain

Tell the assistant exactly what is wrong. It should add a corrected revision or change verification state without rewriting historical source snapshots or submitted artifacts.

### The match score looks wrong

Ask for the stored rationale and which verified facts, requirements, and positioning assumptions produced it. Correct missing evidence or preferences first; do not tune the number to create false confidence.

### Switching between Codex and Claude Code

Stop the running development server and let the current agent finish its changes. Then open the same local folder with the other tool and ask it to run the health check before continuing. Both must obey the repository's operating contract.

## Current boundaries

The distributable edition is local and single-user. It does not yet provide cloud accounts, multi-user collaboration, mobile access, automatic employer submission, or a hosted signup portal. Making it a cloud service would require a new security and product design: authentication, tenant isolation, encryption, consent, data retention, abuse controls, backups, support, and operating costs.

For personal use and portfolio demonstration, the local edition is the safer and simpler product. The fictional screenshots in [the case study](case-study.md) show the experience without exposing a real user's data.
