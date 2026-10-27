// ==============================================================================
// SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS)
// FRONTEND CONTROLLER & APPLICATION LOGIC (app.js)
// ==============================================================================

let attendanceChartInstance = null;
let deptChartInstance = null;
let activeSessionId = 1;
let currentAttendanceList = [];
let qrTimerInterval = null;
let qrSecondsLeft = 60;

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initDashboardMetrics();
  initCharts();
  initMarkAttendanceGrid();
  initSmartQR();
  initStudentsDirectory();
  initDefaultersList();
  initCoursesAndFaculty();
  initReportsCenter();
  initSQLConsole();
  initAuditLogs();
});

// ==============================================================================
// 1. AUTHENTICATION & ADMIN SESSION
// ==============================================================================
function initAuth() {
  updateUserUI();

  // Login Form Submission
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const res = window.dbService.login(identifier, password);

      if (res.success) {
        showToast(`Welcome back, ${res.user.full_name}!`, 'success');
        closeModal('login-modal');
        updateUserUI();
        refreshAllViews();
      } else {
        showToast(res.message, 'error');
      }
    });
  }
}

function updateUserUI() {
  const user = window.dbService.getCurrentUser();
  const nameEl = document.getElementById('nav-user-name');
  const roleEl = document.getElementById('nav-user-role');
  const avatarEl = document.getElementById('nav-user-avatar');

  if (user && nameEl && roleEl) {
    nameEl.textContent = user.full_name;
    roleEl.textContent = user.role;
    if (avatarEl) {
      avatarEl.textContent = user.full_name.charAt(0);
    }
  }
}

function quickDemoLogin(email, role) {
  const res = window.dbService.login(email, 'admin123');
  if (res.success) {
    showToast(`Logged in as ${role} (${res.user.full_name})`, 'success');
    closeModal('login-modal');
    updateUserUI();
    refreshAllViews();
  }
}

function handleLogout() {
  window.dbService.logout();
  showToast('Admin logged out. Switch accounts or login anytime.', 'info');
  openModal('login-modal');
  updateUserUI();
}

// ==============================================================================
// 2. NAVIGATION & TABS
// ==============================================================================
function initNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');
      switchView(targetView);
    });
  });
}

function switchView(viewId) {
  // Update sidebar active classes
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('data-view') === viewId) {
      t.classList.add('active', 'bg-indigo-600', 'text-white');
      t.classList.remove('text-slate-600', 'hover:bg-slate-100');
    } else {
      t.classList.remove('active', 'bg-indigo-600', 'text-white');
      t.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
  });

  // Toggle view containers
  document.querySelectorAll('.app-view').forEach(view => {
    if (view.id === `view-${viewId}`) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  });

  // Trigger specialized view initializers if needed
  if (viewId === 'dashboard') {
    initDashboardMetrics();
    initCharts();
  } else if (viewId === 'mark-attendance') {
    loadMarkAttendanceSession(activeSessionId);
  } else if (viewId === 'defaulters') {
    renderDefaultersTable();
  } else if (viewId === 'students') {
    renderStudentsDirectory();
  } else if (viewId === 'courses') {
    renderFacultyDirectory();
    renderCoursesCatalog();
  } else if (viewId === 'reports') {
    initReportsCenter();
  } else if (viewId === 'smart-qr') {
    generateDynamicQR();
  } else if (viewId === 'audit') {
    renderAuditLogs();
  }
}

function refreshAllViews() {
  initDashboardMetrics();
  initCharts();
  renderStudentsDirectory();
  renderDefaultersTable();
  renderFacultyDirectory();
  renderCoursesCatalog();
  renderAuditLogs();
}

// ==============================================================================
// 3. DASHBOARD METRICS & CHARTS
// ==============================================================================
function initDashboardMetrics() {
  const students = window.dbService.data.students;
  const sessions = window.dbService.data.sessions;
  const attendance = window.dbService.data.attendance;
  const defaulters = window.dbService.getDefaulters();

  const totalClasses = attendance.length;
  const totalPresent = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const overallTurnout = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '100.0';

  const countStudentsEl = document.getElementById('stat-total-students');
  const statTurnoutEl = document.getElementById('stat-overall-turnout');
  const statSessionsEl = document.getElementById('stat-total-sessions');
  const statDefaultersEl = document.getElementById('stat-total-defaulters');

  if (countStudentsEl) countStudentsEl.textContent = students.length;
  if (statTurnoutEl) statTurnoutEl.textContent = `${overallTurnout}%`;
  if (statSessionsEl) statSessionsEl.textContent = sessions.length;
  if (statDefaultersEl) statDefaultersEl.textContent = defaulters.length;
}

