# StudyAgent — Adaptive AI Study & Exam Agent 🎓🤖

> **Agentic AI Project Proposal & 4-Week Development System**  
> *Category: Option B — Agentic AI Application (LLM + Planner + Supabase pgvector + Adaptive Loop)*

StudyAgent is an autonomous, agentic learning assistant that transforms raw syllabus notes and PDFs into a day-by-day adaptive study plan, grounded RAG tutoring, automated quiz assessments, weak-topic detection, and real-time schedule re-planning.

---

## 🌟 Key Features

1. **Autonomous Study Planner Agent**: Computes daily study schedules based on exam dates, daily available hours, and topic difficulty.
2. **Document Ingestion & RAG**: Uploads course notes/PDFs, chunks content, and indexes embeddings into **Supabase (`pgvector`)**.
3. **AI Tutor (RAG-Grounded)**: Answers student questions with direct citations to uploaded course materials.
4. **Automated Quiz Generator & Evaluator**: Generates topic-specific MCQs, grades answers, and detects weak conceptual areas.
5. **Dynamic Adaptive Re-planning**: Autonomously restructures future study days to allocate remedial revision when quiz scores fall below threshold.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend**: Node.js / Express (or FastAPI)
- **Database & RAG**: Supabase (PostgreSQL, `pgvector`, Supabase Storage, Auth)
- **AI / LLM**: Gemini 1.5 Flash / OpenAI `gpt-4o-mini` with structured JSON output and tool calling

---

## 🚀 Getting Started (Full-Stack Setup)

### Prerequisites
- Node.js 18+ and npm installed
- A free [Supabase](https://supabase.com) project

### 1. Database Setup (Supabase)
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard).
2. Copy and run [`supabase/migrations/all_in_one_migration.sql`](supabase/migrations/all_in_one_migration.sql) to create all 20 tables, `pgvector`, HNSW indexes, RLS, and storage.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to seed the Theory of Computation demo syllabus, tasks, and quiz metrics.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Running the Backend API
```bash
cd server
npm install
npm run test:db   # Verify 5/5 database & pgvector tests pass
npm start         # Starts Express API on http://localhost:5000
```

### 4. Running the Frontend
In a new terminal:
```bash
npm install
npm run dev       # Starts React Vite dev server on http://localhost:5173
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Building for Production
```bash
npm run build
```

---

## 👥 4-5 Member Laboratory Team Division

| Member | Role | Deliverables |
| :--- | :--- | :--- |
| **Member 1** | **Frontend Lead** | Dashboard UI, Interactive Cards, Study Plan & Quiz Views, Tailwind theme |
| **Member 2** | **Backend & Supabase Lead** | Node/Express API, Supabase tables, Storage buckets, Auth & REST endpoints |
| **Member 3** | **Agentic AI Lead** | Planner Agent logic, function calling / tool orchestration, adaptive schedule mutator |
| **Member 4** | **RAG & Document Pipeline Lead** | PDF text extraction (`pdf-parse`), semantic chunking, vector embedding generation |
| **Member 5** | **Testing & Documentation Lead** | Evaluation metrics, Viva preparation, 10-mark lab report & presentation slides |

---

## 📁 Project Directory Structure

```
AI-PROJECT/
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── index.css                     # Tailwind CSS v4 + design tokens
│   ├── main.jsx                      # App root
│   ├── App.jsx                       # Master view coordinator & global state
│   ├── data/
│   │   └── mockData.js               # Seed dataset (TOC syllabus, tasks, quiz metrics)
│   └── components/
│       ├── Header.jsx                # Global header with AI ask bar & notifications
│       ├── Sidebar.jsx               # Navigation bar & motivational card
│       ├── MascotRobot.jsx           # 3D robot illustration component
│       ├── Dashboard/                # 6 Core Cards matching proposal mockup
│       │   ├── HeroBanner.jsx
│       │   ├── ExamCard.jsx
│       │   ├── TasksCard.jsx
│       │   ├── ProgressCard.jsx
│       │   ├── SubjectsCard.jsx
│       │   ├── QuizResultCard.jsx
│       │   ├── QuickActions.jsx
│       │   └── MotivationalFooter.jsx
│       ├── Modals/
│       │   ├── UploadModal.jsx       # 4-stage ingestion pipeline tracker
│       │   ├── QuizAnalysisModal.jsx # Weak area breakdown & adaptation review
│       │   └── QuickQuizModal.jsx    # Interactive quiz test taker
│       └── Views/
│           ├── UploadMaterialsView.jsx
│           ├── StudyPlanView.jsx
│           ├── AITutorView.jsx
│           ├── QuizView.jsx
│           ├── ProgressView.jsx
│           └── SettingsView.jsx
```

---

## 📝 Viva Quick Defense Points

1. **What makes this system agentic?**  
   It goes beyond a single prompt/response chatbot. It observes intermediate user outcomes (e.g., scoring 45% on Unit 2), makes an autonomous decision, invokes the re-planning tool, and alters future study recommendations without manual user re-configuration.
2. **Why Supabase with pgvector over MongoDB + Redis?**  
   Unified relational integrity for student progress and relational models alongside high-performance native vector similarity search in a single managed cloud database.
