# AI-assisted recruiting and Codex evidence

## Contents

1. Freshness contract
2. What current recruiter AI evaluates
3. Build an AI-readable, human-credible candidate packet
4. Defeat sameness with verification
5. Codex evidence ladder
6. Codex proof package
7. Role-specific Codex evidence
8. Wording patterns
9. Interview for missing evidence
10. Candidate rights and market notes
11. Current source register

## Freshness contract

This reference was researched on 2026-08-12. AI recruiting products, employer policies, and Codex capabilities change quickly.

Before calling the method `current`, `recent`, or `optimized for recruiter AI`:

1. Re-check the official LinkedIn Recruiter and Greenhouse pages below if more than 90 days have passed, or if the vacancy names a different platform.
2. Re-check the vacancy, employer careers site, application form, and privacy notice for disclosed AI use, automated-decision rights, assessment rules, and candidate AI-use restrictions.
3. Re-check official OpenAI Codex documentation if more than 90 days have passed before naming a capability or recommending a proof artifact.
4. Record the source URL, publication/update date when available, retrieval date, claim supported, and market limitation.
5. Treat product behavior not documented by the vendor as uncertain. Do not infer a hidden scoring formula from rejection outcomes.

## What current recruiter AI evaluates

### Joined candidate evidence

Current recruiter tools may use more than the uploaded CV. LinkedIn documents applicant evaluation against recruiter-defined qualifications using information from the candidate's LinkedIn profile, resume, and screening answers. LinkedIn Recruiter can also extract likely titles and skills from resumes and display whether a role confirms or differs from profile data.

Greenhouse Talent Matching documents weighted calibration criteria covering skills, relevant experience, job titles, and optionally industry. Its matching uses related skill terms, so keyword synonym volume is not a defensible optimization strategy.

Build for a joined packet:

| Signal | Make explicit | Consistency check |
|---|---|---|
| Identity and level | recognizable role family, supported seniority | headline, recent roles, profile |
| Relevant experience | exact role, employer, dates, scope | CV, LinkedIn, application fields |
| Skills | current canonical term plus use in context | skills section, bullets, proof |
| Eligibility | location, language, authorization when requested | CV and screening answers |
| Outcomes | verified output or result with attribution | CV and case study |
| Recency | dates for recent projects, credentials, and tool use | CV, profile, repository |
| Proof | live, permissioned artifact connected to a requirement | CV link and destination |

### Semantic clarity

Write for semantic evaluation and human verification:

- state the qualification directly before describing adjacent evidence;
- use the vacancy's ordinary term when it accurately names the candidate's experience;
- preserve the official title and add a functional descriptor when the title is obscure;
- connect each material skill to a role, project, credential, or shipped artifact;
- distinguish current hands-on use from older exposure;
- expose scale, constraints, collaborators, and output when verified;
- use readable section names and extraction-safe document structure.

Do not:

- repeat a skill or its synonyms to simulate stronger evidence;
- paste the job description into bullets;
- add invisible text, white text, prompt injection, or manipulated metadata;
- list a tool merely because it is related to the occupation;
- alter dates, titles, or scope to align channels artificially;
- claim knowledge of a proprietary recruiter ranking or threshold.

## Build an AI-readable, human-credible candidate packet

### Requirement evidence record

For every must or strong qualification, record:

- `canonicalRequirement`;
- `vacancyLanguage`;
- `verifiedEvidenceIds`;
- `evidenceSentence`;
- `channelLocations`;
- `evidenceDate` or recency;
- `proofUrlOrArtifact` when available;
- `coverage`: strong, partial, absent, or unknown;
- `contradictions`;
- `humanDefense`: the short explanation the candidate could give in an interview.

Use this record to improve clarity, not to manufacture complete coverage.

### Cross-surface consistency

Exact phrasing need not be identical, but facts must agree. Investigate:

- mismatched job titles or dates;
- a skill appearing in the CV but nowhere in experience or proof;
- a portfolio claiming ownership that the CV describes as team contribution;
- contradictory location, availability, authorization, language, or seniority;
- a recent AI credential with no demonstrated use;
- a screening answer that overstates partial evidence.

Resolve the source fact. Do not simply harmonize wording around an unverified assumption.

## Defeat sameness with verification

AI can improve editing, but high-volume AI-tailored applications make generic polish a weak signal. Build trust with details that are both relevant and defensible:

- specific systems, products, audiences, constraints, artifacts, and decisions;
- exact contribution boundaries and collaborator disciplines;
- outcomes that are observable even when not numeric;
- public repositories, releases, demonstrations, articles, talks, or sanitized case studies;
- tests, review notes, decision records, or other evidence of quality control;
- honest limitations and reflection;
- recent dates and maintained artifacts.

Avoid the common synthetic voice: generic summary formula, inflated adjectives, perfectly symmetrical bullets, repetitive `action + metric` constructions, and claims that merely restate the vacancy. Do not make prose artificially awkward to appear human. Make it specific.

Do not use an AI detector to certify authorship. The candidate is accountable for every final claim regardless of drafting method.

## Codex evidence ladder

