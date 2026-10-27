# DBMS Project Viva-Voce Questions & Model Answers
## Smart Attendance Management System (SAMS)

---

### Q1: What is the objective of this project from a DBMS perspective?
**Answer:** The objective is to design, normalize, and implement a robust Relational Database Management System (RDBMS) for automated attendance tracking in educational institutions. It ensures ACID compliance, eliminates data redundancy through 3NF normalization, enforces referential integrity via Foreign Keys and CASCADE constraints, and utilizes Views, Stored Procedures, and Triggers for business logic and audit trails.

---

### Q2: What normal form is your database schema in, and why?
**Answer:** The schema is normalized up to **Third Normal Form (3NF)**:
1. **1NF:** All attributes contain atomic values, and each record has a unique primary key.
2. **2NF:** No partial dependencies exist on composite keys (e.g., in `enrollments` and `attendance_records`).
3. **3NF:** No transitive functional dependencies exist ($X \to Y \to Z$). For example, rather than storing `department_name` and `hod_name` directly in `students`, we store `dept_id` as a foreign key pointing to the `departments` table.

---

### Q3: What is the purpose of Database Triggers in this system?
**Answer:** We implemented triggers such as `trg_after_attendance_update` and `trg_after_attendance_delete`. When an administrator or faculty member alters or deletes an attendance record, the trigger automatically logs the previous status, new status, modifier user ID, and timestamp into `attendance_audit_logs`. This prevents unauthorized alterations and guarantees complete auditability.

---

### Q4: Why did you use Database Views instead of repeating queries?
**Answer:** We created virtual tables like:
- `v_student_attendance_summary`: Aggregates total classes held, present counts, and overall attendance percentage.
- `v_critical_defaulters`: Filters students with attendance $< 75\%$.
**Benefits:**
1. **Security:** Restricts direct access to base transactional tables while exposing only computed aggregates.
2. **Performance & Simplicity:** Simplifies complex multi-table joins and calculations (`SUM(CASE ...)` and `ROUND`) into a single reusable entity.

---

### Q5: How do you prevent duplicate attendance entries for the same student in the same lecture?
**Answer:** We enforce a `UNIQUE` composite constraint on the pair `(session_id, student_id)` in the `attendance_records` table:
```sql
CONSTRAINT uq_session_student UNIQUE (session_id, student_id);
```
Any attempt to insert a duplicate record for that student in that lecture will be rejected by the DBMS engine with a constraint violation.

---

### Q6: What integrity constraints did you enforce?
**Answer:**
1. **Primary Key Constraints (`PRIMARY KEY`):** Ensures entity integrity (`student_id`, `session_id`, `record_id`).
2. **Foreign Key Constraints (`FOREIGN KEY ... REFERENCES`):** Ensures referential integrity (`ON DELETE CASCADE` or `RESTRICT`).
3. **Unique Constraints (`UNIQUE`):** Enforces uniqueness on `roll_number`, `email`, `qr_session_code`, and `(session_id, student_id)`.
4. **Check Constraints (`CHECK`):** `CHECK (semester BETWEEN 1 AND 8)` and `CHECK (credits > 0)`.
5. **Not Null Constraints (`NOT NULL`):** Mandatory columns like `session_date` and `full_name`.

---

### Q7: Explain the query used to calculate attendance percentage.
**Answer:**
```sql
SELECT 
    s.roll_number,
    s.full_name,
    COUNT(ar.record_id) AS total_classes,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS attended,
    ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / COUNT(ar.record_id)) * 100, 2) AS percentage
FROM students s
JOIN attendance_records ar ON s.student_id = ar.student_id
GROUP BY s.student_id, s.roll_number, s.full_name;
```
It groups records by student, uses conditional aggregation `SUM(CASE WHEN ...)` to count presents, and divides by `COUNT(record_id)`.

---

### Q8: What are the ACID properties in this project?
**Answer:**
- **Atomicity:** When batch recording attendance for 60 students, either all 60 are inserted or the transaction rolls back.
- **Consistency:** Foreign key rules guarantee no attendance record points to a non-existent student.
- **Isolation:** Concurrent scans from different students do not produce dirty reads or phantom records.
- **Durability:** Once committed, attendance records persist reliably on disk.
