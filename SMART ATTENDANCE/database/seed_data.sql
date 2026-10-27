-- ==============================================================================
-- SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
-- COMPREHENSIVE SEED DATA SCRIPT
-- Contains Departments, Admins, Faculty, Courses, Students, Sessions, and Attendance Records
-- ==============================================================================

USE smart_attendance_db;

-- ------------------------------------------------------------------------------
-- 1. SEED DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO departments (dept_id, dept_code, dept_name, hod_name, established_year) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Dr. Ramesh Sharma', 2002),
(2, 'ECE', 'Electronics and Communication Engineering', 'Dr. Anita Roy', 2004),
(3, 'IT', 'Information Technology', 'Dr. Suresh Nair', 2008),
(4, 'ME', 'Mechanical Engineering', 'Dr. Vikramaditya Joshi', 2000);

-- ------------------------------------------------------------------------------
-- 2. SEED USERS (ADMINS & TEACHERS)
-- Passwords in plain for demo reference: 'admin123', 'faculty123'
-- Hash representations stored below
-- ------------------------------------------------------------------------------
INSERT INTO users (user_id, username, email, password_hash, full_name, role, contact_no) VALUES
(1, 'admin', 'admin@campus.edu', 'admin123', 'Prof. Arvind Kumar (Dean)', 'SuperAdmin', '+91 9876543210'),
(2, 'admin_cse', 'cse_admin@campus.edu', 'admin123', 'Ms. Neha Kapoor (CSE Admin)', 'Admin', '+91 9876543211'),
(3, 'prof_sharma', 'ramesh.sharma@campus.edu', 'faculty123', 'Dr. Ramesh Sharma', 'Faculty', '+91 9876543212'),
(4, 'prof_anita', 'anita.roy@campus.edu', 'faculty123', 'Dr. Anita Roy', 'Faculty', '+91 9876543213'),
(5, 'prof_vikas', 'vikas.verma@campus.edu', 'faculty123', 'Prof. Vikas Verma', 'Faculty', '+91 9876543214');

-- ------------------------------------------------------------------------------
-- 3. SEED FACULTY PROFILES
-- ------------------------------------------------------------------------------
INSERT INTO faculty (faculty_id, user_id, employee_code, full_name, email, phone, dept_id, designation, joining_date) VALUES
(1, 3, 'FAC-CSE-001', 'Dr. Ramesh Sharma', 'ramesh.sharma@campus.edu', '+91 9876543212', 1, 'Professor & HOD', '2012-06-15'),
(2, 4, 'FAC-ECE-002', 'Dr. Anita Roy', 'anita.roy@campus.edu', '+91 9876543213', 2, 'Associate Professor', '2015-08-01'),
(3, 5, 'FAC-CSE-003', 'Prof. Vikas Verma', 'vikas.verma@campus.edu', '+91 9876543214', 1, 'Assistant Professor', '2018-01-10');

-- ------------------------------------------------------------------------------
-- 4. SEED COURSES / SUBJECTS
-- ------------------------------------------------------------------------------
INSERT INTO courses (course_id, course_code, course_name, dept_id, semester, credits, total_hours) VALUES
(1, 'CS501', 'Database Management Systems', 1, 5, 4, 45),
(2, 'CS502', 'Design and Analysis of Algorithms', 1, 5, 4, 45),
(3, 'CS503', 'Operating Systems & System Programming', 1, 5, 3, 40),
(4, 'CS504', 'Object-Oriented Software Engineering', 1, 5, 3, 35),
(5, 'EC501', 'Digital Signal Processing', 2, 5, 4, 45),
(6, 'IT501', 'Web Technologies & Cloud Computing', 3, 5, 4, 45);