function initCharts() {
  // 1. Daily Turnout Trend Chart
  const trendCtx = document.getElementById('attendanceTrendChart');
  if (trendCtx) {
    if (attendanceChartInstance) attendanceChartInstance.destroy();

    const sessions = window.dbService.getSessions().slice(0, 6).reverse();
    const labels = sessions.map(s => `${s.session_date.slice(5)} (${s.course_code})`);
    const dataValues = sessions.map(s => {
      const records = window.dbService.data.attendance.filter(a => a.session_id === s.session_id);
      const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      return records.length > 0 ? Math.round((present / records.length) * 100) : 100;
    });

    attendanceChartInstance = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['10-15', '10-16', '10-18', '10-20', '10-22'],
        datasets: [{
          label: 'Attendance Turnout Rate (%)',
          data: dataValues.length > 0 ? dataValues : [85, 90, 75, 95, 80],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4f46e5',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => `${v}%` }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Department Comparison Bar Chart
  const deptCtx = document.getElementById('deptAttendanceChart');
  if (deptCtx) {
    if (deptChartInstance) deptChartInstance.destroy();

    deptChartInstance = new Chart(deptCtx, {
      type: 'bar',
      data: {
        labels: ['CSE (Computer Sci)', 'ECE (Electronics)', 'IT (Info Tech)', 'ME (Mechanical)'],
        datasets: [{
          label: 'Average Department Attendance (%)',
          data: [82.4, 91.5, 79.8, 86.2],
          backgroundColor: ['#4f46e5', '#06b6d4', '#3b82f6', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => `${v}%` }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}

// ==============================================================================
// 4. SMART QR CODE ATTENDANCE
// ==============================================================================
function initSmartQR() {
  const sessionSelect = document.getElementById('qr-session-select');
  if (sessionSelect) {
    const sessions = window.dbService.getSessions();
    sessionSelect.innerHTML = sessions.map(s => 
      `<option value="${s.session_id}">${s.course_code} - ${s.course_name} (${s.session_date} ${s.start_time})</option>`
    ).join('');

    sessionSelect.addEventListener('change', () => {
      activeSessionId = parseInt(sessionSelect.value);
      generateDynamicQR();
    });
  }

  // Instant Roll/Token input simulation
  const scanInput = document.getElementById('qr-token-input');
  const scanBtn = document.getElementById('qr-token-submit');
  if (scanBtn && scanInput) {
    scanBtn.addEventListener('click', () => {
      handleManualQRVerification(scanInput.value.trim());
    });
    scanInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleManualQRVerification(scanInput.value.trim());
      }
    });
  }

  // Quick Roll Buttons
  document.querySelectorAll('.quick-student-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const roll = btn.getAttribute('data-roll');
      if (scanInput) scanInput.value = roll;
      handleManualQRVerification(roll);
    });
  });

  generateDynamicQR();
}

function generateDynamicQR() {
  const container = document.getElementById('qrcode-canvas-container');
  if (!container) return;

  const session = window.dbService.data.sessions.find(s => s.session_id === activeSessionId) || window.dbService.data.sessions[0];
  const securePayload = JSON.stringify({
    institution: 'CAMPUS-PORTAL-SAMS',
    sessionId: session.session_id,
    course: session.course_id,
    token: session.qr_session_code,
    timestamp: Date.now()
  });

  container.innerHTML = '';
  try {
    new QRCode(container, {
      text: securePayload,
      width: 200,
      height: 200,
      colorDark: '#1e1b4b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-xs font-mono bg-slate-100 rounded-lg border">${session.qr_session_code}</div>`;
  }

  // Restart 60-second rotating QR code countdown
  clearInterval(qrTimerInterval);
  qrSecondsLeft = 60;
  const timerBadge = document.getElementById('qr-countdown-text');
  if (timerBadge) timerBadge.textContent = `${qrSecondsLeft}s`;

  qrTimerInterval = setInterval(() => {
    qrSecondsLeft--;
    if (timerBadge) timerBadge.textContent = `${qrSecondsLeft}s`;
    if (qrSecondsLeft <= 0) {
      qrSecondsLeft = 60;
      // Refresh session token for security demonstration
      session.qr_session_code = `QR-SESS-${Date.now().toString().slice(-6)}`;
      generateDynamicQR();
    }
  }, 1000);
}

function handleManualQRVerification(tokenOrRoll) {
  if (!tokenOrRoll) {
    showToast('Please type a Student Roll No (e.g. CS2201) or QR token.', 'warning');
    return;
  }

  const res = window.dbService.markStudentInstantByToken(tokenOrRoll, activeSessionId);
  const resultBox = document.getElementById('qr-scan-feedback');

  if (res.success) {
    showToast(res.message, 'success');
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm animate-pulse">
          <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <strong>Verified Present:</strong> ${res.student.full_name} (${res.student.roll_number}) &bull; Section ${res.student.section}
            <div class="text-xs text-emerald-600 mt-0.5">Recorded in database table 'attendance_records' via Smart QR Scan</div>
          </div>
        </div>
      `;
    }
    refreshAllViews();
  } else {
    showToast(res.message, res.alreadyMarked ? 'info' : 'error');
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 text-amber-800 text-sm">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div>${res.message}</div>
        </div>
      `;
    }
  }

  const scanInput = document.getElementById('qr-token-input');
  if (scanInput) scanInput.value = '';
}

// ==============================================================================
// 5. MARK ATTENDANCE GRID (MANUAL / BATCH MODE)
// ==============================================================================
function initMarkAttendanceGrid() {
  const sessionSelect = document.getElementById('grid-session-select');
  if (sessionSelect) {
    const sessions = window.dbService.getSessions();
    sessionSelect.innerHTML = sessions.map(s => 
      `<option value="${s.session_id}">${s.course_code}: ${s.course_name} (${s.session_date})</option>`
    ).join('');

    sessionSelect.addEventListener('change', () => {
      loadMarkAttendanceSession(sessionSelect.value);
    });
  }

  // Mark All Buttons
  const btnAllPresent = document.getElementById('btn-mark-all-present');
  const btnAllAbsent = document.getElementById('btn-mark-all-absent');
  const btnSaveAttendance = document.getElementById('btn-save-grid-attendance');

  if (btnAllPresent) {
    btnAllPresent.addEventListener('click', () => {
      currentAttendanceList.forEach(item => item.status = 'Present');
      renderAttendanceGridTable();
      showToast('All enrolled students marked as Present.', 'info');
    });
  }

  if (btnAllAbsent) {
    btnAllAbsent.addEventListener('click', () => {
      currentAttendanceList.forEach(item => item.status = 'Absent');
      renderAttendanceGridTable();
      showToast('All enrolled students marked as Absent.', 'info');
    });
  }

  if (btnSaveAttendance) {
    btnSaveAttendance.addEventListener('click', () => {
      const select = document.getElementById('grid-session-select');
      const sessId = select ? select.value : 1;
      const user = window.dbService.getCurrentUser();
      
      const res = window.dbService.saveSessionAttendance(sessId, currentAttendanceList, user);
      if (res.success) {
        showToast(`Saved! Successfully synced ${res.count} attendance records to DBMS.`, 'success');
        refreshAllViews();
      }
    });
  }

  loadMarkAttendanceSession(1);
}

function loadMarkAttendanceSession(sessionId) {
  const records = window.dbService.getSessionAttendance(sessionId);
  currentAttendanceList = JSON.parse(JSON.stringify(records));
  renderAttendanceGridTable();
}

function renderAttendanceGridTable() {
  const tbody = document.getElementById('attendance-grid-body');
  if (!tbody) return;

  const presentCount = currentAttendanceList.filter(s => s.status === 'Present').length;
  const absentCount = currentAttendanceList.filter(s => s.status === 'Absent').length;
  const lateCount = currentAttendanceList.filter(s => s.status === 'Late').length;

  const badgePresentEl = document.getElementById('grid-count-present');
  const badgeAbsentEl = document.getElementById('grid-count-absent');
  const badgeLateEl = document.getElementById('grid-count-late');

  if (badgePresentEl) badgePresentEl.textContent = presentCount;
  if (badgeAbsentEl) badgeAbsentEl.textContent = absentCount;
  if (badgeLateEl) badgeLateEl.textContent = lateCount;

  tbody.innerHTML = currentAttendanceList.map((st, idx) => `
    <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
      <td class="py-3 px-4 font-mono font-medium text-slate-700">${st.roll_number}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${st.full_name}</td>
      <td class="py-3 px-4 text-slate-500">${st.section}</td>
      <td class="py-3 px-4">
        <div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 space-x-1">
          <button type="button" onclick="setStudentGridStatus(${st.student_id}, 'Present')" 
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${st.status === 'Present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}">
            Present
          </button>
          <button type="button" onclick="setStudentGridStatus(${st.student_id}, 'Absent')" 
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${st.status === 'Absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}">
            Absent
          </button>
          <button type="button" onclick="setStudentGridStatus(${st.student_id}, 'Late')" 
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${st.status === 'Late' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}">
            Late
          </button>
        </div>
      </td>
      <td class="py-3 px-4 text-xs font-mono text-slate-500">${st.method || 'Manual'}</td>
    </tr>
  `).join('');
}

window.setStudentGridStatus = function(studentId, newStatus) {
  const item = currentAttendanceList.find(s => s.student_id === studentId);
  if (item) {
    item.status = newStatus;
    renderAttendanceGridTable();
  }
};

// ==============================================================================
// 6. STUDENTS DIRECTORY & CRUD
// ==============================================================================
function initStudentsDirectory() {
  renderStudentsDirectory();

  // Search input filter
  const searchInput = document.getElementById('students-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderStudentsDirectory(searchInput.value.toLowerCase());
    });
  }

  // Add Student Form submission
  const addForm = document.getElementById('add-student-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        roll_number: document.getElementById('new-roll-no').value.trim(),
        full_name: document.getElementById('new-full-name').value.trim(),
        email: document.getElementById('new-email').value.trim(),
        phone: document.getElementById('new-phone').value.trim(),
        dept_id: document.getElementById('new-dept-id').value,
        semester: document.getElementById('new-semester').value,
        section: document.getElementById('new-section').value
      };

      const res = window.dbService.addStudent(formData);
      if (res.success) {
        showToast(`Student ${res.student.full_name} (${res.student.roll_number}) added successfully.`, 'success');
        closeModal('add-student-modal');
        addForm.reset();
        refreshAllViews();
      } else {
        showToast(res.message, 'error');
      }
    });
  }
}

