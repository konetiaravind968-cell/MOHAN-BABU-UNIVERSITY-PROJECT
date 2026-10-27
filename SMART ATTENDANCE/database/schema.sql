-- ==============================================================================
-- SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
-- DATABASE MANAGEMENT SYSTEMS (DBMS) MINI PROJECT
-- Database Engine: MySQL 8.0+ / MariaDB / Compatible Relational DBMS
-- Normalization: Fully normalized up to 3NF (Third Normal Form)
-- ==============================================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS smart_attendance_db;
CREATE DATABASE smart_attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_attendance_db;

-- ==============================================================================
-- 1. DEPARTMENT TABLE
-- Stores academic departments within the institution
-- ==============================================================================
CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_code VARCHAR(10) NOT NULL UNIQUE,
    dept_name VARCHAR(100) NOT NULL,
    hod_name VARCHAR(100),
    established_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================================================================
-- 2. USERS / ADMINS TABLE
-- Stores credentials for administrative and faculty logins
-- ==============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Stored as SHA256 or bcrypt hash
    full_name VARCHAR(100) NOT NULL,
    role ENUM('SuperAdmin', 'Admin', 'Faculty', 'Student') NOT NULL DEFAULT 'Admin',
    contact_no VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================================================================
-- 3. FACULTY TABLE
-- Stores faculty/lecturer profiles linked to the department and user login
-- ==============================================================================
CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    dept_id INT NOT NULL,
    designation VARCHAR(50) DEFAULT 'Assistant Professor',
    joining_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_faculty_dept FOREIGN KEY (dept_id) 
        REFERENCES departments(dept_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 4. COURSES / SUBJECTS TABLE
-- Stores subjects offered across departments and semesters
-- ==============================================================================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(15) NOT NULL UNIQUE,
    course_name VARCHAR(100) NOT NULL,
    dept_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INT NOT NULL DEFAULT 3 CHECK (credits > 0),
    total_hours INT NOT NULL DEFAULT 45,
    min_attendance_percentage DECIMAL(5,2) DEFAULT 75.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_dept FOREIGN KEY (dept_id) 
        REFERENCES departments(dept_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 5. STUDENTS TABLE
-- Stores student demographic and enrollment details
-- ==============================================================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    register_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    dept_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    section VARCHAR(5) NOT NULL DEFAULT 'A',
    admission_year INT NOT NULL,
    rfid_card_uid VARCHAR(50) UNIQUE DEFAULT NULL,
    qr_auth_token VARCHAR(64) UNIQUE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_student_dept FOREIGN KEY (dept_id) 
        REFERENCES departments(dept_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 6. COURSE ENROLLMENTS TABLE
-- Many-to-Many mapping between Students and Courses
-- ==============================================================================
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL DEFAULT '2025-2026',
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    CONSTRAINT uq_student_course UNIQUE (student_id, course_id, academic_year),
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 7. COURSE ASSIGNMENTS (FACULTY TO COURSE)
-- Maps which faculty teaches which course for a specific section and year
-- ==============================================================================
CREATE TABLE course_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    faculty_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL DEFAULT '2025-2026',
    semester INT NOT NULL,
    section VARCHAR(5) NOT NULL DEFAULT 'A',
    CONSTRAINT uq_course_assignment UNIQUE (course_id, faculty_id, academic_year, section),
    CONSTRAINT fk_assign_course FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assign_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculty(faculty_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 8. ATTENDANCE SESSIONS TABLE
-- Represents a single lecture, lab, or tutorial class scheduled and taken
-- ==============================================================================
CREATE TABLE attendance_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    faculty_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic_covered VARCHAR(255),
    session_type ENUM('Lecture', 'Lab', 'Tutorial', 'Seminar') DEFAULT 'Lecture',
    classroom VARCHAR(20) DEFAULT 'Room 101',
    qr_session_code VARCHAR(64) UNIQUE DEFAULT NULL,
    qr_expires_at TIMESTAMP NULL DEFAULT NULL,
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_course FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_session_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 9. ATTENDANCE RECORDS TABLE
-- Transactional table storing individual attendance marks for each student per session
-- ==============================================================================
CREATE TABLE attendance_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL DEFAULT 'Present',
    verification_method ENUM('AdminManual', 'QRCodeScan', 'Biometric', 'RFID', 'GeoLocation') DEFAULT 'AdminManual',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_by_user_id INT,
    remarks VARCHAR(150) DEFAULT NULL,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id),
    CONSTRAINT fk_rec_session FOREIGN KEY (session_id) 
        REFERENCES attendance_sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rec_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rec_user FOREIGN KEY (marked_by_user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 10. STUDENT LEAVE REQUESTS TABLE
-- For tracking formal medical and duty leave applications
-- ==============================================================================
CREATE TABLE leave_applications (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    leave_type ENUM('Medical', 'Duty Leave', 'Personal', 'Sports') NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    reviewed_by_user_id INT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_leave_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_leave_reviewer FOREIGN KEY (reviewed_by_user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- 11. AUDIT LOGS TABLE
-- Tracks security events, admin updates, and attendance alterations (DBMS Audit Trail)
-- ==============================================================================
CREATE TABLE attendance_audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_status VARCHAR(20) DEFAULT NULL,
    new_status VARCHAR(20) DEFAULT NULL,
    changed_by_user_id INT DEFAULT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_ip VARCHAR(45) DEFAULT '127.0.0.1',
    notes VARCHAR(255)
) ENGINE=InnoDB;

-- ==============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================
CREATE INDEX idx_student_dept ON students(dept_id);
CREATE INDEX idx_student_roll ON students(roll_number);
CREATE INDEX idx_course_dept_sem ON courses(dept_id, semester);
CREATE INDEX idx_session_date ON attendance_sessions(session_date);
CREATE INDEX idx_session_course ON attendance_sessions(course_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_audit_record ON attendance_audit_logs(record_id);
