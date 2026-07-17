/* =========================================================
   Scholar — College Student Data Management (vanilla JS)
   Data persists in localStorage.
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "scholar.students.v1";
  const THEME_KEY = "scholar.theme";
  const COURSES = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil Engineering",
    "Business Admin",
    "Mathematics",
    "Physics",
  ];
  const SUBJECTS_BY_COURSE = {
    "Computer Science": ["Data Structures", "Algorithms", "Databases", "Operating Systems"],
    "Electronics": ["Circuits", "Signals", "Microprocessors", "Electromagnetics"],
    "Mechanical": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Dynamics"],
    "Civil Engineering": ["Structures", "Geotechnics", "Surveying", "Hydraulics"],
    "Business Admin": ["Accounting", "Marketing", "Economics", "Management"],
    "Mathematics": ["Calculus", "Linear Algebra", "Statistics", "Topology"],
    "Physics": ["Mechanics", "Quantum", "Optics", "Thermal Physics"],
  };
  const PAGE_SIZE = 8;

  /* ---------- State ---------- */
  let students = [];
  let currentPage = 1;
  let pendingDeleteId = null;

  /* ---------- Utilities ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const initials = (name) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const yearLabel = (y) => ({ 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" }[y] || y + " Year");

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  /* ---------- Seed sample data ---------- */
  function seed() {
    const firstNames = ["Aarav", "Diya", "Rohan", "Ananya", "Vikram", "Priya", "Karan", "Meera", "Arjun", "Sara", "Ishaan", "Neha", "Rahul", "Tara", "Dev", "Kavya", "Aditya", "Riya", "Nikhil", "Pooja", "Sameer", "Anjali", "Varun", "Isha"];
    const lastNames = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Gupta", "Singh", "Mehta", "Rao", "Das", "Kapoor", "Menon", "Joshi", "Bose"];
    const arr = [];
    for (let i = 0; i < 24; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fn} ${ln}`;
      const course = COURSES[Math.floor(Math.random() * COURSES.length)];
      const year = 1 + Math.floor(Math.random() * 4);
      const prefix = course.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
      const gpa = +(5 + Math.random() * 5).toFixed(2);
      const grades = SUBJECTS_BY_COURSE[course].map((s) => ({
        subject: s,
        marks: 45 + Math.floor(Math.random() * 55),
      }));
      arr.push({
        id: uid(),
        rollNo: `${prefix}${2021 + (4 - year)}-${String(i + 1).padStart(3, "0")}`,
        name,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@college.edu`,
        phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
        course,
        year,
        gpa,
        attendance: 60 + Math.floor(Math.random() * 40),
        gender: Math.random() > 0.5 ? "Male" : "Female",
        dob: `20${String(2 + Math.floor(Math.random() * 4)).padStart(2, "0")}-0${1 + Math.floor(Math.random() * 8)}-1${Math.floor(Math.random() * 9)}`,
        guardian: `${lastNames[Math.floor(Math.random() * lastNames.length)]} family`,
        address: `${Math.floor(Math.random() * 200)} Campus Road, City`,
        grades,
      });
    }
    return arr;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        students = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.log("[v0] load error", e.message);
    }
    students = seed();
    saveData();
  }

  /* ---------- Navigation ---------- */
  function switchView(name) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    const view = $("#view-" + name);
    if (view) view.classList.add("active");
    $$(".nav-link").forEach((l) => l.classList.toggle("active", l.dataset.view === name));
    if (name === "dashboard") renderDashboard();
    if (name === "students") renderTable();
    closeSidebar();
    window.scrollTo({ top: 0 });
  }

  /* ---------- Dashboard ---------- */
  function renderStats() {
    const total = students.length;
    const avgGpa = total ? (students.reduce((s, x) => s + Number(x.gpa || 0), 0) / total).toFixed(2) : "0.00";
    const avgAtt = total ? Math.round(students.reduce((s, x) => s + Number(x.attendance || 0), 0) / total) : 0;
    const courseCount = new Set(students.map((s) => s.course)).size;

    const cards = [
      { label: "Total Students", value: total, cls: "", icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
      { label: "Average GPA", value: avgGpa, cls: "green", icon: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>' },
      { label: "Avg Attendance", value: avgAtt + "%", cls: "amber", icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
      { label: "Courses", value: courseCount, cls: "cyan", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
    ];
    $("#statsGrid").innerHTML = cards.map((c) => `
      <div class="stat">
        <div class="stat-top">
          <span class="stat-label">${c.label}</span>
          <span class="stat-ico ${c.cls}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">${c.icon}</svg></span>
        </div>
        <span class="stat-value">${c.value}</span>
      </div>`).join("");
  }

  function renderDashboard() {
    renderStats();
    // Students per course
    const byCourse = COURSES.map((c) => ({
      label: c,
      value: students.filter((s) => s.course === c).length,
    })).filter((d) => d.value > 0);
    barChart($("#courseChart"), byCourse, getVar("--primary"));

    // GPA distribution
    const buckets = [
      { label: "<6", value: students.filter((s) => s.gpa < 6).length },
      { label: "6–7", value: students.filter((s) => s.gpa >= 6 && s.gpa < 7).length },
      { label: "7–8", value: students.filter((s) => s.gpa >= 7 && s.gpa < 8).length },
      { label: "8–9", value: students.filter((s) => s.gpa >= 8 && s.gpa < 9).length },
      { label: "9–10", value: students.filter((s) => s.gpa >= 9).length },
    ];
    barChart($("#gpaChart"), buckets, getVar("--success"));

    // By year (donut)
    const byYear = [1, 2, 3, 4].map((y) => ({
      label: yearLabel(y),
      value: students.filter((s) => Number(s.year) === y).length,
    }));
    donutChart($("#yearChart"), byYear);

    // Avg attendance by course
    const attByCourse = byCourse.map((c) => {
      const list = students.filter((s) => s.course === c.label);
      const avg = list.length ? Math.round(list.reduce((a, s) => a + Number(s.attendance || 0), 0) / list.length) : 0;
      return { label: c.label, value: avg };
    });
    barChart($("#attChart"), attByCourse, getVar("--accent"), 100, "%");
  }

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#1d4ed8";
  }

  /* ---------- Canvas charts ---------- */
  function setupCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || canvas.parentElement.clientWidth - 28;
    const cssH = Number(canvas.getAttribute("height")) || 240;
    canvas.width = cssW * ratio;
    canvas.height = cssH * ratio;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    return { ctx, w: cssW, h: cssH };
  }

  function barChart(canvas, data, color, maxOverride, suffix) {
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const textCol = getVar("--muted");
    const pad = { l: 34, r: 12, t: 12, b: 46 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const max = maxOverride || Math.max(1, ...data.map((d) => d.value));
    const n = data.length || 1;
    const bw = (chartW / n) * 0.58;
    const gap = (chartW / n) * 0.42;

    // gridlines
    ctx.strokeStyle = getVar("--border");
    ctx.lineWidth = 1;
    ctx.fillStyle = textCol;
    ctx.font = "11px Inter, sans-serif";
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + chartH - (chartH * i) / 4;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(Math.round((max * i) / 4), pad.l - 6, y);
    }

    data.forEach((d, i) => {
      const x = pad.l + gap / 2 + i * (bw + gap);
      const bh = (d.value / max) * chartH;
      const y = pad.t + chartH - bh;
      const r = 5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + bh);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + bw - r, y);
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
      ctx.lineTo(x + bw, y + bh);
      ctx.closePath();
      ctx.fill();
      // value
      ctx.fillStyle = getVar("--text");
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      if (d.value > 0) ctx.fillText(d.value + (suffix || ""), x + bw / 2, y - 3);
      // label
      ctx.fillStyle = textCol;
      ctx.font = "10px Inter, sans-serif";
      ctx.save();
      ctx.translate(x + bw / 2, h - pad.b + 8);
      const short = d.label.length > 12 ? d.label.slice(0, 11) + "…" : d.label;
      const rotate = data.length > 4;
      if (rotate) { ctx.rotate(-Math.PI / 5); ctx.textAlign = "right"; }
      else { ctx.textAlign = "center"; }
      ctx.textBaseline = "top";
      ctx.fillText(short, 0, 0);
      ctx.restore();
    });
  }

  function donutChart(canvas, data) {
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = w * 0.34, cy = h / 2, rOuter = Math.min(w * 0.3, h * 0.4), rInner = rOuter * 0.6;
    const palette = [getVar("--primary"), getVar("--accent"), getVar("--success"), getVar("--warn")];
    let start = -Math.PI / 2;
    data.forEach((d, i) => {
      const slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rOuter, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      start += slice;
    });
    // inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = getVar("--surface");
    ctx.fill();
    ctx.fillStyle = getVar("--text");
    ctx.font = "700 20px Sora, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = getVar("--muted");
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("students", cx, cy + 12);
    // legend
    const lx = w * 0.66;
    let ly = cy - data.length * 12;
    ctx.textAlign = "left";
    data.forEach((d, i) => {
      ctx.fillStyle = palette[i % palette.length];
      ctx.fillRect(lx, ly, 12, 12);
      ctx.fillStyle = getVar("--text");
      ctx.font = "12px Inter, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(`${d.label} (${d.value})`, lx + 18, ly + 6);
      ly += 24;
    });
  }

  /* ---------- Students table ---------- */
  function getFiltered() {
    const q = $("#searchInput").value.trim().toLowerCase();
    const course = $("#filterCourse").value;
    const year = $("#filterYear").value;
    const sort = $("#sortBy").value;

    let list = students.filter((s) => {
      const matchesQ = !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesCourse = !course || s.course === course;
      const matchesYear = !year || String(s.year) === year;
      return matchesQ && matchesCourse && matchesYear;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "rollNo": return a.rollNo.localeCompare(b.rollNo);
        case "gpa-desc": return b.gpa - a.gpa;
        case "gpa-asc": return a.gpa - b.gpa;
        case "attendance-desc": return b.attendance - a.attendance;
        default: return a.name.localeCompare(b.name);
      }
    });
    return list;
  }

  function gpaClass(g) { return g >= 8 ? "good" : g >= 6 ? "mid" : "low"; }
  function attClass(a) { return a >= 75 ? "" : a >= 60 ? "mid" : "low"; }

  function renderTable() {
    const list = getFiltered();
    $("#studentCount").textContent = students.length;
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const body = $("#studentTableBody");
    const empty = $("#emptyState");
    if (list.length === 0) {
      body.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = pageItems.map((s) => `
        <tr>
          <td><span class="badge">${esc(s.rollNo)}</span></td>
          <td>
            <div class="cell-name">
              <span class="avatar">${esc(initials(s.name))}</span>
              <div>
                <div>${esc(s.name)}</div>
                <div class="sub">${esc(s.email)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge course">${esc(s.course)}</span></td>
          <td>${esc(yearLabel(s.year))}</td>
          <td><span class="gpa-pill ${gpaClass(s.gpa)}">${Number(s.gpa).toFixed(2)}</span></td>
          <td>
            <div class="att-bar">
              <span class="att-track"><span class="att-fill ${attClass(s.attendance)}" style="width:${s.attendance}%"></span></span>
              <span>${s.attendance}%</span>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <button class="act" data-act="view" data-id="${s.id}" title="View / ID card" aria-label="View ${esc(s.name)}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="act" data-act="edit" data-id="${s.id}" title="Edit" aria-label="Edit ${esc(s.name)}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="act danger" data-act="delete" data-id="${s.id}" title="Delete" aria-label="Delete ${esc(s.name)}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>`).join("");
    }
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const el = $("#pagination");
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    let html = `<button class="page-btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>›</button>`;
    el.innerHTML = html;
  }

  /* ---------- Form (add / edit) ---------- */
  function populateCourseSelects() {
    const opts = COURSES.map((c) => `<option value="${c}">${c}</option>`).join("");
    $("#f-course").innerHTML = opts;
    $("#filterCourse").innerHTML = `<option value="">All Courses</option>` + opts;
  }

  function addGradeRow(subject = "", marks = "") {
    const row = document.createElement("div");
    row.className = "grade-row";
    row.innerHTML = `
      <input type="text" class="grade-subject" placeholder="Subject" value="${esc(subject)}" />
      <input type="number" class="grade-marks" placeholder="Marks" min="0" max="100" value="${esc(marks)}" />
      <button type="button" class="grade-del" aria-label="Remove subject">&times;</button>`;
    row.querySelector(".grade-del").addEventListener("click", () => row.remove());
    $("#gradesRows").appendChild(row);
  }

  function openForm(id) {
    const form = $("#studentForm");
    form.reset();
    $$(".err").forEach((e) => (e.textContent = ""));
    $$(".field input").forEach((i) => i.classList.remove("invalid"));
    $("#gradesRows").innerHTML = "";

    if (id) {
      const s = students.find((x) => x.id === id);
      if (!s) return;
      $("#formTitle").textContent = "Edit Student";
      $("#studentId").value = s.id;
      $("#f-name").value = s.name;
      $("#f-roll").value = s.rollNo;
      $("#f-email").value = s.email;
      $("#f-phone").value = s.phone || "";
      $("#f-course").value = s.course;
      $("#f-year").value = s.year;
      $("#f-gender").value = s.gender || "";
      $("#f-dob").value = s.dob || "";
      $("#f-gpa").value = s.gpa;
      $("#f-att").value = s.attendance;
      $("#f-guardian").value = s.guardian || "";
      $("#f-address").value = s.address || "";
      (s.grades || []).forEach((g) => addGradeRow(g.subject, g.marks));
    } else {
      $("#formTitle").textContent = "Add Student";
      $("#studentId").value = "";
      addGradeRow();
    }
    switchView("add");
  }

  function validateForm(data) {
    const errors = {};
    if (!data.name) errors.name = "Name is required.";
    if (!data.rollNo) errors.rollNo = "Roll number is required.";
    else if (students.some((s) => s.rollNo.toLowerCase() === data.rollNo.toLowerCase() && s.id !== data.id))
      errors.rollNo = "This roll number already exists.";
    if (!data.email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email.";
    if (data.phone && !/^[\d+\-\s()]{7,}$/.test(data.phone)) errors.phone = "Enter a valid phone number.";
    if (data.gpa === "" || isNaN(data.gpa) || data.gpa < 0 || data.gpa > 10) errors.gpa = "GPA must be 0–10.";
    if (data.attendance === "" || isNaN(data.attendance) || data.attendance < 0 || data.attendance > 100)
      errors.attendance = "Attendance must be 0–100.";
    return errors;
  }

  function showErrors(errors) {
    $$(".err").forEach((e) => (e.textContent = ""));
    $$(".field input, .field select").forEach((i) => i.classList.remove("invalid"));
    Object.entries(errors).forEach(([key, msg]) => {
      const el = $(`.err[data-for="${key}"]`);
      if (el) el.textContent = msg;
      const input = $(`#studentForm [name="${key}"]`);
      if (input) input.classList.add("invalid");
    });
  }

  function submitForm(e) {
    e.preventDefault();
    const grades = $$(".grade-row").map((row) => ({
      subject: row.querySelector(".grade-subject").value.trim(),
      marks: Number(row.querySelector(".grade-marks").value) || 0,
    })).filter((g) => g.subject);

    const data = {
      id: $("#studentId").value || null,
      name: $("#f-name").value.trim(),
      rollNo: $("#f-roll").value.trim(),
      email: $("#f-email").value.trim(),
      phone: $("#f-phone").value.trim(),
      course: $("#f-course").value,
      year: Number($("#f-year").value),
      gender: $("#f-gender").value,
      dob: $("#f-dob").value,
      gpa: $("#f-gpa").value === "" ? "" : Number($("#f-gpa").value),
      attendance: $("#f-att").value === "" ? "" : Number($("#f-att").value),
      guardian: $("#f-guardian").value.trim(),
      address: $("#f-address").value.trim(),
      grades,
    };

    const errors = validateForm(data);
    if (Object.keys(errors).length) { showErrors(errors); return; }

    if (data.id) {
      const idx = students.findIndex((s) => s.id === data.id);
      students[idx] = { ...students[idx], ...data };
      toast("Student updated");
    } else {
      data.id = uid();
      students.unshift(data);
      toast("Student added");
    }
    saveData();
    switchView("students");
  }

  /* ---------- Detail / ID card ---------- */
  function openDetail(id) {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    const gradeRows = (s.grades || []).length
      ? s.grades.map((g) => `<tr><td>${esc(g.subject)}</td><td>${g.marks}</td><td>${grade(g.marks)}</td></tr>`).join("")
      : `<tr><td colspan="3" class="muted">No grades recorded.</td></tr>`;

    $("#detailContent").innerHTML = `
      <div class="id-card">
        <div class="id-head">
          <span class="id-avatar">${esc(initials(s.name))}</span>
          <div>
            <div class="id-college">Scholar College</div>
            <h2 id="detailName">${esc(s.name)}</h2>
            <div>${esc(s.rollNo)}</div>
          </div>
        </div>
        <div class="id-body">
          <div class="id-item"><div class="k">Course</div><div class="v">${esc(s.course)}</div></div>
          <div class="id-item"><div class="k">Year</div><div class="v">${esc(yearLabel(s.year))}</div></div>
          <div class="id-item"><div class="k">Email</div><div class="v">${esc(s.email)}</div></div>
          <div class="id-item"><div class="k">Phone</div><div class="v">${esc(s.phone || "—")}</div></div>
          <div class="id-item"><div class="k">GPA</div><div class="v">${Number(s.gpa).toFixed(2)} / 10</div></div>
          <div class="id-item"><div class="k">Attendance</div><div class="v">${s.attendance}%</div></div>
          <div class="id-item"><div class="k">Gender</div><div class="v">${esc(s.gender || "—")}</div></div>
          <div class="id-item"><div class="k">Date of Birth</div><div class="v">${esc(s.dob || "—")}</div></div>
          <div class="id-item"><div class="k">Guardian</div><div class="v">${esc(s.guardian || "—")}</div></div>
          <div class="id-item"><div class="k">Address</div><div class="v">${esc(s.address || "—")}</div></div>
        </div>
      </div>
      <div class="detail-section">
        <h4>Subject Grades</h4>
        <table class="grade-table">
          <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
          <tbody>${gradeRows}</tbody>
        </table>
      </div>
      <div class="detail-actions">
        <button class="btn btn-outline" id="printCard">Print ID Card</button>
        <button class="btn btn-primary" data-act="edit" data-id="${s.id}">Edit</button>
      </div>`;
    openModal("#detailModal");
    $("#printCard").addEventListener("click", () => window.print());
  }

  function grade(m) {
    if (m >= 90) return "A+";
    if (m >= 80) return "A";
    if (m >= 70) return "B";
    if (m >= 60) return "C";
    if (m >= 50) return "D";
    return "F";
  }

  /* ---------- CSV ---------- */
  function exportCSV() {
    const headers = ["rollNo", "name", "email", "phone", "course", "year", "gpa", "attendance", "gender", "dob", "guardian", "address"];
    const rows = students.map((s) => headers.map((h) => {
      const val = s[h] == null ? "" : String(s[h]);
      return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported " + students.length + " records");
  }

  function parseCSV(text) {
    const rows = [];
    let field = "", row = [], inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ",") { row.push(field); field = ""; }
        else if (c === "\n" || c === "\r") {
          if (c === "\r" && text[i + 1] === "\n") i++;
          row.push(field); rows.push(row); row = []; field = "";
        } else field += c;
      }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim() !== ""));
  }

  function importCSV(file) {
    const status = $("#importStatus");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCSV(reader.result);
        if (rows.length < 2) throw new Error("File has no data rows.");
        const headers = rows[0].map((h) => h.trim());
        let added = 0;
        for (let i = 1; i < rows.length; i++) {
          const obj = {};
          headers.forEach((h, j) => (obj[h] = (rows[i][j] || "").trim()));
          if (!obj.name || !obj.rollNo) continue;
          if (students.some((s) => s.rollNo.toLowerCase() === obj.rollNo.toLowerCase())) continue;
          students.unshift({
            id: uid(),
            rollNo: obj.rollNo,
            name: obj.name,
            email: obj.email || "",
            phone: obj.phone || "",
            course: COURSES.includes(obj.course) ? obj.course : COURSES[0],
            year: Number(obj.year) || 1,
            gpa: Math.min(10, Math.max(0, Number(obj.gpa) || 0)),
            attendance: Math.min(100, Math.max(0, Number(obj.attendance) || 0)),
            gender: obj.gender || "",
            dob: obj.dob || "",
            guardian: obj.guardian || "",
            address: obj.address || "",
            grades: [],
          });
          added++;
        }
        saveData();
        status.classList.remove("error");
        status.textContent = `Imported ${added} new student(s).`;
        toast(`Imported ${added} records`);
      } catch (err) {
        status.classList.add("error");
        status.textContent = "Import failed: " + err.message;
      }
    };
    reader.readAsText(file);
  }

  /* ---------- Modal helpers ---------- */
  function openModal(sel) { $(sel).hidden = false; document.body.style.overflow = "hidden"; }
  function closeModals() {
    $$(".modal").forEach((m) => (m.hidden = true));
    document.body.style.overflow = "";
  }

  /* ---------- Sidebar (mobile) ---------- */
  function openSidebar() { $("#sidebar").classList.add("open"); $("#overlay").classList.add("show"); }
  function closeSidebar() { $("#sidebar").classList.remove("open"); $("#overlay").classList.remove("show"); }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const sun = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>';
    const moon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const icon = theme === "dark" ? sun : moon;
    $(".theme-icon").innerHTML = icon;
    $("#themeToggleMobile").innerHTML = icon;
    if ($("#view-dashboard").classList.contains("active")) renderDashboard();
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => (t.hidden = true), 250);
    }, 2200);
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    // navigation
    document.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-view]");
      if (nav) { switchView(nav.dataset.view); if (nav.dataset.view === "add") openForm(null); }
    });

    // table actions
    $("#studentTableBody").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.act === "view") openDetail(id);
      if (btn.dataset.act === "edit") openForm(id);
      if (btn.dataset.act === "delete") { pendingDeleteId = id; openModal("#confirmModal"); }
    });

    // detail modal edit button
    $("#detailContent").addEventListener("click", (e) => {
      const btn = e.target.closest('[data-act="edit"]');
      if (btn) { closeModals(); openForm(btn.dataset.id); }
    });

    // filters
    ["searchInput", "filterCourse", "filterYear", "sortBy"].forEach((id) => {
      $("#" + id).addEventListener("input", () => { currentPage = 1; renderTable(); });
    });

    // pagination
    $("#pagination").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;
      const p = btn.dataset.page;
      const totalPages = Math.max(1, Math.ceil(getFiltered().length / PAGE_SIZE));
      if (p === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (p === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = Number(p);
      renderTable();
    });

    // form
    $("#studentForm").addEventListener("submit", submitForm);
    $("#cancelForm").addEventListener("click", () => switchView("students"));
    $("#addGradeRow").addEventListener("click", () => addGradeRow());

    // confirm delete
    $("#confirmDeleteBtn").addEventListener("click", () => {
      students = students.filter((s) => s.id !== pendingDeleteId);
      saveData();
      closeModals();
      renderTable();
      toast("Student deleted");
    });

    // modal close
    document.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModals(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModals(); closeSidebar(); } });

    // data import/export
    $("#exportBtn").addEventListener("click", exportCSV);
    $("#importBtn").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", (e) => { if (e.target.files[0]) importCSV(e.target.files[0]); e.target.value = ""; });

    // theme
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#themeToggleMobile").addEventListener("click", toggleTheme);

    // sidebar
    $("#sidebarToggle").addEventListener("click", openSidebar);
    $("#overlay").addEventListener("click", closeSidebar);

    // reset
    $("#resetData").addEventListener("click", () => {
      if (confirm("Reset all data back to the sample students? This clears your changes.")) {
        students = seed();
        saveData();
        switchView("dashboard");
        toast("Sample data restored");
      }
    });

    // redraw charts on resize
    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => { if ($("#view-dashboard").classList.contains("active")) renderDashboard(); }, 200);
    });
  }

  /* ---------- Init ---------- */
  function init() {
    loadData();
    populateCourseSelects();
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    bindEvents();
    renderDashboard();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