function renderStudentsDirectory(query = '') {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  const students = window.dbService.getStudentAttendanceSummary();
  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(query) ||
    s.roll_number.toLowerCase().includes(query) ||
    s.dept_code.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map(st => {
    let badgeClass = 'badge-eligible';
    if (st.eligibility_status.includes('DEFAULTER')) badgeClass = 'badge-defaulter';
    else if (st.eligibility_status.includes('CONDONATION')) badgeClass = 'badge-condonation';

    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <td class="py-3 px-4 font-mono font-semibold text-slate-800">${st.roll_number}</td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-900">${st.full_name}</div>
          <div class="text-xs text-slate-500">${st.email}</div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">${st.dept_code}</span>
          <span class="text-xs text-slate-500 ml-1">Sem ${st.semester}-${st.section}</span>
        </td>
        <td class="py-3 px-4 font-mono text-sm">${st.classes_present} / ${st.total_classes}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-sm ${st.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}">${st.attendance_percentage}%</span>
            <div class="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full ${st.attendance_percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}" style="width: ${st.attendance_percentage}%"></div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}">
            ${st.eligibility_status}
          </span>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <button onclick="viewStudentProfileCard(${st.student_id})" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Full Report">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button onclick="confirmDeleteStudent(${st.student_id})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Student">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.viewStudentProfileCard = function(studentId) {
  const summary = window.dbService.getStudentAttendanceSummary();
  const st = summary.find(s => s.student_id === studentId);
  if (!st) return;

  const modal = document.getElementById('student-profile-modal');
  const detailsContainer = document.getElementById('student-profile-content');
  if (modal && detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="border-b pb-4 flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-slate-800">${st.full_name}</h3>
          <p class="text-sm font-mono text-indigo-600 font-semibold">${st.roll_number} &bull; Reg: ${st.register_number}</p>
          <p class="text-xs text-slate-500 mt-1">${st.dept_name} (${st.dept_code}) &bull; Sem ${st.semester} - Sec ${st.section}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs font-bold rounded-full ${st.attendance_percentage < 75 ? 'badge-defaulter' : 'badge-eligible'}">
            ${st.eligibility_status}
          </span>
          <div class="text-2xl font-black mt-2 ${st.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}">
            ${st.attendance_percentage}%
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 my-4 text-center">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div class="text-xs text-slate-500">Total Lectures</div>
          <div class="text-lg font-bold text-slate-800">${st.total_classes}</div>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <div class="text-xs text-emerald-600">Present</div>
          <div class="text-lg font-bold text-emerald-700">${st.classes_present}</div>
        </div>
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <div class="text-xs text-amber-600">Late</div>
          <div class="text-lg font-bold text-amber-700">${st.classes_late}</div>
        </div>
        <div class="p-3 bg-rose-50 rounded-xl border border-rose-100">
          <div class="text-xs text-rose-600">Absent</div>
          <div class="text-lg font-bold text-rose-700">${st.classes_absent}</div>
        </div>
      </div>

      <div class="space-y-2 mt-4 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div><strong>RFID Card UID:</strong> ${st.rfid}</div>
        <div><strong>QR Verification Token:</strong> ${st.qr_code}</div>
        <div><strong>Email:</strong> ${st.email}</div>
        <div><strong>Contact:</strong> ${st.phone}</div>
      </div>

      <button onclick="generateStudentIndividualPDF(${st.student_id})" class="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center transition-colors">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Download Student Transcript (PDF)
      </button>
    `;
    openModal('student-profile-modal');
  }
};

window.confirmDeleteStudent = function(studentId) {
  if (confirm('Are you sure you want to delete this student and cascade delete all their attendance records from the database?')) {
    const res = window.dbService.deleteStudent(studentId);
    if (res.success) {
      showToast(res.message, 'success');
      refreshAllViews();
    }
  }
};

// ==============================================================================
// 7. CRITICAL DEFAULTERS LIST (< 75% ATTENDANCE)
// ==============================================================================
function initDefaultersList() {
  renderDefaultersTable();

  const exportBtn = document.getElementById('btn-export-defaulters-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportDefaultersToCSV();
    });
  }
}

function renderDefaultersTable() {
  const tbody = document.getElementById('defaulters-table-body');
  if (!tbody) return;

  const defaulters = window.dbService.getDefaulters();
  tbody.innerHTML = defaulters.length === 0 
    ? `<tr><td colspan="6" class="text-center py-6 text-sm text-slate-500">No students are currently below the 75% attendance threshold!</td></tr>`
    : defaulters.map(d => `
      <tr class="hover:bg-rose-50/50 border-b border-rose-100 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-slate-800">${d.roll_number}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${d.full_name}</td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-600">${d.dept_code} (Sem ${d.semester}-${d.section})</td>
        <td class="py-3 px-4 font-mono text-sm">${d.classes_present} / ${d.total_classes}</td>
        <td class="py-3 px-4 font-bold text-rose-600">${d.attendance_percentage}%</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 text-xs font-bold rounded-full badge-defaulter">
            ${d.eligibility_status}
          </span>
        </td>
      </tr>
    `).join('');
}

function exportDefaultersToCSV() {
  const defaulters = window.dbService.getDefaulters();
  if (defaulters.length === 0) {
    showToast('No defaulters to export.', 'info');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Roll Number,Full Name,Department,Semester,Section,Classes Present,Total Classes,Attendance Pct,Status\n';

  defaulters.forEach(d => {
    csvContent += `"${d.roll_number}","${d.full_name}","${d.dept_code}","${d.semester}","${d.section}","${d.classes_present}","${d.total_classes}","${d.attendance_percentage}%","${d.eligibility_status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Defaulter_List_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Defaulter list exported to CSV!', 'success');
}

// ==============================================================================
// 8. COURSES & FACULTY VIEW (WITH FACULTY ADD & DELETE CRUD)
// ==============================================================================
function initCoursesAndFaculty() {
  renderFacultyDirectory();
  renderCoursesCatalog();

  // Add Faculty Form submission
  const addFacultyForm = document.getElementById('add-faculty-form');
  if (addFacultyForm) {
    addFacultyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const facultyData = {
        employee_code: document.getElementById('new-fac-code').value.trim(),
        full_name: document.getElementById('new-fac-name').value.trim(),
        email: document.getElementById('new-fac-email').value.trim(),
        phone: document.getElementById('new-fac-phone').value.trim(),
        dept_id: document.getElementById('new-fac-dept').value,
        designation: document.getElementById('new-fac-designation').value
      };

      const res = window.dbService.addFaculty(facultyData);
      if (res.success) {
        showToast(`Faculty ${res.faculty.full_name} (${res.faculty.employee_code}) added to DBMS.`, 'success');
        closeModal('add-faculty-modal');
        addFacultyForm.reset();
        refreshAllViews();
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Add Subject / Course Form submission
  const addCourseForm = document.getElementById('add-course-form');
  if (addCourseForm) {
    addCourseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const courseData = {
        course_code: document.getElementById('new-course-code').value.trim(),
        course_name: document.getElementById('new-course-name').value.trim(),
        dept_id: document.getElementById('new-course-dept').value,
        semester: document.getElementById('new-course-semester').value,
        credits: document.getElementById('new-course-credits').value,
        total_hours: document.getElementById('new-course-hours').value,
        min_attendance: document.getElementById('new-course-min').value
      };

      const res = window.dbService.addCourse(courseData);
      if (res.success) {
        showToast(`Subject ${res.course.course_code}: ${res.course.course_name} added to DBMS.`, 'success');
        closeModal('add-course-modal');
        addCourseForm.reset();
        refreshAllViews();
        initSmartQR();
        initMarkAttendanceGrid();
        initReportsCenter();
      } else {
        showToast(res.message, 'error');
      }
    });
  }
}

function renderFacultyDirectory() {
  const tbody = document.getElementById('faculty-table-body');
  const badgeCount = document.getElementById('faculty-badge-count');
  if (!tbody) return;

  const facultyList = window.dbService.getFaculty();
  if (badgeCount) badgeCount.textContent = facultyList.length;

  tbody.innerHTML = facultyList.length === 0
    ? `<tr><td colspan="6" class="text-center py-6 text-sm text-slate-500">No faculty members found in DBMS. Click 'Add Faculty' to register.</td></tr>`
    : facultyList.map(f => `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-indigo-700">${f.employee_code}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-800">${f.full_name}</div>
          <div class="text-xs text-slate-500">${f.email}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">${f.dept_code}</span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-700">${f.designation}</td>
        <td class="py-3 px-4 font-mono text-xs text-slate-500">${f.phone || '-'}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="confirmDeleteFaculty(${f.faculty_id})" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Faculty Member">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
}

function renderCoursesCatalog() {
  const coursesContainer = document.getElementById('courses-cards-container');
  const badgeCount = document.getElementById('courses-badge-count');
  if (!coursesContainer) return;

  const courses = window.dbService.getCourses();
  if (badgeCount) badgeCount.textContent = courses.length;

  coursesContainer.innerHTML = courses.length === 0
    ? `<div class="col-span-3 text-center py-8 text-slate-500 text-sm">No subjects found in DBMS. Click '+ Add Subject' to create one.</div>`
    : courses.map(c => `
      <div class="glass-panel p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
        <div class="flex justify-between items-start mb-2">
          <span class="px-2.5 py-1 text-xs font-bold font-mono rounded bg-indigo-50 text-indigo-700">${c.course_code}</span>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-slate-500">${c.dept_code} &bull; Sem ${c.semester}</span>
            <button onclick="confirmDeleteCourse(${c.course_id})" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Subject">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <h4 class="font-bold text-slate-800 text-base mb-1">${c.course_name}</h4>
        <div class="text-xs text-slate-500 flex justify-between mt-4 pt-3 border-t border-slate-100">
          <span>Credits: <strong>${c.credits}</strong></span>
          <span>Syllabus: <strong>${c.total_hours} hrs</strong></span>
          <span>Min: <strong>${c.min_attendance}%</strong></span>
        </div>
      </div>
    `).join('');
}

window.confirmDeleteCourse = function(courseId) {
  if (confirm('Are you sure you want to delete this subject/course? Associated lecture sessions and attendance entries will also be removed from the DBMS.')) {
    const res = window.dbService.deleteCourse(courseId);
    if (res.success) {
      showToast(res.message, 'success');
      refreshAllViews();
      initSmartQR();
      initMarkAttendanceGrid();
      initReportsCenter();
    }
  }
};

window.toggleFacultyCourseSubtab = function(tabName) {
  const facContainer = document.getElementById('subtab-faculty-container');
  const crsContainer = document.getElementById('subtab-courses-container');
  const facBtn = document.getElementById('subtab-faculty-btn');
  const crsBtn = document.getElementById('subtab-courses-btn');

  if (tabName === 'faculty') {
    if (facContainer) facContainer.classList.remove('hidden');
    if (crsContainer) crsContainer.classList.add('hidden');
    if (facBtn) {
      facBtn.className = 'px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white transition-colors';
    }
    if (crsBtn) {
      crsBtn.className = 'px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors';
    }
    renderFacultyDirectory();
  } else {
    if (facContainer) facContainer.classList.add('hidden');
    if (crsContainer) crsContainer.classList.remove('hidden');
    if (facBtn) {
      facBtn.className = 'px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors';
    }
    if (crsBtn) {
      crsBtn.className = 'px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white transition-colors';
    }
    renderCoursesCatalog();
  }
};

window.confirmDeleteFaculty = function(facultyId) {
  if (confirm('Are you sure you want to remove this faculty member from the DBMS?')) {
    const res = window.dbService.deleteFaculty(facultyId);
    if (res.success) {
      showToast(res.message, 'success');
      refreshAllViews();
    }
  }
};

// ==============================================================================
// 8.1 OFFICIAL PDF REPORTS GENERATOR (jsPDF & AutoTable Engine)
// ==============================================================================
function initReportsCenter() {
  const select = document.getElementById('report-session-select');
  if (select) {
    const sessions = window.dbService.getSessions();
    select.innerHTML = sessions.map(s => `
      <option value="${s.session_id}">${s.course_code}: ${s.course_name} (${s.session_date})</option>
    `).join('');
  }
}

// 1. Download Full Institutional Attendance Summary (PDF)
window.generateAttendanceSummaryPDF = function() {
  const students = window.dbService.getStudentAttendanceSummary();
  const dateStr = new Date().toLocaleDateString('en-GB');

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header Letterhead
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('UNIVERSITY INSTITUTE OF TECHNOLOGY & SCIENCE', 105, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL ACADEMIC ATTENDANCE & ELIGIBILITY REPORT', 105, 16, { align: 'center' });
    doc.text(`Generated Date: ${dateStr}  |  Academic Term: 2025-2026  |  Minimum Threshold: 75%`, 105, 22, { align: 'center' });

    // Summary statistics boxes
    const totalCount = students.length;
    const defaultersCount = students.filter(s => s.attendance_percentage < 75).length;
    const eligibleCount = totalCount - defaultersCount;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Enrolled: ${totalCount}   |   Exam Eligible: ${eligibleCount}   |   Debarred Defaulters: ${defaultersCount}`, 14, 34);

    // AutoTable
    const tableData = students.map(s => [
      s.roll_number,
      s.full_name,
      s.dept_code,
      `Sem ${s.semester}-${s.section}`,
      `${s.classes_present} / ${s.total_classes}`,
      `${s.attendance_percentage}%`,
      s.eligibility_status
    ]);

    doc.autoTable({
      head: [['Roll Number', 'Student Name', 'Dept', 'Sem-Sec', 'Attended', 'Attendance %', 'University Status']],
      body: tableData,
      startY: 38,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw.includes('DEFAULTER')) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw.includes('CONDONATION')) {
            data.cell.styles.textColor = [217, 119, 6];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Signature Block
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 180) + 25;
    if (finalY < 275) {
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('_________________________', 20, finalY);
      doc.text('Attendance Coordinator', 24, finalY + 5);

      doc.text('_________________________', 90, finalY);
      doc.text('Head of Department (HOD)', 90, finalY + 5);

      doc.text('_________________________', 155, finalY);
      doc.text('Principal / Dean', 162, finalY + 5);
    }

    doc.save(`Attendance_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('Attendance Summary PDF generated and downloaded successfully!', 'success');
  } else {
    window.print();
  }
};

// 2. Download Defaulters Debarment Notice (PDF)
window.generateDefaultersNoticePDF = function() {
  const defaulters = window.dbService.getDefaulters();
  const dateStr = new Date().toLocaleDateString('en-GB');

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Official Warning Banner (Red)
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', 105, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('NOTICE: ATTENDANCE SHORTAGE & SEMESTER DEBARMENT WARNING (< 75%)', 105, 16, { align: 'center' });
    doc.text(`Notice Ref: COE/ATTN-DEF/2026-09  |  Date: ${dateStr}`, 105, 22, { align: 'center' });

    // Warning statement
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text('The following students have failed to secure the mandatory 75% aggregate class attendance.', 14, 34);
    doc.text('Under Academic Regulation Clause 4.2, students marked as DEFAULTER are detained from semester exams.', 14, 39);

    const tableData = defaulters.map(d => [
      d.roll_number,
      d.full_name,
      d.dept_code,
      `Sem ${d.semester}-${d.section}`,
      d.phone || 'N/A',
      `${d.classes_present} / ${d.total_classes}`,
      `${d.attendance_percentage}%`,
      d.eligibility_status
    ]);

    doc.autoTable({
      head: [['Roll No', 'Student Name', 'Dept', 'Sem-Sec', 'Parent Phone', 'Classes', 'Attendance %', 'Action Status']],
      body: tableData,
      startY: 44,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      }
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 180) + 25;
    if (finalY < 275) {
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('_________________________', 25, finalY);
      doc.text('Academic Dean', 35, finalY + 5);

      doc.text('_________________________', 150, finalY);
      doc.text('Controller of Examinations', 145, finalY + 5);
    }

    doc.save(`Defaulter_Notice_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('Official Defaulter Notice PDF downloaded successfully!', 'success');
  } else {
    window.print();
  }
};

// 3. Download Individual Student Transcript (PDF)
window.generateStudentIndividualPDF = function(studentId) {
  const summary = window.dbService.getStudentAttendanceSummary();
  const st = summary.find(s => s.student_id === parseInt(studentId));
  if (!st) return;

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('STUDENT ATTENDANCE TRANSCRIPT & VERIFICATION CARD', 105, 11, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SMART ATTENDANCE MANAGEMENT SYSTEM (DBMS RECORD)', 105, 18, { align: 'center' });

    // Student Info Card Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 32, 182, 34, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(st.full_name, 20, 40);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Roll Number: ${st.roll_number}   |   Registration No: ${st.register_number}`, 20, 46);
    doc.text(`Department: ${st.dept_name} (${st.dept_code})   |   Semester: ${st.semester} (Sec ${st.section})`, 20, 52);
    doc.text(`RFID Card UID: ${st.rfid}   |   QR Token: ${st.qr_code}`, 20, 58);

    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Attendance: ${st.attendance_percentage}%`, 130, 46);
    doc.text(`Eligibility Status: ${st.eligibility_status}`, 130, 52);

    // Records
    const studentRecords = window.dbService.data.attendance.filter(r => r.student_id === st.student_id);
    const sessions = window.dbService.getSessions();
    const tableData = studentRecords.map(r => {
      const sess = sessions.find(s => s.session_id === r.session_id);
      return [
        sess ? sess.session_date : 'N/A',
        sess ? sess.course_code : 'N/A',
        sess ? sess.topic_covered : 'Lecture',
        r.status,
        r.method || 'Manual',
        r.marked_at || '-'
      ];
    });

    doc.autoTable({
      head: [['Session Date', 'Subject Code', 'Topic Covered', 'Status', 'Verification Method', 'Marked At']],
      body: tableData,
      startY: 72,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 8.5
      },
      styles: { fontSize: 8 }
    });

    doc.save(`Student_Attendance_${st.roll_number}.pdf`);
    showToast(`Transcript PDF saved for ${st.roll_number}`, 'success');
  } else {
    window.print();
  }
};

// 4. Download Session Attendance Sheet (PDF)
window.generateCurrentSessionPDF = function() {
  const select = document.getElementById('report-session-select');
  const sessId = select ? select.value : 1;
  const session = window.dbService.data.sessions.find(s => s.session_id === parseInt(sessId)) || window.dbService.data.sessions[0];
  const records = window.dbService.getSessionAttendance(sessId);
  const course = window.dbService.data.courses.find(c => c.course_id === session.course_id);
  const faculty = window.dbService.data.faculty.find(f => f.faculty_id === session.faculty_id);

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFillColor(16, 185, 129); // Emerald-600
    doc.rect(0, 0, 210, 26, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CLASSROOM LECTURE ROLL-CALL ATTENDANCE RECORD', 105, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${course ? course.course_code : ''} - ${course ? course.course_name : ''}  |  Date: ${session.session_date}`, 105, 16, { align: 'center' });
    doc.text(`Instructor: ${faculty ? faculty.full_name : 'Faculty'}  |  Room: ${session.classroom}  |  Time: ${session.start_time} - ${session.end_time}`, 105, 22, { align: 'center' });

    const tableData = records.map(r => [
      r.roll_number,
      r.full_name,
      r.section,
      r.status,
      r.method || 'Manual',
      r.marked_at || '-'
    ]);

    doc.autoTable({
      head: [['Roll Number', 'Student Name', 'Section', 'Status', 'Verification Method', 'Marked Timestamp']],
      body: tableData,
      startY: 32,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontSize: 8.5
      },
      styles: { fontSize: 8 }
    });

    doc.save(`Session_Attendance_${session.session_date}_${session.session_id}.pdf`);
    showToast(`Session Attendance PDF saved!`, 'success');
  } else {
    window.print();
  }
};

