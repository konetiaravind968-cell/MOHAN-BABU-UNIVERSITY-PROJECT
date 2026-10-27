// ==============================================================================
// SMART ATTENDANCE MANAGEMENT SYSTEM - SEED MOCK DATA
// Preloaded relational datasets for browser-based DBMS simulation & presentation
// ==============================================================================

const INITIAL_DATABASE = {
  departments: [
    { dept_id: 1, dept_code: 'CSE', dept_name: 'Computer Science and Engineering', hod_name: 'Dr. Ramesh Sharma', established_year: 2002 },
    { dept_id: 2, dept_code: 'ECE', dept_name: 'Electronics and Communication Engineering', hod_name: 'Dr. Anita Roy', established_year: 2004 },
    { dept_id: 3, dept_code: 'IT', dept_name: 'Information Technology', hod_name: 'Dr. Suresh Nair', established_year: 2008 },
    { dept_id: 4, dept_code: 'ME', dept_name: 'Mechanical Engineering', hod_name: 'Dr. Vikramaditya Joshi', established_year: 2000 }
  ],

  users: [
    { user_id: 1, username: 'admin', email: 'admin@campus.edu', role: 'SuperAdmin', full_name: 'Prof. Arvind Kumar (Dean)', contact_no: '+91 9876543210' },
    { user_id: 2, username: 'admin_cse', email: 'cse_admin@campus.edu', role: 'Admin', full_name: 'Ms. Neha Kapoor (CSE Admin)', contact_no: '+91 9876543211' },
    { user_id: 3, username: 'prof_sharma', email: 'ramesh.sharma@campus.edu', role: 'Faculty', full_name: 'Dr. Ramesh Sharma', contact_no: '+91 9876543212' },
    { user_id: 4, username: 'prof_anita', email: 'anita.roy@campus.edu', role: 'Faculty', full_name: 'Dr. Anita Roy', contact_no: '+91 9876543213' }
  ],

  faculty: [
    { faculty_id: 1, user_id: 3, employee_code: 'FAC-CSE-001', full_name: 'Dr. Ramesh Sharma', email: 'ramesh.sharma@campus.edu', phone: '+91 9876543212', dept_id: 1, designation: 'Professor & HOD' },
    { faculty_id: 2, user_id: 4, employee_code: 'FAC-ECE-002', full_name: 'Dr. Anita Roy', email: 'anita.roy@campus.edu', phone: '+91 9876543213', dept_id: 2, designation: 'Associate Professor' },
    { faculty_id: 3, user_id: null, employee_code: 'FAC-CSE-003', full_name: 'Prof. Vikas Verma', email: 'vikas.verma@campus.edu', phone: '+91 9876543214', dept_id: 1, designation: 'Assistant Professor' }
  ],

  courses: [
    { course_id: 1, course_code: 'CS501', course_name: 'Database Management Systems', dept_id: 1, semester: 5, credits: 4, total_hours: 45, min_attendance: 75.0 },
    { course_id: 2, course_code: 'CS502', course_name: 'Design & Analysis of Algorithms', dept_id: 1, semester: 5, credits: 4, total_hours: 45, min_attendance: 75.0 },
    { course_id: 3, course_code: 'CS503', course_name: 'Operating Systems & System Programming', dept_id: 1, semester: 5, credits: 3, total_hours: 40, min_attendance: 75.0 },
    { course_id: 4, course_code: 'CS504', course_name: 'Software Engineering & Agile Methodologies', dept_id: 1, semester: 5, credits: 3, total_hours: 35, min_attendance: 75.0 },
    { course_id: 5, course_code: 'EC501', course_name: 'Digital Signal Processing', dept_id: 2, semester: 5, credits: 4, total_hours: 45, min_attendance: 75.0 }
  ],

  students: [
    { student_id: 1, roll_number: 'CS2201', register_number: 'REG2022001', full_name: 'Aarav Patel', email: 'aarav.patel@student.edu', phone: '+91 9123456701', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98321-A', qr_code: 'QR-CS2201' },
    { student_id: 2, roll_number: 'CS2202', register_number: 'REG2022002', full_name: 'Diya Sen', email: 'diya.sen@student.edu', phone: '+91 9123456702', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98322-B', qr_code: 'QR-CS2202' },
    { student_id: 3, roll_number: 'CS2203', register_number: 'REG2022003', full_name: 'Rohan Gupta', email: 'rohan.gupta@student.edu', phone: '+91 9123456703', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98323-C', qr_code: 'QR-CS2203' },
    { student_id: 4, roll_number: 'CS2204', register_number: 'REG2022004', full_name: 'Ananya Iyer', email: 'ananya.iyer@student.edu', phone: '+91 9123456704', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98324-D', qr_code: 'QR-CS2204' },
    { student_id: 5, roll_number: 'CS2205', register_number: 'REG2022005', full_name: 'Kabir Khan', email: 'kabir.khan@student.edu', phone: '+91 9123456705', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98325-E', qr_code: 'QR-CS2205' },
    { student_id: 6, roll_number: 'CS2206', register_number: 'REG2022006', full_name: 'Ishita Mehra', email: 'ishita.mehra@student.edu', phone: '+91 9123456706', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98326-F', qr_code: 'QR-CS2206' },
    { student_id: 7, roll_number: 'CS2207', register_number: 'REG2022007', full_name: 'Aditya Singh', email: 'aditya.singh@student.edu', phone: '+91 9123456707', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98327-G', qr_code: 'QR-CS2207' },
    { student_id: 8, roll_number: 'CS2208', register_number: 'REG2022008', full_name: 'Pooja Reddy', email: 'pooja.reddy@student.edu', phone: '+91 9123456708', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98328-H', qr_code: 'QR-CS2208' },
    { student_id: 9, roll_number: 'CS2209', register_number: 'REG2022009', full_name: 'Manish Deshmukh', email: 'manish.d@student.edu', phone: '+91 9123456709', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98329-I', qr_code: 'QR-CS2209' },
    { student_id: 10, roll_number: 'CS2210', register_number: 'REG2022010', full_name: 'Sneha Pillai', email: 'sneha.pillai@student.edu', phone: '+91 9123456710', dept_id: 1, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98330-J', qr_code: 'QR-CS2210' },
    { student_id: 11, roll_number: 'EC2201', register_number: 'REG2022101', full_name: 'Varun Nair', email: 'varun.nair@student.edu', phone: '+91 9123456711', dept_id: 2, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98331-K', qr_code: 'QR-EC2201' },
    { student_id: 12, roll_number: 'EC2202', register_number: 'REG2022102', full_name: 'Kavya Menon', email: 'kavya.menon@student.edu', phone: '+91 9123456712', dept_id: 2, semester: 5, section: 'A', admission_year: 2022, rfid: 'RFID-98332-L', qr_code: 'QR-EC2202' }
  ],

  sessions: [
    { session_id: 1, course_id: 1, faculty_id: 1, session_date: '2026-10-15', start_time: '09:00', end_time: '10:00', topic_covered: 'Relational Algebra & Tuple Calculus', session_type: 'Lecture', classroom: 'LH-201', qr_session_code: 'QR-SESS-001' },
    { session_id: 2, course_id: 1, faculty_id: 1, session_date: '2026-10-16', start_time: '09:00', end_time: '10:00', topic_covered: 'SQL DDL, DML and Integrity Constraints', session_type: 'Lecture', classroom: 'LH-201', qr_session_code: 'QR-SESS-002' },
    { session_id: 3, course_id: 1, faculty_id: 1, session_date: '2026-10-18', start_time: '09:00', end_time: '10:00', topic_covered: 'Database Normalization: 1NF, 2NF, 3NF', session_type: 'Lecture', classroom: 'LH-201', qr_session_code: 'QR-SESS-003' },
    { session_id: 4, course_id: 1, faculty_id: 1, session_date: '2026-10-20', start_time: '11:00', end_time: '13:00', topic_covered: 'DBMS Lab: Complex Joins & Subqueries', session_type: 'Lab', classroom: 'Lab-3B', qr_session_code: 'QR-SESS-004' },
    { session_id: 5, course_id: 1, faculty_id: 1, session_date: '2026-10-22', start_time: '09:00', end_time: '10:00', topic_covered: 'Transactions, ACID Properties and Serializability', session_type: 'Lecture', classroom: 'LH-201', qr_session_code: 'QR-SESS-005' },
    { session_id: 6, course_id: 2, faculty_id: 3, session_date: '2026-10-15', start_time: '10:15', end_time: '11:15', topic_covered: 'Asymptotic Notations: Big O, Omega, Theta', session_type: 'Lecture', classroom: 'LH-202', qr_session_code: 'QR-SESS-006' },
    { session_id: 7, course_id: 2, faculty_id: 3, session_date: '2026-10-17', start_time: '10:15', end_time: '11:15', topic_covered: 'Divide and Conquer: Merge Sort and Quick Sort', session_type: 'Lecture', classroom: 'LH-202', qr_session_code: 'QR-SESS-007' },
    { session_id: 8, course_id: 2, faculty_id: 3, session_date: '2026-10-19', start_time: '10:15', end_time: '11:15', topic_covered: 'Greedy Method: Huffman Coding & MST', session_type: 'Lecture', classroom: 'LH-202', qr_session_code: 'QR-SESS-008' }
  ],

  // Attendance Records mapping session_id to student_id
  attendance: [
    // Session 1
    { record_id: 1, session_id: 1, student_id: 1, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-15 09:02' },
    { record_id: 2, session_id: 1, student_id: 2, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-15 09:03' },
    { record_id: 3, session_id: 1, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 09:05' },
    { record_id: 4, session_id: 1, student_id: 4, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-15 09:01' },
    { record_id: 5, session_id: 1, student_id: 5, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 09:05' },
    { record_id: 6, session_id: 1, student_id: 6, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-15 09:04' },
    { record_id: 7, session_id: 1, student_id: 7, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 09:05' },
    { record_id: 8, session_id: 1, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 09:05' },
    { record_id: 9, session_id: 1, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 09:05' },
    { record_id: 10, session_id: 1, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 09:05' },

    // Session 2
    { record_id: 11, session_id: 2, student_id: 1, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:01' },
    { record_id: 12, session_id: 2, student_id: 2, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:02' },
    { record_id: 13, session_id: 2, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-16 09:05' },
    { record_id: 14, session_id: 2, student_id: 4, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:01' },
    { record_id: 15, session_id: 2, student_id: 5, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:03' },
    { record_id: 16, session_id: 2, student_id: 6, status: 'Late', method: 'AdminManual', marked_at: '2026-10-16 09:20' },
    { record_id: 17, session_id: 2, student_id: 7, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:04' },
    { record_id: 18, session_id: 2, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-16 09:05' },
    { record_id: 19, session_id: 2, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-16 09:05' },
    { record_id: 20, session_id: 2, student_id: 10, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-16 09:02' },

    // Session 3
    { record_id: 21, session_id: 3, student_id: 1, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-18 09:02' },
    { record_id: 22, session_id: 3, student_id: 2, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-18 09:02' },
    { record_id: 23, session_id: 3, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-18 09:05' },
    { record_id: 24, session_id: 3, student_id: 4, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-18 09:01' },
    { record_id: 25, session_id: 3, student_id: 5, status: 'Present', method: 'AdminManual', marked_at: '2026-10-18 09:05' },
    { record_id: 26, session_id: 3, student_id: 6, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-18 09:03' },
    { record_id: 27, session_id: 3, student_id: 7, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-18 09:05' },
    { record_id: 28, session_id: 3, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-18 09:05' },
    { record_id: 29, session_id: 3, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-18 09:05' },
    { record_id: 30, session_id: 3, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-18 09:05' },

    // Session 4
    { record_id: 31, session_id: 4, student_id: 1, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:02' },
    { record_id: 32, session_id: 4, student_id: 2, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:03' },
    { record_id: 33, session_id: 4, student_id: 3, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:05' },
    { record_id: 34, session_id: 4, student_id: 4, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:01' },
    { record_id: 35, session_id: 4, student_id: 5, status: 'Late', method: 'AdminManual', marked_at: '2026-10-20 11:25' },
    { record_id: 36, session_id: 4, student_id: 6, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:04' },
    { record_id: 37, session_id: 4, student_id: 7, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:05' },
    { record_id: 38, session_id: 4, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-20 11:05' },
    { record_id: 39, session_id: 4, student_id: 9, status: 'Present', method: 'Biometric', marked_at: '2026-10-20 11:05' },
    { record_id: 40, session_id: 4, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-20 11:05' },

    // Session 5
    { record_id: 41, session_id: 5, student_id: 1, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:02' },
    { record_id: 42, session_id: 5, student_id: 2, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:03' },
    { record_id: 43, session_id: 5, student_id: 3, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:05' },
    { record_id: 44, session_id: 5, student_id: 4, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:01' },
    { record_id: 45, session_id: 5, student_id: 5, status: 'Present', method: 'AdminManual', marked_at: '2026-10-22 09:05' },
    { record_id: 46, session_id: 5, student_id: 6, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:04' },
    { record_id: 47, session_id: 5, student_id: 7, status: 'Present', method: 'QRCodeScan', marked_at: '2026-10-22 09:05' },
    { record_id: 48, session_id: 5, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-22 09:05' },
    { record_id: 49, session_id: 5, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-22 09:05' },
    { record_id: 50, session_id: 5, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-22 09:05' },

    // Session 6
    { record_id: 51, session_id: 6, student_id: 1, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 52, session_id: 6, student_id: 2, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 53, session_id: 6, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 54, session_id: 6, student_id: 4, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 55, session_id: 6, student_id: 5, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 56, session_id: 6, student_id: 6, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 57, session_id: 6, student_id: 7, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 58, session_id: 6, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 59, session_id: 6, student_id: 9, status: 'Present', method: 'AdminManual', marked_at: '2026-10-15 10:18' },
    { record_id: 60, session_id: 6, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-15 10:18' },

    // Session 7
    { record_id: 61, session_id: 7, student_id: 1, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 62, session_id: 7, student_id: 2, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 63, session_id: 7, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 64, session_id: 7, student_id: 4, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 65, session_id: 7, student_id: 5, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 66, session_id: 7, student_id: 6, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 67, session_id: 7, student_id: 7, status: 'Present', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 68, session_id: 7, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 69, session_id: 7, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-17 10:20' },
    { record_id: 70, session_id: 7, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-17 10:20' },

    // Session 8
    { record_id: 71, session_id: 8, student_id: 1, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 72, session_id: 8, student_id: 2, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 73, session_id: 8, student_id: 3, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 74, session_id: 8, student_id: 4, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 75, session_id: 8, student_id: 5, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 76, session_id: 8, student_id: 6, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 77, session_id: 8, student_id: 7, status: 'Present', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 78, session_id: 8, student_id: 8, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 79, session_id: 8, student_id: 9, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-19 10:20' },
    { record_id: 80, session_id: 8, student_id: 10, status: 'Absent', method: 'AdminManual', marked_at: '2026-10-19 10:20' }
  ],

  audit_logs: [
    { audit_id: 1, action_type: 'UPDATE', record_id: 16, student_name: 'Ishita Mehra', session_id: 2, old_status: 'Absent', new_status: 'Late', changed_by: 'Prof. Arvind Kumar', changed_at: '2026-10-16 09:22:10', notes: 'Student arrived 15 mins late with transit delay note' },
    { audit_id: 2, action_type: 'UPDATE', record_id: 35, student_name: 'Kabir Khan', session_id: 4, old_status: 'Absent', new_status: 'Late', changed_by: 'Dr. Ramesh Sharma', changed_at: '2026-10-20 11:27:00', notes: 'Permission granted by Lab Incharge' }
  ]
};
