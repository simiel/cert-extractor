# Certificate & Course Extractor

A small Next.js app that takes any public certificate, course, or learning-program URL and uses an AI agent to:

- Fetch and read the visible text on the page (and related pages)
- Detect whether it describes a certificate / course / program
- Extract rich details for resumes, LinkedIn, and CVs

The backend uses the [Vercel AI SDK](https://sdk.vercel.ai/) with a `renderPage` tool so the model can inspect real page content instead of guessing.

---

## Features

- 🔗 Paste **any** public learning-related URL (not limited to Coursera)
- 🧠 AI agent:
  - Calls a `renderPage` tool to fetch page text
  - Optionally follows related links (e.g. course / certificate detail pages)
  - Extracts:
    - Credential metadata (title, issuer, issue date, duration, level, etc.)
    - Detailed description of the program
    - Skills, competencies, and outcomes
    - Per-module/course breakdown (when available)
- 🧾 Clean textual summary rendered in the UI
- 🌐 Simple REST API (`POST /api/extract`) you can reuse elsewhere

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, `app/` directory)
- React (Client Components)
- TypeScript
- [Vercel AI SDK](https://sdk.vercel.ai/) (`generateText`, tools)
- Tailwind CSS utility classes (for styling)

---

## How It Works

### Frontend (`app/page.tsx`)

- Renders a simple form:
  - Input: URL
  - Button: “Extract Learning Details”
- Calls `POST /api/extract` with JSON:

```json
{ "url": "https://example.com/some-certificate" }
```
