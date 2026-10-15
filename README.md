# 🎓 Personalized Learning Platform (MERN Stack)

An AI-ready, interactive, and personalized adaptive learning platform built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with Tailwind CSS.

---

## 🌟 Key Features

### 👨‍🏫 Teacher Portal
- **Unique Teacher Code**: Auto-generated 8-character unique alphanumeric code (e.g., `TCH7A9X2`) for every teacher.
- **Student Monitoring**: Real-time tracking of connected students, enrolled courses, progress percentages, and test attempts.
- **Detailed Student Activity Modal**: Inspect test history, score breakdowns, weak topics, and anti-cheat event logs.
- **Student Management**: Connect, inspect, or remove students with instant state updates.

### 👨‍🎓 Student Portal
- **Course Discovery & Enrollment**: Browse course catalog, search courses by title/category, and enroll with 1-click.
- **Module & Topic Learning**: Rich reading materials with syntax-highlighted code snippets, architectural ASCII diagrams, practical notes, and mark-as-completed progress tracking.
- **Secure Anti-Cheat Assessment Window**:
  - Fullscreen assessment with tab-switch detection and alert banner.
  - Keyboard shortcut restrictions (F-keys, Ctrl+C/V/X, Alt+Tab prevention).
  - Countdown timer with auto-submit.
  - Question palette navigation (Answered vs Unanswered indicators).
- **Smart Code Editor for Programming Questions**:
  - Auto-indentation on `Enter` key after `{`.
  - 4-space tab insertion on `Tab` key.
  - Auto de-indent on `}` key.
  - **▶ Run Code (Test)** option to test code against test cases with pass/fail feedback before submitting.
  - **Real-time Auto-save**: Keystrokes are preserved; submitted even if the student doesn't explicitly run.
- **Post-Submission Summary**:
  - Per-question marks breakdown (marks earned vs max marks, MCQ choices, programming pass/fail).
  - Topic skill percentage breakdown with diagnostic feedback.
- **Intelligent Recommendation Engine**:
  - Diagnoses root causes of weak topics.
  - Generates direct, verified problem links to **LeetCode** and **HackerRank**.
- **Knowledge Gap Analysis & Reattempt Tests**:
  - Interactive weak knowledge percentage meter.
  - Launch 15-question targeted reattempt assessments (10 MCQs + 5 Programming problems).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, CORS
- **Database**: MongoDB with Mongoose ODM

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Clone the Repository
```bash
git clone https://github.com/Suriyaiteec2028/Personalized_learning_platform.git
cd Personalized_learning_platform
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed     # Seeds default courses, questions, and accounts
node server.js   # Starts backend on http://localhost:5005
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Starts frontend on http://localhost:5174
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 👨‍🏫 **Teacher** | `teacher@platform.com` | `teacher123` |
| 👨‍🎓 **Student** | `student@platform.com` | `student123` |

*(Use the **1-Click Demo** buttons on the login page for instant access!)*
