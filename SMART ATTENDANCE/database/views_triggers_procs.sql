-- ==============================================================================
-- SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
-- ADVANCED DBMS FEATURES: VIEWS, TRIGGERS, PROCEDURES & FUNCTIONS
-- Designed for University DBMS Mini Project Examination & Viva Evaluation
-- ==============================================================================

USE smart_attendance_db;

-- ==============================================================================
-- SECTION A: DATABASE VIEWS (Virtual Tables for Reporting & Analytics)
-- ==============================================================================

-- VIEW 1: Overall Student Attendance Percentage & Examination Eligibility
-- Calculates total classes, attended classes, percentage, and eligibility (< 75% = Shortage)
DROP VIEW IF EXISTS v_student_attendance_summary;
CREATE VIEW v_student_attendance_summary AS
SELECT 
    s.student_id,
    s.roll_number,
    s.register_number,
    s.full_name AS student_name,
    d.dept_code,
    s.semester,
    s.section,
    COUNT(ar.record_id) AS total_classes_scheduled,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS classes_present,
    SUM(CASE WHEN ar.status = 'Late' THEN 1 ELSE 0 END) AS classes_late,
    SUM(CASE WHEN ar.status = 'Excused' THEN 1 ELSE 0 END) AS classes_excused,
    SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) AS classes_absent,
    ROUND(
        (SUM(CASE WHEN ar.status IN ('Present', 'Late', 'Excused') THEN 1.0 ELSE 0.0 END) / 
        NULLIF(COUNT(ar.record_id), 0)) * 100, 2
    ) AS attendance_percentage,
    CASE 
        WHEN ROUND((SUM(CASE WHEN ar.status IN ('Present', 'Late', 'Excused') THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(ar.record_id), 0)) * 100, 2) >= 75.00 THEN 'ELIGIBLE'
        WHEN ROUND((SUM(CASE WHEN ar.status IN ('Present', 'Late', 'Excused') THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(ar.record_id), 0)) * 100, 2) >= 65.00 THEN 'CONDONATION'
        ELSE 'DEFAULTER (DETAINED)'
    END AS eligibility_status
FROM students s
JOIN departments d ON s.dept_id = d.dept_id
LEFT JOIN attendance_records ar ON s.student_id = ar.student_id
GROUP BY s.student_id, s.roll_number, s.register_number, s.full_name, d.dept_code, s.semester, s.section;

-- VIEW 2: Critical Defaulters View (< 75% attendance)
-- Quickly retrieves all students at risk of exam debarment
DROP VIEW IF EXISTS v_critical_defaulters;
CREATE VIEW v_critical_defaulters AS
SELECT 
    student_id,
    roll_number,
    student_name,
    dept_code,
    semester,
    section,
    total_classes_scheduled,
    classes_present,
    attendance_percentage,
    eligibility_status
FROM v_student_attendance_summary
WHERE attendance_percentage < 75.00 AND total_classes_scheduled > 0;

-- VIEW 3: Course / Subject Wise Attendance Analytics
-- Analyzes attendance health per subject across departments
DROP VIEW IF EXISTS v_course_attendance_analytics;
CREATE VIEW v_course_attendance_analytics AS
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    d.dept_code,
    c.semester,
    COUNT(DISTINCT ses.session_id) AS total_sessions_conducted,
    COUNT(ar.record_id) AS total_attendance_instances,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS total_present,
    SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) AS total_absent,
    ROUND(
        (SUM(CASE WHEN ar.status IN ('Present', 'Late', 'Excused') THEN 1.0 ELSE 0.0 END) / 
        NULLIF(COUNT(ar.record_id), 0)) * 100, 2
    ) AS average_course_attendance_pct
FROM courses c
JOIN departments d ON c.dept_id = d.dept_id
LEFT JOIN attendance_sessions ses ON c.course_id = ses.course_id
LEFT JOIN attendance_records ar ON ses.session_id = ar.session_id
GROUP BY c.course_id, c.course_code, c.course_name, d.dept_code, c.semester;

-- VIEW 4: Daily Session Log for Admin Overview
-- Displays classes taken with faculty name and present/absent headcounts
DROP VIEW IF EXISTS v_daily_session_overview;
CREATE VIEW v_daily_session_overview AS
SELECT 
    ses.session_id,
    ses.session_date,
    ses.start_time,
    ses.end_time,
    ses.classroom,
    ses.session_type,
    ses.topic_covered,
    c.course_code,
    c.course_name,
    f.full_name AS faculty_name,
    d.dept_code,
    COUNT(ar.record_id) AS total_students_marked,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
    ROUND(
        (SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / 
        NULLIF(COUNT(ar.record_id), 0)) * 100, 1
    ) AS session_presence_rate
FROM attendance_sessions ses
JOIN courses c ON ses.course_id = c.course_id
JOIN faculty f ON ses.faculty_id = f.faculty_id
JOIN departments d ON c.dept_id = d.dept_id
LEFT JOIN attendance_records ar ON ses.session_id = ar.session_id
GROUP BY ses.session_id, ses.session_date, ses.start_time, ses.end_time, ses.classroom, ses.session_type, ses.topic_covered, c.course_code, c.course_name, f.full_name, d.dept_code;


