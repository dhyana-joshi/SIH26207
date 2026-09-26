# SIH26207 — VidyaSarthi

> **A Unified 3-Portal Educational Ecosystem connecting Students, Institutes, and Academicians** — bridging formal institute curricula, personal skill roadmaps, targeted weak-subject practice, multilingual visual learning, and academic research collaboration.

🌐 **Live Deployment:** [https://vidyasarthi.onrender.com/](https://vidyasarthi.onrender.com/)

---

## 🎯 Problem Statement (SIH26207)

Students struggle to balance their rigid **Institute Curriculum & Exams** with **Personal Skill Development & Academic Research**, often falling behind in weak subjects without timely faculty intervention or accessible regional-language explanations.

---

## 💡 Solution — The 3-Portal Ecosystem

**VidyaSarthi** links **Students**, **Institutes**, and **Academicians** in real time:

1. **🎓 Student Portal**
   - **Dual-Track AI Schedule Generator:** Balances mandatory institute lectures/exams with personal skill roadmaps and custom personal time slots (e.g., walks, rest, self-study), tracking completion logs across both tracks.
   - **Syllabus Tracker & Exam Fit Score:** Visualizes syllabus coverage meters and dynamically calculates readiness for upcoming institute exams.
   - **Targeted Weak-Subject Practice:** Automatically identifies lowest-scoring subjects from institute marks and student-reported knowledge gaps, generating daily adaptive practice quizzes.
   - **Interactive Multilingual & Visual Learning:** Live interactive visualizers (Calculus & Tangent Explorer, 2D Matrix Transformations, BST & LRU Cache Sandboxes) and technical glossaries across **7 Indian languages** (*English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali*).
   - **Research & Opportunities:** Explore published research papers, message academicians directly, and apply to research internships and academic opportunities.

2. **🏛️ Institute Portal**
   - **Schedules & Exam Management:** Publish daily lecture timetables, exam schedules, and exam syllabus topics directly to linked students.
   - **Marks Upload & Weak-Subject Detection:** Upload student exam marks to automatically flag weak subjects and trigger daily remedial practice.
   - **Student Monitoring & Faculty Mentoring:** Track daily student study logs, syllabus completion, and send personalized mentoring guidance.

3. **🔬 Academician Portal**
   - **Research Publishing:** Publish research papers, abstracts, and domain tags for students across institutes.
   - **Direct Student Collaboration:** Respond to student research inquiries, mentor aspiring researchers, and post research/internship opportunities.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python, Flask, RESTful Blueprints, Gunicorn |
| **Database** | SQLite3 (Relational Schema with Automated Migrations & Seed Data) |
| **AI & Localization** | Google Gemini API + Deterministic Fallback Engine, 7-Language i18n Context |
| **Authentication** | Session Auth + Live SMTP Email OTP Verification |

---

## 🚀 Quick Start (Local Setup)

### 1. Build Frontend & Install Backend Dependencies
```bash
npm --prefix Frontend install && npm --prefix Frontend run build && pip install -r Backend/requirements.txt
```

### 2. Run the Unified Server
```bash
python Backend/app.py
```
The app will be live at `http://localhost:5001`.

---

## 🔑 Quick Demo Credentials

| Portal | Email | Password |
| :--- | :--- | :--- |
| **Student** | `kareena@college.edu` | `Password123!` |
| **Institute** | `tnp@msu.edu` | `Password123!` |
| **Academician** | `xyz@msu.edu` | `Password123!` |