# SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
## Database Management Systems (DBMS) Mini Project

A production-grade **Smart Attendance Management System** featuring normalized Relational Database Design (3NF), Advanced DBMS constructs (Views, Triggers, Stored Procedures, Audit Logs), and a modern **Frontend Admin Dashboard** with Smart QR Attendance, Grid Entry, Defaulter Tracking (< 75%), and an **Interactive SQL Query Console**.

---

## 🚀 Quick Start (Instant Run)

### Method 1: Direct Double-Click (Zero Setup Required)
Simply double-click:
```text
launch.bat
```
or open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave).

### Method 2: Local Python Server (Optional)
```bash
python server/server.py
```
Then visit: `http://localhost:8080/index.html`

---

## 🔑 Admin Login Credentials

| Role | Email / Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `admin@campus.edu` / `admin` | `admin123` | Institutional Dean / System Controller |
| **Department Admin** | `cse_admin@campus.edu` / `admin_cse` | `admin123` | Department Level Coordinator |
| **Faculty Incharge** | `ramesh.sharma@campus.edu` / `prof_sharma` | `faculty123` | Subject Teacher / Lecturer |

> *Tip: The login dialog includes quick 1-click login buttons for swift presentation before evaluators.*

---

## 📂 Project Architecture & File Organization

```
SMART ATTENDANC/
├── index.html                   # Main Smart Attendance Admin Portal
├── launch.bat                   # 1-Click Windows execution script
│
├── database/                    # DBMS Core SQL Scripts (MySQL 8.0 / MariaDB)
│   ├── schema.sql               # Complete DDL Schema (11 tables, 3NF normalized, constraints)
│   ├── views_triggers_procs.sql # Advanced DBMS constructs (Views, Triggers, Procedures, Functions)
│   ├── seed_data.sql            # Comprehensive academic sample records (Students, Sessions, Records)
│   └── sample_queries.sql       # Top 20 complex SQL queries for viva demonstration
│
├── assets/                      # Frontend Assets
│   ├── css/
│   │   └── style.css            # Custom glassmorphism styling, badges, animations
│   └── js/
│       ├── mock-data.js         # Relational seed data for browser simulation
│       ├── db-service.js        # Relational DBMS abstraction layer, DML, audit logs & SQL engine
│       └── app.js               # UI controller, Chart.js graphs, QR scanner & session timer
│
├── docs/                        # Academic Evaluation & Viva Pack
│   ├── ERD_DIAGRAM.md           # Mermaid ER Diagram, Relational Mapping & 3NF proof
│   └── VIVA_QUESTIONS.md        # Top 25 DBMS viva questions with detailed answers
│
└── server/                      # Optional Python Local HTTP Server
    └── server.py                # Standalone web server script
```

---

## 🌟 Key Features

### 1. Relational Database Engineering (DBMS Focus)
- **3NF Normalized Schema:** 11 distinct relational tables with strict foreign keys and cascading rules.
- **Automated Audit Triggers:** Triggers (`trg_after_attendance_update`) track old vs new status changes with editor timestamp.
- **Analytical Views:**
  - `v_student_attendance_summary`: Computes total lectures, attended count, and percentage.
  - `v_critical_defaulters`: Filters students $< 75\%$ for university exam debarment.
  - `v_course_attendance_analytics`: Class turnout per subject.
- **Stored Procedures:**
  - `sp_mark_batch_attendance`: Bulk marks attendance for an entire classroom.
  - `sp_get_student_attendance_card`: Generates a student's full attendance transcript.

### 2. Frontend Admin Management Portal
- **Dashboard Analytics:** Live Chart.js graphs showing daily lecture attendance trends and department comparisons.
- **Smart QR Attendance:** Dynamic auto-expiring QR session codes (60-second rotating timer) with instant check-in verification.
- **Manual Grid Entry Mode:** One-click "Mark All Present", "Mark All Absent", or individual toggle per student.
- **Faculty & Subject Management (CRUD):** 
  - Add & Delete Faculty members (Employee Code, Designation, Department, Email, Phone).
  - Add & Delete Academic Subjects / Courses (Course Code, Name, Department, Semester, Credits, Syllabus Hours, Min Attendance %).
- **Defaulters Warning System:** Identifies students below 75% attendance with 1-click **Export CSV Notice** and **Export PDF Notice**.
- **Official Reports & PDF Export Center:** Built-in PDF generator powered by `jsPDF` & `AutoTable`:
  - Institutional Semester Attendance Summary (PDF)
  - Critical Defaulters Debarment Notice (< 75%) (PDF)
  - Individual Student Attendance Transcript (PDF)
  - Lecture Session Roll-Call Sheet (PDF)
- **Interactive SQL Console:** Live SQL query execution tab inside the portal to demonstrate real queries to professors!
- **Data Persistence & Reset:** Persists changes across browser sessions; includes a factory reset button to restore default demo data.

---

## 🎓 Loading SQL Scripts into MySQL Workbench / CLI

If you wish to run the project against a live MySQL Server:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p smart_attendance_db < database/views_triggers_procs.sql
mysql -u root -p smart_attendance_db < database/seed_data.sql
```
To run the sample queries:
```bash
mysql -u root -p smart_attendance_db < database/sample_queries.sql
```

---

## 🏆 Viva-Voce Evaluation Preparation
Review [docs/VIVA_QUESTIONS.md](docs/VIVA_QUESTIONS.md) and [docs/ERD_DIAGRAM.md](docs/ERD_DIAGRAM.md) for clear explanations of Normalization, ACID properties, Keys, Triggers, Views, and ER relationships.