-- ==============================================================================
-- SECTION B: STORED PROCEDURES
-- ==============================================================================

DELIMITER $$

-- PROCEDURE 1: Mark Batch Attendance for an entire class session
-- Inserts present marks for enrolled students of a course with a single call
DROP PROCEDURE IF EXISTS sp_mark_batch_attendance$$
CREATE PROCEDURE sp_mark_batch_attendance(
    IN p_session_id INT,
    IN p_default_status VARCHAR(10),
    IN p_marked_by_user INT
)
BEGIN
    DECLARE v_course_id INT;
    
    -- Retrieve course for the session
    SELECT course_id INTO v_course_id FROM attendance_sessions WHERE session_id = p_session_id;
    
    -- Insert default attendance for all enrolled students if not already marked
    INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id)
    SELECT 
        p_session_id,
        e.student_id,
        p_default_status,
        'AdminManual',
        p_marked_by_user
    FROM enrollments e
    WHERE e.course_id = v_course_id
      AND e.student_id NOT IN (
          SELECT student_id FROM attendance_records WHERE session_id = p_session_id
      );
      
    SELECT ROW_COUNT() AS records_inserted;
END$$

-- PROCEDURE 2: Get Comprehensive Attendance Card for a Student
DROP PROCEDURE IF EXISTS sp_get_student_attendance_card$$
CREATE PROCEDURE sp_get_student_attendance_card(
    IN p_student_id INT
)
BEGIN
    -- Section 1: Basic Profile & Global Summary
    SELECT * FROM v_student_attendance_summary WHERE student_id = p_student_id;
    
    -- Section 2: Subject-wise breakdown for this student
    SELECT 
        c.course_code,
        c.course_name,
        COUNT(ar.record_id) AS total_classes,
        SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS attended_classes,
        ROUND((SUM(CASE WHEN ar.status = 'Present' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(ar.record_id), 0)) * 100, 2) AS course_percentage
    FROM courses c
    JOIN attendance_sessions s ON c.course_id = s.course_id
    JOIN attendance_records ar ON s.session_id = ar.session_id
    WHERE ar.student_id = p_student_id
    GROUP BY c.course_id, c.course_code, c.course_name;
END$$

-- ==============================================================================
-- SECTION C: STORED FUNCTIONS
-- ==============================================================================

-- FUNCTION 1: Calculate Attendance Percentage for a Student in a Given Course
DROP FUNCTION IF EXISTS fn_calculate_student_course_attendance$$
CREATE FUNCTION fn_calculate_student_course_attendance(
    p_student_id INT,
    p_course_id INT
) 
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_present INT DEFAULT 0;
    DECLARE v_pct DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT 
        COUNT(ar.record_id),
        SUM(CASE WHEN ar.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END)
    INTO v_total, v_present
    FROM attendance_records ar
    JOIN attendance_sessions s ON ar.session_id = s.session_id
    WHERE ar.student_id = p_student_id AND s.course_id = p_course_id;
    
    IF v_total > 0 THEN
        SET v_pct = ROUND((v_present / v_total) * 100, 2);
    ELSE
        SET v_pct = 100.00;
    END IF;
    
    RETURN v_pct;
END$$

-- ==============================================================================
-- SECTION D: DATABASE TRIGGERS (Automated Business Logic & Auditing)
-- ==============================================================================

-- TRIGGER 1: Audit Log after Attendance Status UPDATE
-- Captures who changed an attendance record, old status, and new status
DROP TRIGGER IF EXISTS trg_after_attendance_update$$
CREATE TRIGGER trg_after_attendance_update
AFTER UPDATE ON attendance_records
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO attendance_audit_logs (
            record_id,
            session_id,
            student_id,
            action_type,
            old_status,
            new_status,
            changed_by_user_id,
            changed_at,
            notes
        ) VALUES (
            OLD.record_id,
            OLD.session_id,
            OLD.student_id,
            'UPDATE',
            OLD.status,
            NEW.status,
            NEW.marked_by_user_id,
            NOW(),
            CONCAT('Status updated from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END$$

-- TRIGGER 2: Audit Log after Attendance DELETE
DROP TRIGGER IF EXISTS trg_after_attendance_delete$$
CREATE TRIGGER trg_after_attendance_delete
AFTER DELETE ON attendance_records
FOR EACH ROW
BEGIN
    INSERT INTO attendance_audit_logs (
        record_id,
        session_id,
        student_id,
        action_type,
        old_status,
        new_status,
        changed_by_user_id,
        changed_at,
        notes
    ) VALUES (
        OLD.record_id,
        OLD.session_id,
        OLD.student_id,
        'DELETE',
        OLD.status,
        NULL,
        OLD.marked_by_user_id,
        NOW(),
        CONCAT('Attendance record deleted for student ', OLD.student_id)
    );
END$$

DELIMITER ;