Classify each claimed Codex capability at the highest fully verified level:

0. `Exposure`: opened or tried Codex; insufficient for a material CV claim.
1. `Directed use`: used Codex for a bounded task and can explain the prompt, result, and review.
2. `Reproducible workflow`: supplied structured context and completion criteria; used repository guidance, tests, or a repeatable process.
3. `Operationalized`: encoded durable instructions in `AGENTS.md`, created or used a skill, connected an appropriate MCP tool, or established a repeatable review/automation workflow.
4. `Shipped and validated`: delivered a real artifact or change with inspectable diffs, tests, review, deployment, adoption, or another verified outcome.
5. `Governed and improved`: defined permissions, human approval, evaluation, monitoring, retrospective, or measured workflow improvements and iterated from evidence.

Do not claim `expert`, `advanced`, `production`, `automation`, `agent orchestration`, or a named capability merely because the interface was used. Select wording from the demonstrated level.

### What knowledgeable Codex use looks like

Current official Codex guidance supports these inspectable practices:

- prompts or task briefs state goal, context, constraints, and done conditions;
- complex work begins with planning or a focused interview;
- repository conventions, commands, and verification live in `AGENTS.md` at the appropriate scope;
- repeatable task workflows are packaged as skills;
- external live context is connected through appropriate MCP tools rather than copied blindly;
- changes are tested, linted, type-checked, reviewed, and compared against the request;
- worktrees or bounded parallel agents are used when concurrent work warrants isolation;
- permissions and approvals remain appropriate to the risk;
- stable workflows may become scheduled tasks only after they work reliably.

Show the practices actually used; do not turn this list into a fake skills inventory.

## Codex proof package

For a material `Codex` claim, prefer one compact, inspectable case study containing:

1. `Problem`: the concrete user or engineering outcome.
2. `Baseline`: the prior process or constraint, only if verified.
3. `Codex surface`: app, CLI, IDE, cloud, code review, or SDK actually used.
4. `Context design`: relevant files, task brief, examples, constraints, and done conditions.
5. `Durable setup`: applicable `AGENTS.md`, skill, MCP, config, hook, or automation.
6. `Human decisions`: architecture, tradeoffs, rejected output, corrections, and final responsibility.
7. `Verification`: tests, type checks, lint, rendered inspection, security review, manual QA, or user acceptance.
8. `Artifact`: repository, pull request, commit, diff, demo, generated document, skill, or sanitized screenshots.
9. `Outcome`: shipped output, decision, adoption, quality change, time change, or reusable capability—without invented causality.
10. `Limitations`: what Codex did not decide, what remained manual, and any confidentiality boundary.

Do not publish secrets, private prompts, employer source code, customer data, internal instructions, tokens, or unapproved transcripts. A curated task brief and decision record are stronger than a raw chat dump.

### Strong public artifacts

- a focused repository with a clear README, `AGENTS.md`, tests, and a meaningful commit history;
- a reusable `.agents/skills/<skill-name>/SKILL.md` with validation evidence;
- a pull request showing task framing, reviewed diff, test results, and human corrections;
- a small live product or automation with source, limitations, and maintenance notes;
- a case study comparing the initial problem, agent workflow, rejected approaches, final decision, and verified result;
- a code-review or security-review example that shows judgment rather than blindly accepted findings.

## Role-specific Codex evidence

- `Software engineering`: implementation, debugging, migrations, tests, review, documentation, CI, performance, or security work with inspectable code and checks.
- `Product and operations`: specifications, prototypes, data or workflow scripts, reusable skills, integrations, and decision support with clear human ownership.
- `Data and research`: reproducible collection or analysis code, source provenance, validation, limitations, and protected-data handling.
- `Design`: coded prototypes, design-system implementation, accessibility checks, interaction testing, or design-to-code work with visual and technical QA.
- `Marketing and communications`: permissioned automation, analysis, content operations, or web experiments with editorial accountability and outcome evidence.
- `Leadership`: safe adoption pattern, team guidance, review gates, evaluation method, training, or workflow redesign—supported by artifacts and observed use.

If Codex is not relevant to the vacancy, keep it in a compact skills or selected-project line. Do not let tool enthusiasm displace stronger occupational evidence.

## Wording patterns

Use these only as structures. Every placeholder and implication requires verified support.

Weak:

> AI expert; proficient in ChatGPT and Codex.

Stronger at level 2:

> Used OpenAI Codex to deliver [artifact], supplying repository context and completion criteria and validating the result with [checks].

Stronger at level 3:

> Built a repeatable Codex workflow for [task] using scoped `AGENTS.md` guidance and a reusable skill; retained human approval for [decision] and verified outputs with [checks].

Stronger at level 4:

> Delivered [verified outcome/artifact] through a Codex-assisted workflow spanning [planning/implementation/review], with [tests or review gate] and documented contribution boundaries.

Outcome without a numeric metric:

> Created and adopted a repository-scoped Codex workflow that converts [input] into [output], with validation for [failure modes] and a documented manual fallback.

Never add a percentage, time saving, quality improvement, adoption claim, or production label unless the evidence supports it.

