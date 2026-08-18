# Built-in Evidence CV content

The built-in renderer accepts the artifact `content` object below. Omit optional sections rather than inserting placeholders. Every employer-visible claim must be supported by verified Jobsearch evidence.

```json
{
  "title": "Professional role or headline",
  "subtitle": "Optional short positioning line",
  "location": "Optional verified location or work arrangement",
  "contact": {
    "email": "candidate@example.com",
    "phone": "+00 000 000 000",
    "linkedin": "https://linkedin.com/in/example",
    "website": "https://example.com"
  },
  "profile": {
    "heading": "Profile",
    "headline": "Optional evidence-led headline",
    "paragraphs": ["One concise paragraph by default."]
  },
  "focus": {
    "heading": "Focus",
    "items": [
      { "title": "Capability", "description": "Short verified evidence or scope." }
    ]
  },
  "skills": {
    "categoryName": ["Verified skill", "Verified method"]
  },
  "experience": [
    {
      "role": "Official role title",
      "company": "Organization",
      "period": "Month year – Month year",
      "location": "Optional location",
      "summary": "Optional scope statement",
      "bullets": ["Verified contribution and supported result."]
    }
  ],
  "education": [
    { "degree": "Qualification", "institution": "Institution", "period": "Year" }
  ],
  "certifications": [
    { "title": "Certification", "issuer": "Issuer", "year": "Year" }
  ],
  "languages": [
    { "language": "Language", "level": "Verified level" }
  ],
  "recommendation": {
    "label": "Reference",
    "quote": "Optional verified quotation used with permission.",
    "name": "Person",
    "role": "Role",
    "relationship": "Relationship"
  }
}
```

The renderer uses ordinary semantic text, conventional headings, selectable PDF text, conservative page-breaking, and a restrained visual hierarchy. A reference, photograph, focus section, and every other optional element depend on the candidate's preferences and target-market context.
