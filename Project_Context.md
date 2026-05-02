# Project Context: Athletica One

## Overview
This project is the Practicum effort of David Lebovich for his work at Emet Classical Academy.

## Phase Log
- **Phase 1 Session 1.1**: Initial documentation setup. Created `GEMINI.md` and `Project_Context.md` skeleton.
- **Phase 1 Session 1.2**: Populated project vision, core requirements, and technical specifications from the Practicum Project Definition V2.
- **Phase 1 Session 1.3**: Updated README.md with Vercel deployment instructions and Firebase environment variables. Added .env.example.

## Project Vision
To create a responsive web application that serves as a central hub for scholastic athletes to manage their daily performance, nutrition, and scheduling. The app will transition from a personal tool to a multi-role platform for coaches, parents, and fans.

## Requirements Document
### Core Functional Requirements (Phase 1)
| Feature | Description |
| :--- | :--- |
| **Personal Records Tracker** | Manual and automated tracking of track and field times. |
| **MileSplit Integration** | Automated scraping of official meet results and split times from athlete profiles. |
| **Nutrition & Supplement Log** | Daily tracking of dietary intake, macros, and supplement schedules. |
| **Training & Schedule Planner** | Centralized calendar for training sessions, meetings, and competitions. |
| **Athlete To-Do List** | Task tracker for daily athletic requirements and recovery. |

## Design Document
### Responsive Web App (Mobile-First Design)
The application is designed to be highly responsive, catering primarily to athletes on the go.

### Data Architecture
The structure is designed to be multi-tenant ready by utilizing unique User IDs (UIDs) for all data collections.
- **Users**: Collection for user profiles.
- **Training_Logs**: Collection linked by UID.
- **Performance_Records**: Collection linked by UID.
- **Nutrition_Data**: Collection linked by UID.

## Functional Requirements Specification
- **Automated Data Scraping**: Utilize a Python-based engine (BeautifulSoup/Selenium) to ingest data from MileSplit.
- **Multi-tenant Readiness**: Ensure all data is strictly partitioned by UID from the start.

## Technical Specification
### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Hosting**: Vercel
- **Database/Auth**: Firebase (Firestore & Authentication)
- **Data Engine**: Python (BeautifulSoup/Selenium) for external data scraping.
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Font**: Inter (Google Fonts)

### Project Structure
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
├── .env.example
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

## Testing Requirements Specification
- **Every Service Must Have Tests**
- Unit tests for all service methods
- Integration tests for complex workflows (e.g., commission calculation with hierarchy splits)
- **Test coverage target**: 80%+ for services, 60%+ overall
- **Use real data patterns**: Test with realistic financial data (amounts, dates, hierarchies)

## Future Roadmap
- **Multi-User Support**: Individual accounts for various athletes.
- **Role-Based Access**: Dashboards for Coaches, Parents, and Fans.
- **Cross-Sport Expansion**: Support for diverse sports data sets and third-party site scraping.