-- ------------------------------------------------------------------------------
-- 5. SEED STUDENTS (Diverse sample with high, moderate, and low attendance)
-- ------------------------------------------------------------------------------
INSERT INTO students (student_id, roll_number, register_number, full_name, email, phone, dept_id, semester, section, admission_year, rfid_card_uid, qr_auth_token) VALUES
(1, 'CS2201', 'REG2022001', 'Aarav Patel', 'aarav.patel@student.edu', '+91 9123456701', 1, 5, 'A', 2022, 'RFID-98321-A', 'QR-TOK-CS2201'),
(2, 'CS2202', 'REG2022002', 'Diya Sen', 'diya.sen@student.edu', '+91 9123456702', 1, 5, 'A', 2022, 'RFID-98322-B', 'QR-TOK-CS2202'),
(3, 'CS2203', 'REG2022003', 'Rohan Gupta', 'rohan.gupta@student.edu', '+91 9123456703', 1, 5, 'A', 2022, 'RFID-98323-C', 'QR-TOK-CS2203'),
(4, 'CS2204', 'REG2022004', 'Ananya Iyer', 'ananya.iyer@student.edu', '+91 9123456704', 1, 5, 'A', 2022, 'RFID-98324-D', 'QR-TOK-CS2204'),
(5, 'CS2205', 'REG2022005', 'Kabir Khan', 'kabir.khan@student.edu', '+91 9123456705', 1, 5, 'A', 2022, 'RFID-98325-E', 'QR-TOK-CS2205'),
(6, 'CS2206', 'REG2022006', 'Ishita Mehra', 'ishita.mehra@student.edu', '+91 9123456706', 1, 5, 'A', 2022, 'RFID-98326-F', 'QR-TOK-CS2206'),
(7, 'CS2207', 'REG2022007', 'Aditya Singh', 'aditya.singh@student.edu', '+91 9123456707', 1, 5, 'A', 2022, 'RFID-98327-G', 'QR-TOK-CS2207'),
(8, 'CS2208', 'REG2022008', 'Pooja Reddy', 'pooja.reddy@student.edu', '+91 9123456708', 1, 5, 'A', 2022, 'RFID-98328-H', 'QR-TOK-CS2208'),
(9, 'CS2209', 'REG2022009', 'Manish Deshmukh', 'manish.d@student.edu', '+91 9123456709', 1, 5, 'A', 2022, 'RFID-98329-I', 'QR-TOK-CS2209'),
(10, 'CS2210', 'REG2022010', 'Sneha Pillai', 'sneha.pillai@student.edu', '+91 9123456710', 1, 5, 'A', 2022, 'RFID-98330-J', 'QR-TOK-CS2210'),
(11, 'EC2201', 'REG2022101', 'Varun Nair', 'varun.nair@student.edu', '+91 9123456711', 2, 5, 'A', 2022, 'RFID-98331-K', 'QR-TOK-EC2201'),
(12, 'EC2202', 'REG2022102', 'Kavya Menon', 'kavya.menon@student.edu', '+91 9123456712', 2, 5, 'A', 2022, 'RFID-98332-L', 'QR-TOK-EC2202');

-- ------------------------------------------------------------------------------
-- 6. ENROLL STUDENTS IN COURSES
-- ------------------------------------------------------------------------------
INSERT INTO enrollments (student_id, course_id, academic_year) VALUES
(1, 1, '2025-2026'), (1, 2, '2025-2026'), (1, 3, '2025-2026'),
(2, 1, '2025-2026'), (2, 2, '2025-2026'), (2, 3, '2025-2026'),
(3, 1, '2025-2026'), (3, 2, '2025-2026'), (3, 3, '2025-2026'),
(4, 1, '2025-2026'), (4, 2, '2025-2026'), (4, 3, '2025-2026'),
(5, 1, '2025-2026'), (5, 2, '2025-2026'), (5, 3, '2025-2026'),
(6, 1, '2025-2026'), (6, 2, '2025-2026'), (6, 3, '2025-2026'),
(7, 1, '2025-2026'), (7, 2, '2025-2026'), (7, 3, '2025-2026'),
(8, 1, '2025-2026'), (8, 2, '2025-2026'), (8, 3, '2025-2026'),
(9, 1, '2025-2026'), (9, 2, '2025-2026'), (9, 3, '2025-2026'),
(10, 1, '2025-2026'), (10, 2, '2025-2026'), (10, 3, '2025-2026'),
(11, 5, '2025-2026'), (12, 5, '2025-2026');