## Interview for missing evidence

Ask one to three questions per round, prioritizing the highest-value missing proof:

1. What real outcome did you use Codex to deliver, and when?
2. Which Codex surface did you use, and what did the agent actually do?
3. What context, constraints, and done conditions did you give it?
4. Did you create or use `AGENTS.md`, a skill, MCP integration, review rule, worktree, subagent, hook, SDK workflow, or scheduled task? Which part is inspectable?
5. What important decision remained yours, and what output did you reject or correct?
6. How did you validate the result—tests, review, deployment, users, metrics, or manual inspection?
7. Which repository, pull request, demo, document, screenshot, or case study may be shared publicly?
8. What is confidential, proprietary, or unsafe to expose?
9. Can the claimed outcome and date be confirmed from a source?

Record answers as unverified facts until confirmed through Jobsearch. Do not promote tool usage to a final CV claim during the interview itself.

## Candidate rights and market notes

These notes identify current transparency and privacy context, not legal advice or a tactic for manipulating screening.

### Poland and the European Union

- Poland's UODO reported on 2026-07-16 that it is receiving increasing signals about AI tools in recruitment and called for additional safeguards against discrimination.
- The EU AI Act lists certain AI systems used for recruitment and selection in the high-risk area of employment. The exact obligations and implementation timeline concern providers and deployers; do not tell a candidate that every ATS is legally a high-risk system.
- Minimize sensitive data and follow the current Polish consent rules in `market-conventions.md`.

### Norway

- Apply the vacancy's disclosed process, GDPR/EEA privacy expectations, and the candidate's platform rights. Do not assume every EU AI Act obligation applies identically in Norway without a current official Norwegian source.
- No Norway-specific CV keyword tactic is justified by current evidence; use semantic clarity, truthful tailoring, and ordinary privacy defaults.

### Switzerland

- The Federal Data Protection and Information Commissioner states that AI recruitment must still follow necessity, recognisability, proportionality, and data-protection requirements, especially for video, behavior, and voice analysis.
- A traditional Swiss dossier does not justify supplying additional sensitive data to an AI system without need and consent.

### United Kingdom

- The ICO's 2026 candidate guidance says automated recruitment may score, rank, or filter applications and describes rights concerning fairness, information, challenge, and human involvement where applicable.
- Read the employer's privacy notice and use any offered alternative or challenge route according to the candidate's preference. Do not assume opting out improves ranking.

### United States

- Platform and jurisdictional rules vary. Follow the employer's notice, assessment instructions, and any local automated-employment-decision disclosures.
- Do not add protected personal data to help an AI system infer fit. Use job-related qualifications and the US privacy defaults in `market-conventions.md`.

## Current source register

Checked 2026-08-12:

- LinkedIn Engineering, 2026-06-11: semantic retrieval and multi-strategy ranking in Hiring Assistant. https://www.linkedin.com/blog/engineering/ai/semantic-search-for-ai-agents-at-scale-retrieval-and-ranking-for-linkedins-hiring-assistant
- LinkedIn Recruiter Help, updated 2026-07: applicant evaluation against project qualifications and source visibility. https://www.linkedin.com/help/recruiter/answer/a7109476
- LinkedIn Recruiter Help: resume extraction of skills, roles, title differences, and company differences. https://www.linkedin.com/help/recruiter/answer/a770588
- Greenhouse Support, updated 2026-03-18: weighted calibration, related skills, assistive AI, manual decision, and optional opt-out. https://support.greenhouse.io/hc/en-us/articles/41131886674075-Talent-Matching-FAQ
- UK ICO, published 2026-03-31: candidate-facing explanation of automated recruitment decisions and rights. https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/03/here-s-what-jobseekers-need-to-know-about-automated-recruitment-decisions/
- Poland UODO, published 2026-07-16: AI use, discrimination risk, and proposed employment safeguards. https://uodo.gov.pl/pl/138/4493
- Swiss FDPIC: data processing by employers and AI recruitment. https://www.edoeb.admin.ch/en/data-processing-by-the-employer
- European Union, Regulation (EU) 2024/1689, Annex III employment context. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Stephany, Teutloff, and Leone, 2026: recruiter experiment on AI-skill signals in the UK and US. https://arxiv.org/abs/2601.13286
- GMAC, published 2026-07: employer priorities for AI-enabled automation, research, and decision support. https://www.gmac.com/-/media/files/gmac/research/employment-outlook/2026-corporate-recruiters-survey/report.pdf
- Robert Half survey, fielded 2025-11 and reported 2026-04: verification burden from AI-tailored applications. https://www.eminfo.com/pdf/205.pdf
- OpenAI, Codex best practices: context, prompting, `AGENTS.md`, skills, MCP, validation, review, and stable automation. https://learn.chatgpt.com/guides/best-practices
- OpenAI, build skills for Codex and ChatGPT. https://learn.chatgpt.com/docs/build-skills
- OpenAI, `AGENTS.md` guidance. https://learn.chatgpt.com/docs/agent-configuration/agents-md
- OpenAI, Codex GitHub code review. https://learn.chatgpt.com/docs/third-party/github