// ==============================================================================
// 9. INTERACTIVE SQL CONSOLE (DBMS SHOWCASE FOR VIVA)
// ==============================================================================
function initSQLConsole() {
  const executeBtn = document.getElementById('btn-execute-sql');
  const sqlInput = document.getElementById('sql-query-input');

  if (executeBtn && sqlInput) {
    executeBtn.addEventListener('click', () => {
      runSQLQuery(sqlInput.value.trim());
    });
  }

  // Pre-baked Query Chips
  document.querySelectorAll('.preset-query-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-sql');
      if (sqlInput) sqlInput.value = q;
      runSQLQuery(q);
    });
  });
}

function runSQLQuery(query) {
  if (!query) {
    showToast('Please type a SQL query to execute.', 'warning');
    return;
  }

  const resultContainer = document.getElementById('sql-results-container');
  if (!resultContainer) return;

  const res = window.dbService.executeCustomSQL(query);

  if (res.success) {
    let tableHeaders = res.columns.map(col => `<th class="py-2.5 px-3 font-semibold uppercase text-xs tracking-wider">${col}</th>`).join('');
    let tableRows = res.data.map(row => `
      <tr class="hover:bg-slate-50 border-b border-slate-100">
        ${res.columns.map(col => `<td class="py-2 px-3 text-xs font-mono text-slate-700">${row[col] !== undefined ? row[col] : 'NULL'}</td>`).join('')}
      </tr>
    `).join('');

    resultContainer.innerHTML = `
      <div class="mb-3 flex justify-between items-center text-xs">
        <span class="text-emerald-600 font-semibold flex items-center">
          <svg class="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          Query executed successfully (${res.rowCount} rows returned)
        </span>
        <span class="text-slate-400 font-mono">Execution time: ${res.executionTime}</span>
      </div>
      <div class="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
        <table class="w-full text-left border-collapse bg-white">
          <thead class="bg-slate-800 text-slate-200 sticky top-0">${tableHeaders}</thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  } else {
    resultContainer.innerHTML = `
      <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        <strong>Query Notice:</strong> ${res.message}
      </div>
    `;
  }
}

// ==============================================================================
// 10. AUDIT LOGS
// ==============================================================================
function initAuditLogs() {
  renderAuditLogs();
}

function renderAuditLogs() {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  const logs = window.dbService.getAuditLogs();
  tbody.innerHTML = logs.map(l => `
    <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
      <td class="py-3 px-4 font-mono font-bold text-slate-700">#${l.audit_id}</td>
      <td class="py-3 px-4 font-semibold text-indigo-700">${l.action_type}</td>
      <td class="py-3 px-4 font-medium text-slate-800">${l.student_name}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 line-through mr-1">${l.old_status}</span>
        <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">${l.new_status}</span>
      </td>
      <td class="py-3 px-4 text-slate-600">${l.changed_by}</td>
      <td class="py-3 px-4 font-mono text-slate-400">${l.changed_at}</td>
      <td class="py-3 px-4 text-slate-500">${l.notes || '-'}</td>
    </tr>
  `).join('');
}

// ==============================================================================
// 11. GENERAL UTILITY / MODAL HELPERS & FACTORY RESET
// ==============================================================================
window.openModal = function(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('hidden');
};

window.closeModal = function(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
};

window.handleFactoryReset = function() {
  if (confirm('Reset entire system to initial sample state? Any newly added students or manual changes will be restored to clean defaults.')) {
    window.dbService.resetDatabase();
    showToast('Database reset to clean factory sample state.', 'info');
    refreshAllViews();
  }
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-indigo-600 text-white'
  };

  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all transform duration-300 translate-y-4 opacity-0 ${colors[type] || colors.info}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) document.body.removeChild(toast);
    }, 300);
  }, 3500);
}