-- ------------------------------------------------------------------------------
-- 7. SEED ATTENDANCE SESSIONS
-- ------------------------------------------------------------------------------
INSERT INTO attendance_sessions (session_id, course_id, faculty_id, session_date, start_time, end_time, topic_covered, session_type, classroom, qr_session_code) VALUES
(1, 1, 1, '2026-10-15', '09:00:00', '10:00:00', 'Relational Algebra & Tuple Calculus', 'Lecture', 'LH-201', 'QR-SESS-20261015-01'),
(2, 1, 1, '2026-10-16', '09:00:00', '10:00:00', 'SQL DDL, DML and Integrity Constraints', 'Lecture', 'LH-201', 'QR-SESS-20261016-01'),
(3, 1, 1, '2026-10-18', '09:00:00', '10:00:00', 'Database Normalization: 1NF, 2NF, 3NF, BCNF', 'Lecture', 'LH-201', 'QR-SESS-20261018-01'),
(4, 1, 1, '2026-10-20', '11:00:00', '13:00:00', 'DBMS Lab: Complex Joins & Subqueries', 'Lab', 'Lab-3B', 'QR-SESS-20261020-01'),
(5, 1, 1, '2026-10-22', '09:00:00', '10:00:00', 'Transactions, ACID Properties and Serializability', 'Lecture', 'LH-201', 'QR-SESS-20261022-01'),
(6, 2, 3, '2026-10-15', '10:15:00', '11:15:00', 'Asymptotic Notations: Big O, Omega, Theta', 'Lecture', 'LH-202', 'QR-SESS-20261015-02'),
(7, 2, 3, '2026-10-17', '10:15:00', '11:15:00', 'Divide and Conquer: Merge Sort and Quick Sort', 'Lecture', 'LH-202', 'QR-SESS-20261017-02'),
(8, 2, 3, '2026-10-19', '10:15:00', '11:15:00', 'Greedy Method: Huffman Coding & MST', 'Lecture', 'LH-202', 'QR-SESS-20261019-02'),
(9, 3, 1, '2026-10-21', '14:00:00', '15:00:00', 'CPU Scheduling Algorithms & Deadlocks', 'Lecture', 'LH-201', 'QR-SESS-20261021-01');

-- ------------------------------------------------------------------------------
-- 8. SEED ATTENDANCE RECORDS
-- Realistic distribution:
-- Students 1-4: High attendance (90-100%)
-- Students 5-7: Moderate attendance (75-85%)
-- Students 8-10: Low attendance / Defaulters (< 75%)
-- ------------------------------------------------------------------------------

-- Session 1 (CS501)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(1, 1, 'Present', 'QRCodeScan', 1),
(1, 2, 'Present', 'QRCodeScan', 1),
(1, 3, 'Present', 'AdminManual', 1),
(1, 4, 'Present', 'QRCodeScan', 1),
(1, 5, 'Present', 'AdminManual', 1),
(1, 6, 'Present', 'QRCodeScan', 1),
(1, 7, 'Present', 'AdminManual', 1),
(1, 8, 'Absent',  'AdminManual', 1),
(1, 9, 'Absent',  'AdminManual', 1),
(1, 10,'Absent',  'AdminManual', 1);

-- Session 2 (CS501)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(2, 1, 'Present', 'QRCodeScan', 1),
(2, 2, 'Present', 'QRCodeScan', 1),
(2, 3, 'Present', 'AdminManual', 1),
(2, 4, 'Present', 'QRCodeScan', 1),
(2, 5, 'Present', 'QRCodeScan', 1),
(2, 6, 'Late',    'AdminManual', 1),
(2, 7, 'Present', 'QRCodeScan', 1),
(2, 8, 'Absent',  'AdminManual', 1),
(2, 9, 'Absent',  'AdminManual', 1),
(2, 10,'Present', 'QRCodeScan', 1);

-- Session 3 (CS501)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(3, 1, 'Present', 'QRCodeScan', 1),
(3, 2, 'Present', 'QRCodeScan', 1),
(3, 3, 'Present', 'AdminManual', 1),
(3, 4, 'Present', 'QRCodeScan', 1),
(3, 5, 'Present', 'AdminManual', 1),
(3, 6, 'Present', 'QRCodeScan', 1),
(3, 7, 'Absent',  'AdminManual', 1),
(3, 8, 'Absent',  'AdminManual', 1),
(3, 9, 'Absent',  'AdminManual', 1),
(3, 10,'Absent',  'AdminManual', 1);

