-- ==============================================================================
-- SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
-- TOP 20 MUST-KNOW SQL QUERIES FOR DBMS PROJECT VIVA & DEMONSTRATION
-- ==============================================================================

USE smart_attendance_db;

-- ------------------------------------------------------------------------------
-- 1. BASIC SELECTION & PROJECTION
-- Retrieve all active students belonging to the Computer Science Department
-- ------------------------------------------------------------------------------
SELECT s.roll_number, s.full_name, s.email, d.dept_name, s.semester, s.section
FROM students s
JOIN departments d ON s.dept_id = d.dept_id
WHERE d.dept_code = 'CSE' AND s.is_active = TRUE
ORDER BY s.roll_number ASC;

-- ------------------------------------------------------------------------------
-- 2. MULTI-TABLE INNER JOIN
-- List all scheduled sessions with Subject Name, Faculty Name, and Date
-- ------------------------------------------------------------------------------
SELECT 
    ses.session_id,
    ses.session_date,
    ses.start_time,
    c.course_code,
    c.course_name,
    f.full_name AS instructor_name,
    ses.classroom,
    ses.topic_covered
FROM attendance_sessions ses
INNER JOIN courses c ON ses.course_id = c.course_id
INNER JOIN faculty f ON ses.faculty_id = f.faculty_id
ORDER BY ses.session_date DESC, ses.start_time ASC;

-- ------------------------------------------------------------------------------
-- 3. AGGREGATE FUNCTION WITH GROUP BY & COUNT
-- Count total enrolled students per department
-- ------------------------------------------------------------------------------
SELECT 
    d.dept_code,
    d.dept_name,
    COUNT(s.student_id) AS total_students_enrolled
FROM departments d
LEFT JOIN students s ON d.dept_id = s.dept_id
GROUP BY d.dept_id, d.dept_code, d.dept_name;

-- ------------------------------------------------------------------------------
-- 4. AGGREGATION WITH HAVING CLAUSE (CRITICAL FOR EXAMS)
-- Find courses that have conducted more than 3 sessions
-- ------------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    COUNT(s.session_id) AS total_sessions_held
FROM courses c
JOIN attendance_sessions s ON c.course_id = s.course_id
GROUP BY c.course_id, c.course_code, c.course_name
HAVING COUNT(s.session_id) >= 3;

-- ------------------------------------------------------------------------------
-- 5. ATTENDANCE PERCENTAGE CALCULATION (PER STUDENT)
-- Mathematical aggregation using SUM(CASE...) and NULLIF()
-- ------------------------------------------------------------------------------
SELECT 
    s.roll_number,
    s.full_name,
    COUNT(ar.record_id) AS total_classes,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS classes_attended,
    ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / COUNT(ar.record_id)) * 100, 2) AS attendance_percentage
FROM students s
JOIN attendance_records ar ON s.student_id = ar.student_id
GROUP BY s.student_id, s.roll_number, s.full_name
ORDER BY attendance_percentage DESC;

-- ------------------------------------------------------------------------------
-- 6. IDENTIFYING CRITICAL DEFAULTERS (< 75% ATTENDANCE)
-- Essential for university exam eligibility debarment notices
-- ------------------------------------------------------------------------------
SELECT 
    s.roll_number,
    s.full_name,
    s.email,
    s.phone,
    COUNT(ar.record_id) AS total_classes,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS attended,
    ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / COUNT(ar.record_id)) * 100, 2) AS percentage
FROM students s
JOIN attendance_records ar ON s.student_id = ar.student_id
GROUP BY s.student_id, s.roll_number, s.full_name, s.email, s.phone
HAVING percentage < 75.00;

-- ------------------------------------------------------------------------------
-- 7. SUBQUERY IN WHERE CLAUSE (IN OPERATOR)
-- Find students who were absent in the latest session (Session ID = 5)
-- ------------------------------------------------------------------------------
SELECT roll_number, full_name, email
FROM students
WHERE student_id IN (
    SELECT student_id 
    FROM attendance_records 
    WHERE session_id = 5 AND status = 'Absent'
);

-- ------------------------------------------------------------------------------
-- 8. CORRELATED SUBQUERY (EXISTS OPERATOR)
-- Find students who have applied for medical or duty leaves
-- ------------------------------------------------------------------------------
SELECT s.roll_number, s.full_name
FROM students s
WHERE EXISTS (
    SELECT 1 
    FROM leave_applications l 
    WHERE l.student_id = s.student_id AND l.status = 'Approved'
);

-- ------------------------------------------------------------------------------
-- 9. SUBJECT-WISE ATTENDANCE BREAKDOWN FOR A SPECIFIC STUDENT
-- Demonstrates multi-table joins across 4 normalized tables
-- ------------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    COUNT(ar.record_id) AS total_lectures,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS attended,
    ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / COUNT(ar.record_id)) * 100, 2) AS percentage
FROM courses c
JOIN attendance_sessions ses ON c.course_id = ses.course_id
JOIN attendance_records ar ON ses.session_id = ar.session_id
WHERE ar.student_id = 1 -- Change student_id as required
GROUP BY c.course_id, c.course_code, c.course_name;

-- ------------------------------------------------------------------------------
-- 10. DAILY ATTENDANCE SUMMARY FOR PRINCIPAL / DEAN DASHBOARD
-- Calculates institution-wide daily turnout percentage
-- ------------------------------------------------------------------------------
SELECT 
    ses.session_date,
    COUNT(DISTINCT ses.session_id) AS classes_conducted,
    COUNT(ar.record_id) AS total_rollcalls,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
    ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / COUNT(ar.record_id)) * 100, 2) AS campus_turnout_pct
FROM attendance_sessions ses
JOIN attendance_records ar ON ses.session_id = ar.session_id
GROUP BY ses.session_date
ORDER BY ses.session_date DESC;
