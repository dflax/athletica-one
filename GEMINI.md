# GEMINI.md

## Autonomous Mode
As you work, you may have questions about how to proceed. You should assume in all cases that I’m going to accept the suggestion you have. Only actually stop and prompt me if there is a major security or other issue for which you MUST have my input. Otherwise, you are to work completely autonomously.

## Post-Build Actions
After completing any unit of work (feature, fix, refactor, or doc update), always do these steps in a single commit — do not make a separate commit for `Project_Context.md`:

1.  **Run local build and tests**: Run `npm run build` (and `npm test` when available) locally to ensure there are no TypeScript, linting, or prerendering errors.
2.  **Update `Project_Context.md` first** — add a phase log entry and reflect any relevant changes (new pages, changed structure, updated directories, new dependencies, etc.)
3.  **Stage all files**: `git add .`
4.  **Commit everything together** (code + docs) with the message convention below
5.  **Push to origin master**: `git push origin master`

### Commit Message Convention
`Phase N Session N.M: Short description of what was done`

Example:
`Phase 7 Session 7.2: Auto-lookup ZIP code on address form with spinner and zip+4 support`

**Do not commit if:**
*   Tests are failing
*   TypeScript has errors
*   Database migration failed

Instead, fix the issue and then commit.

## Testing Requirements
*   **Every Service Must Have Tests**
*   Unit tests for all service methods
*   Integration tests for complex workflows (e.g., commission calculation with hierarchy splits)
*   **Test coverage target**: 80%+ for services, 60%+ overall
*   **Use real data patterns**: Test with realistic financial data (amounts, dates, hierarchies)

## Tech Stack
*   **Framework**: Next.js 14 (App Router)
*   **Hosting**: Vercel (auto-deploys from GitHub)
*   **Database/Auth**: Firebase (Firestore & Authentication)
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript
*   **Font**: Inter (Google Fonts)

## Firestore Security Rules
To ensure users can only access their own data, apply these rules in the Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Performance Records: Explicit permissions per operation
    match /Performance_Records/{recordId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Legacy support for nested user documents
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Project Structure
```text
athletica-one/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── firebase.js
│   └── useAuth.js
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## Updates to Documentation
*   **GEMINI.md**: Each time we do a commit, verify if this file needs to be updated.
*   **Project_Context.md**: Each time we do a commit, verify if this file needs to be updated.