-- Session 4 (CS501 Lab)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(4, 1, 'Present', 'Biometric', 1),
(4, 2, 'Present', 'Biometric', 1),
(4, 3, 'Present', 'Biometric', 1),
(4, 4, 'Present', 'Biometric', 1),
(4, 5, 'Late',    'AdminManual', 1),
(4, 6, 'Present', 'Biometric', 1),
(4, 7, 'Present', 'Biometric', 1),
(4, 8, 'Absent',  'AdminManual', 1),
(4, 9, 'Present', 'Biometric', 1),
(4, 10,'Absent',  'AdminManual', 1);

-- Session 5 (CS501)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(5, 1, 'Present', 'QRCodeScan', 1),
(5, 2, 'Present', 'QRCodeScan', 1),
(5, 3, 'Present', 'QRCodeScan', 1),
(5, 4, 'Present', 'QRCodeScan', 1),
(5, 5, 'Present', 'AdminManual', 1),
(5, 6, 'Present', 'QRCodeScan', 1),
(5, 7, 'Present', 'QRCodeScan', 1),
(5, 8, 'Absent',  'AdminManual', 1),
(5, 9, 'Absent',  'AdminManual', 1),
(5, 10,'Absent',  'AdminManual', 1);

-- Session 6 (CS502)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(6, 1, 'Present', 'AdminManual', 3),
(6, 2, 'Present', 'AdminManual', 3),
(6, 3, 'Present', 'AdminManual', 3),
(6, 4, 'Present', 'AdminManual', 3),
(6, 5, 'Present', 'AdminManual', 3),
(6, 6, 'Absent',  'AdminManual', 3),
(6, 7, 'Present', 'AdminManual', 3),
(6, 8, 'Absent',  'AdminManual', 3),
(6, 9, 'Present', 'AdminManual', 3),
(6, 10,'Absent',  'AdminManual', 3);

-- Session 7 (CS502)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(7, 1, 'Present', 'AdminManual', 3),
(7, 2, 'Present', 'AdminManual', 3),
(7, 3, 'Present', 'AdminManual', 3),
(7, 4, 'Present', 'AdminManual', 3),
(7, 5, 'Present', 'AdminManual', 3),
(7, 6, 'Present', 'AdminManual', 3),
(7, 7, 'Present', 'AdminManual', 3),
(7, 8, 'Absent',  'AdminManual', 3),
(7, 9, 'Absent',  'AdminManual', 3),
(7, 10,'Absent',  'AdminManual', 3);

-- Session 8 (CS502)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(8, 1, 'Present', 'AdminManual', 3),
(8, 2, 'Present', 'AdminManual', 3),
(8, 3, 'Present', 'AdminManual', 3),
(8, 4, 'Present', 'AdminManual', 3),
(8, 5, 'Absent',  'AdminManual', 3),
(8, 6, 'Present', 'AdminManual', 3),
(8, 7, 'Present', 'AdminManual', 3),
(8, 8, 'Absent',  'AdminManual', 3),
(8, 9, 'Absent',  'AdminManual', 3),
(8, 10,'Absent',  'AdminManual', 3);

-- Session 9 (CS503)
INSERT INTO attendance_records (session_id, student_id, status, verification_method, marked_by_user_id) VALUES
(9, 1, 'Present', 'AdminManual', 1),
(9, 2, 'Present', 'AdminManual', 1),
(9, 3, 'Present', 'AdminManual', 1),
(9, 4, 'Present', 'AdminManual', 1),
(9, 5, 'Present', 'AdminManual', 1),
(9, 6, 'Present', 'AdminManual', 1),
(9, 7, 'Present', 'AdminManual', 1),
(9, 8, 'Absent',  'AdminManual', 1),
(9, 9, 'Absent',  'AdminManual', 1),
(9, 10,'Absent',  'AdminManual', 1);

-- ------------------------------------------------------------------------------
-- 9. SEED SAMPLE LEAVE APPLICATION
-- ------------------------------------------------------------------------------
INSERT INTO leave_applications (leave_id, student_id, from_date, to_date, leave_type, reason, status, reviewed_by_user_id) VALUES
(1, 8, '2026-10-15', '2026-10-22', 'Medical', 'Recovering from viral fever, medical certificate attached.', 'Approved', 1),
(2, 9, '2026-10-18', '2026-10-20', 'Sports', 'Represented University in Inter-College Chess Tournament.', 'Approved', 1);
