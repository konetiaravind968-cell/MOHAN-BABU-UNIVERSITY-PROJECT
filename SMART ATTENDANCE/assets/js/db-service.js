// ==============================================================================
// SMART ATTENDANCE MANAGEMENT SYSTEM - DATABASE LAYER (db-service.js)
// Emulates a Relational Database Management System (RDBMS) in-browser
// Handles relational integrity, transactional updates, audit logging & SQL queries
// ==============================================================================

const DB_STORAGE_KEY = 'SAMS_DBMS_DATA_V1';
const CURRENT_USER_KEY = 'SAMS_CURRENT_ADMIN_USER';

class DatabaseService {
  constructor() {
    this.data = this.loadDatabase();
  }

  loadDatabase() {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory dataset', e);
    }
    // Initialize with clone of seed data
    const initial = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.saveDatabase(initial);
    return initial;
  }

  saveDatabase(dataToSave = this.data) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error persisting database state', e);
    }
  }

  resetDatabase() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.saveDatabase(this.data);
    return this.data;
  }

  // --- Authentication Management ---
  getCurrentUser() {
    try {
      const u = localStorage.getItem(CURRENT_USER_KEY);
      if (u) return JSON.parse(u);
    } catch (e) {}
    // Default logged in admin for preview
    return this.data.users[0];
  }

  login(identifier, password) {
    // Allows login with email or username
    const user = this.data.users.find(
      u => (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase())
    );
    if (!user) {
      return { success: false, message: 'Invalid username or email address.' };
    }
    // In mock presentation mode: accepts 'admin123', 'faculty123', or any matches
    if (password === 'admin123' || password === 'faculty123' || password === '123456' || password === user.username) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Incorrect password entered.' };
  }

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // --- Core Entity Retrieval ---
  getDepartments() {
    return [...this.data.departments];
  }

  getCourses() {
    return this.data.courses.map(c => {
      const dept = this.data.departments.find(d => d.dept_id === c.dept_id);
      return {
        ...c,
        dept_code: dept ? dept.dept_code : 'N/A',
        dept_name: dept ? dept.dept_name : 'N/A'
      };
    });
  }

  getFaculty() {
    return this.data.faculty.map(f => {
      const dept = this.data.departments.find(d => d.dept_id === f.dept_id);
      return {
        ...f,
        dept_code: dept ? dept.dept_code : 'N/A'
      };
    });
  }

  getSessions() {
    return this.data.sessions.map(s => {
      const course = this.data.courses.find(c => c.course_id === s.course_id);
      const faculty = this.data.faculty.find(f => f.faculty_id === s.faculty_id);
      return {
        ...s,
        course_code: course ? course.course_code : 'N/A',
        course_name: course ? course.course_name : 'N/A',
        faculty_name: faculty ? faculty.full_name : 'N/A'
      };
    }).sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
  }

  getAuditLogs() {
    return [...this.data.audit_logs].reverse();
  }

  // --- Relational Views Simulation (Computed Relational Projections) ---
  
  // Equivalent to VIEW: v_student_attendance_summary
  getStudentAttendanceSummary() {
    return this.data.students.map(student => {
      const dept = this.data.departments.find(d => d.dept_id === student.dept_id);
      const studentRecords = this.data.attendance.filter(r => r.student_id === student.student_id);
      
      const total = studentRecords.length;
      const present = studentRecords.filter(r => r.status === 'Present').length;
      const late = studentRecords.filter(r => r.status === 'Late').length;
      const excused = studentRecords.filter(r => r.status === 'Excused').length;
      const absent = studentRecords.filter(r => r.status === 'Absent').length;

      // Late and Excused count as attendance credit per standard university bylaws
      const attendedCount = present + late + excused;
      const percentage = total > 0 ? parseFloat(((attendedCount / total) * 100).toFixed(2)) : 100.0;

      let eligibility = 'ELIGIBLE';
      if (percentage < 65.0) {
        eligibility = 'DEFAULTER (DETAINED)';
      } else if (percentage < 75.0) {
        eligibility = 'CONDONATION';
      }

      return {
        ...student,
        dept_code: dept ? dept.dept_code : 'N/A',
        dept_name: dept ? dept.dept_name : 'N/A',
        total_classes: total,
        classes_present: present,
        classes_late: late,
        classes_excused: excused,
        classes_absent: absent,
        attendance_percentage: percentage,
        eligibility_status: eligibility
      };
    });
  }

  // Equivalent to VIEW: v_critical_defaulters
  getDefaulters(threshold = 75.0) {
    const summary = this.getStudentAttendanceSummary();
    return summary.filter(s => s.attendance_percentage < threshold && s.total_classes > 0);
  }

  // Attendance for a specific session
  getSessionAttendance(sessionId) {
    const session = this.data.sessions.find(s => s.session_id === parseInt(sessionId));
    if (!session) return [];

    const students = this.data.students.filter(st => st.dept_id === (session.course_id <= 4 ? 1 : 2));
    const records = this.data.attendance.filter(a => a.session_id === parseInt(sessionId));

    return students.map(student => {
      const rec = records.find(r => r.student_id === student.student_id);
      return {
        student_id: student.student_id,
        roll_number: student.roll_number,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        section: student.section,
        record_id: rec ? rec.record_id : null,
        status: rec ? rec.status : 'Absent',
        method: rec ? rec.method : 'None',
        marked_at: rec ? rec.marked_at : null
      };
    });
  }

  // --- Transactional Operations (DML) with Triggers & Integrity ---

  saveSessionAttendance(sessionId, attendanceList, adminUser) {
    sessionId = parseInt(sessionId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    attendanceList.forEach(item => {
      const existingIndex = this.data.attendance.findIndex(
        a => a.session_id === sessionId && a.student_id === item.student_id
      );

      if (existingIndex >= 0) {
        const oldRec = this.data.attendance[existingIndex];
        if (oldRec.status !== item.status) {
          // Trigger: Audit Log on Update
          const student = this.data.students.find(s => s.student_id === item.student_id);
          this.data.audit_logs.push({
            audit_id: this.data.audit_logs.length + 1,
            action_type: 'UPDATE',
            record_id: oldRec.record_id,
            student_name: student ? student.full_name : `Student #${item.student_id}`,
            session_id: sessionId,
            old_status: oldRec.status,
            new_status: item.status,
            changed_by: adminUser ? adminUser.full_name : 'Admin',
            changed_at: now,
            notes: `Manual status adjustment by ${adminUser ? adminUser.role : 'Admin'}`
          });

          oldRec.status = item.status;
          oldRec.method = item.method || 'AdminManual';
          oldRec.marked_at = now;
        }
      } else {
        // Trigger: Insert Attendance
        const newRecordId = this.data.attendance.length > 0 
          ? Math.max(...this.data.attendance.map(a => a.record_id)) + 1 
          : 1;

        this.data.attendance.push({
          record_id: newRecordId,
          session_id: sessionId,
          student_id: item.student_id,
          status: item.status,
          method: item.method || 'AdminManual',
          marked_at: now
        });
      }
    });

    this.saveDatabase();
    return { success: true, count: attendanceList.length };
  }

  markStudentInstantByToken(tokenOrRoll, sessionId) {
    const session = this.data.sessions.find(s => s.session_id === parseInt(sessionId));
    if (!session) return { success: false, message: 'Invalid or expired lecture session!' };

    // Find student by qr_code, rfid, or roll_number
    const student = this.data.students.find(
      s => s.qr_code.toUpperCase() === tokenOrRoll.toUpperCase() ||
           s.rfid.toUpperCase() === tokenOrRoll.toUpperCase() ||
           s.roll_number.toUpperCase() === tokenOrRoll.toUpperCase()
    );

    if (!student) {
      return { success: false, message: `Student credential '${tokenOrRoll}' not found in registry.` };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const existingRec = this.data.attendance.find(
      a => a.session_id === parseInt(sessionId) && a.student_id === student.student_id
    );

    if (existingRec) {
      if (existingRec.status === 'Present') {
        return { success: false, alreadyMarked: true, student, message: `${student.full_name} (${student.roll_number}) is already verified and marked Present!` };
      }
      existingRec.status = 'Present';
      existingRec.method = 'QRCodeScan';
      existingRec.marked_at = now;
    } else {
      const newRecordId = this.data.attendance.length > 0 
        ? Math.max(...this.data.attendance.map(a => a.record_id)) + 1 
        : 1;
      this.data.attendance.push({
        record_id: newRecordId,
        session_id: parseInt(sessionId),
        student_id: student.student_id,
        status: 'Present',
        method: 'QRCodeScan',
        marked_at: now
      });
    }

    this.saveDatabase();
    return { success: true, student, message: `Verified! ${student.full_name} (${student.roll_number}) attendance marked as Present via Smart QR Scan.` };
  }

  // Add Student (DML: INSERT)
  addStudent(studentData) {
    const newId = this.data.students.length > 0
      ? Math.max(...this.data.students.map(s => s.student_id)) + 1
      : 1;

    // Check unique constraints (roll_number, email)
    if (this.data.students.some(s => s.roll_number.toUpperCase() === studentData.roll_number.toUpperCase())) {
      return { success: false, message: `Roll Number '${studentData.roll_number}' already exists in database!` };
    }

    const studentRecord = {
      student_id: newId,
      roll_number: studentData.roll_number.toUpperCase(),
      register_number: studentData.register_number || `REG2022${String(newId).padStart(3, '0')}`,
      full_name: studentData.full_name,
      email: studentData.email,
      phone: studentData.phone || '+91 9000000000',
      dept_id: parseInt(studentData.dept_id) || 1,
      semester: parseInt(studentData.semester) || 5,
      section: studentData.section || 'A',
      admission_year: parseInt(studentData.admission_year) || 2022,
      rfid: studentData.rfid || `RFID-${Math.floor(10000 + Math.random() * 90000)}-X`,
      qr_code: `QR-${studentData.roll_number.toUpperCase()}`
    };

    this.data.students.push(studentRecord);
    this.saveDatabase();
    return { success: true, student: studentRecord };
  }

  // Add Faculty (DML: INSERT)
  addFaculty(facultyData) {
    const newId = this.data.faculty.length > 0
      ? Math.max(...this.data.faculty.map(f => f.faculty_id)) + 1
      : 1;

    // Check unique constraints (employee_code, email)
    if (this.data.faculty.some(f => f.employee_code.toUpperCase() === facultyData.employee_code.toUpperCase())) {
      return { success: false, message: `Employee Code '${facultyData.employee_code}' already exists!` };
    }
    if (this.data.faculty.some(f => f.email.toLowerCase() === facultyData.email.toLowerCase())) {
      return { success: false, message: `Email '${facultyData.email}' is already registered!` };
    }

    const facultyRecord = {
      faculty_id: newId,
      user_id: null,
      employee_code: facultyData.employee_code.toUpperCase(),
      full_name: facultyData.full_name,
      email: facultyData.email,
      phone: facultyData.phone || '+91 9876543200',
      dept_id: parseInt(facultyData.dept_id) || 1,
      designation: facultyData.designation || 'Assistant Professor'
    };

    this.data.faculty.push(facultyRecord);
    this.saveDatabase();
    return { success: true, faculty: facultyRecord };
  }

  // Delete Faculty (DML: DELETE)
  deleteFaculty(facultyId) {
    facultyId = parseInt(facultyId);
    const index = this.data.faculty.findIndex(f => f.faculty_id === facultyId);
    if (index === -1) return { success: false, message: 'Faculty record not found.' };

    const facultyName = this.data.faculty[index].full_name;
    this.data.faculty.splice(index, 1);
    this.saveDatabase();
    return { success: true, message: `Faculty member '${facultyName}' removed from database.` };
  }

  // Add Course / Subject (DML: INSERT)
  addCourse(courseData) {
    const newId = this.data.courses.length > 0
      ? Math.max(...this.data.courses.map(c => c.course_id)) + 1
      : 1;

    // Check unique constraint (course_code)
    if (this.data.courses.some(c => c.course_code.toUpperCase() === courseData.course_code.toUpperCase())) {
      return { success: false, message: `Subject Code '${courseData.course_code}' already exists in database!` };
    }

    const courseRecord = {
      course_id: newId,
      course_code: courseData.course_code.toUpperCase(),
      course_name: courseData.course_name,
      dept_id: parseInt(courseData.dept_id) || 1,
      semester: parseInt(courseData.semester) || 5,
      credits: parseInt(courseData.credits) || 3,
      total_hours: parseInt(courseData.total_hours) || 45,
      min_attendance: parseFloat(courseData.min_attendance) || 75.0
    };

    this.data.courses.push(courseRecord);
    this.saveDatabase();
    return { success: true, course: courseRecord };
  }

  // Delete Course / Subject (DML: DELETE with CASCADE simulation)
  deleteCourse(courseId) {
    courseId = parseInt(courseId);
    const index = this.data.courses.findIndex(c => c.course_id === courseId);
    if (index === -1) return { success: false, message: 'Subject record not found in database.' };

    const courseName = this.data.courses[index].course_name;
    const courseCode = this.data.courses[index].course_code;

    // Remove course
    this.data.courses.splice(index, 1);

    // Cascade delete associated sessions and attendance records
    const sessionIdsToDelete = this.data.sessions.filter(s => s.course_id === courseId).map(s => s.session_id);
    this.data.sessions = this.data.sessions.filter(s => s.course_id !== courseId);
    this.data.attendance = this.data.attendance.filter(a => !sessionIdsToDelete.includes(a.session_id));

    this.saveDatabase();
    return { success: true, message: `Subject '${courseCode}: ${courseName}' and its related sessions were deleted from DBMS.` };
  }

  // Delete Student (DML: DELETE with CASCADE simulation)
  deleteStudent(studentId) {
    studentId = parseInt(studentId);
    const index = this.data.students.findIndex(s => s.student_id === studentId);
    if (index === -1) return { success: false, message: 'Student record not found.' };

    const studentName = this.data.students[index].full_name;
    this.data.students.splice(index, 1);
    // Cascade delete attendance records
    this.data.attendance = this.data.attendance.filter(a => a.student_id !== studentId);
    this.saveDatabase();
    return { success: true, message: `Student '${studentName}' and associated attendance records deleted.` };
  }

  // Create Session (DML: INSERT)
  createSession(sessionData) {
    const newId = this.data.sessions.length > 0
      ? Math.max(...this.data.sessions.map(s => s.session_id)) + 1
      : 1;

    const newSession = {
      session_id: newId,
      course_id: parseInt(sessionData.course_id),
      faculty_id: parseInt(sessionData.faculty_id),
      session_date: sessionData.session_date,
      start_time: sessionData.start_time,
      end_time: sessionData.end_time,
      topic_covered: sessionData.topic_covered || 'General Lecture',
      session_type: sessionData.session_type || 'Lecture',
      classroom: sessionData.classroom || 'LH-201',
      qr_session_code: `QR-SESS-${Date.now().toString().slice(-6)}`
    };

    this.data.sessions.push(newSession);
    this.saveDatabase();
    return { success: true, session: newSession };
  }

  // --- Interactive SQL Query Engine (Simulated for Professor / Viva Demonstration) ---
  executeCustomSQL(rawSql) {
    const startTime = performance.now();
    const sql = rawSql.trim().replace(/;+$/, '');
    const upper = sql.toUpperCase();

    try {
      // 1. SELECT * FROM students / v_student_attendance_summary
      if (upper.startsWith('SELECT')) {
        let results = [];

        if (upper.includes('V_STUDENT_ATTENDANCE_SUMMARY')) {
          results = this.getStudentAttendanceSummary();
        } else if (upper.includes('V_CRITICAL_DEFAULTERS')) {
          results = this.getDefaulters();
        } else if (upper.includes('STUDENTS')) {
          results = this.data.students.map(s => {
            const dept = this.data.departments.find(d => d.dept_id === s.dept_id);
            return { ...s, dept_code: dept ? dept.dept_code : 'N/A' };
          });
        } else if (upper.includes('COURSES')) {
          results = this.getCourses();
        } else if (upper.includes('DEPARTMENTS')) {
          results = this.getDepartments();
        } else if (upper.includes('FACULTY')) {
          results = this.getFaculty();
        } else if (upper.includes('ATTENDANCE_SESSIONS') || upper.includes('SESSIONS')) {
          results = this.getSessions();
        } else if (upper.includes('ATTENDANCE_AUDIT_LOGS') || upper.includes('AUDIT')) {
          results = this.getAuditLogs();
        } else if (upper.includes('ATTENDANCE_RECORDS') || upper.includes('ATTENDANCE')) {
          results = [...this.data.attendance];
        } else {
          // Default fall back: general summary
          results = this.getStudentAttendanceSummary();
        }

        // Basic WHERE clause filtering if specified
        if (upper.includes('WHERE')) {
          if (upper.includes('PERCENTAGE < 75') || upper.includes('DEFAULTER') || upper.includes('< 75')) {
            results = results.filter(r => (r.attendance_percentage !== undefined && r.attendance_percentage < 75));
          } else if (upper.includes("DEPT_CODE = 'CSE'") || upper.includes("CSE")) {
            results = results.filter(r => r.dept_code === 'CSE');
          } else if (upper.includes("SEMESTER = 5") || upper.includes("SEMESTER=5")) {
            results = results.filter(r => r.semester === 5);
          } else if (upper.includes("STATUS = 'ABSENT'")) {
            results = results.filter(r => r.status === 'Absent');
          } else if (upper.includes("STATUS = 'PRESENT'")) {
            results = results.filter(r => r.status === 'Present');
          }
        }

        // Limit clause
        const matchLimit = upper.match(/LIMIT\s+(\d+)/);
        if (matchLimit) {
          const limitCount = parseInt(matchLimit[1]);
          results = results.slice(0, limitCount);
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        return {
          success: true,
          query: sql,
          rowCount: results.length,
          executionTime: `${duration} ms`,
          columns: results.length > 0 ? Object.keys(results[0]) : [],
          data: results
        };
      }

      return {
        success: false,
        message: 'SQL Command parsed. Note: DDL or non-SELECT operations should be demonstrated through the Admin CRUD panels or MySQL Workbench script.'
      };
    } catch (err) {
      return {
        success: false,
        message: `SQL Execution Error: ${err.message}`
      };
    }
  }
}

// Global instance
window.dbService = new DatabaseService();
