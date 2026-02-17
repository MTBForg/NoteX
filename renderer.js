// ─── State ────────────────────────────────────────────────────────────────────
let notes       = [];
let allNotes    = [];
let password    = "";
let editingId   = null;
let remInterval = null;

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = [
  "#dceefb","#d4edda","#e8d5f5","#fce8cc",
  "#ffd6d6","#d5f0e8","#fdf3d0","#dde4f0",
];

const ICONS = [
  "","fa-note-sticky","fa-lightbulb","fa-star","fa-heart",
  "fa-bookmark","fa-flag","fa-calendar","fa-clock","fa-bell",
  "fa-shopping-cart","fa-gift","fa-home","fa-briefcase",
  "fa-graduation-cap","fa-book","fa-music","fa-film","fa-camera",
  "fa-plane","fa-car","fa-car-side","fa-truck","fa-bicycle",
  "fa-motorcycle","fa-bus","fa-train","fa-coffee","fa-utensils",
  "fa-pizza-slice","fa-dumbbell","fa-gamepad",
];

// ─── Util ─────────────────────────────────────────────────────────────────────
const esc = t => { const d = document.createElement("div"); d.textContent = t||""; return d.innerHTML; };
const loggedIn = () => password !== "";

// ─── Save ─────────────────────────────────────────────────────────────────────
window.save = function() {
  if (!loggedIn()) { console.warn("save() skipped – not logged in"); return; }
  try {
    window.noteAPI.saveNotes(allNotes, password);
  } catch(e) { console.error("Save failed:", e); }
};

// ─── Render ───────────────────────────────────────────────────────────────────
window.render = function() {
  const grid  = document.getElementById("notesGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("noteCount");
  if (!grid) return;
  grid.innerHTML = "";

  const sorted = [...notes].sort((a,b) => b.pinned - a.pinned);

  if (count) count.textContent = sorted.length === 1 ? "1 note" : `${sorted.length} notes`;
  if (empty) empty.style.display = sorted.length ? "none" : "flex";
  grid.style.display = sorted.length ? "grid" : "none";

  sorted.forEach(note => {
    const card = document.createElement("div");
    card.className = "note";
    card.style.background = note.color || COLORS[0];

    const pinHtml = note.pinned
      ? `<i class="fa-solid fa-thumbtack" style="color:rgba(0,0,0,.5)"></i>`
      : `<i class="fa-solid fa-thumbtack" style="opacity:.18;transform:rotate(45deg);display:inline-block"></i>`;

    const iconHtml = note.icon
      ? `<div class="note-icon-lbl"><i class="fa-solid ${note.icon}"></i></div>` : "";

    let badge = "";
    if (note.reminder?.date) {
      const d = new Date(note.reminder.date), now = new Date(), diff = d - now;
      const cls = diff < 0 ? "badge-past" : d.toDateString()===now.toDateString() ? "badge-today" : "badge-future";
      const lbl = diff < 0 ? "Overdue"
        : diff < 3600000  ? `${Math.ceil(diff/60000)}m`
        : diff < 86400000 ? `${Math.ceil(diff/3600000)}h`
        : `${Math.ceil(diff/86400000)}d`;
      badge = `<div class="note-badge ${cls}"><i class="fa-solid fa-bell"></i> ${lbl}</div>`;
    }

    card.innerHTML = `
      <div class="note-pin" onclick="event.stopPropagation();window.togglePin('${note.id}')">${pinHtml}</div>
      ${iconHtml}
      <div class="note-title">${esc(note.title)}</div>
      <div class="note-body">${esc(note.content)}</div>
      ${badge}
      <div class="note-actions">
        <button onclick="event.stopPropagation();window.openEditModal('${note.id}')"><i class="fa-solid fa-pen"></i></button>
        <button onclick="event.stopPropagation();window.duplicateNote('${note.id}')"><i class="fa-solid fa-copy"></i></button>
        <button class="del-btn" onclick="event.stopPropagation();window.deleteNote('${note.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>`;

    card.onclick = () => window.openEditModal(note.id);
    grid.appendChild(card);
  });
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────
window.addNote = function() {
  if (!loggedIn()) return;
  const note = {
    id: window.noteAPI.uuid(), title: "New Note", content: "",
    color: COLORS[Math.floor(Math.random()*COLORS.length)],
    pinned: false, icon: "", reminder: null,
  };
  allNotes.push(note);
  notes = [...allNotes];
  window.save();
  window.render();
  window.openEditModal(note.id);
};

window.openEditModal = function(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  editingId = id;

  document.getElementById("noteTitle").value   = note.title;
  document.getElementById("noteContent").value = note.content;

  const ri = document.getElementById("noteReminder");
  if (note.reminder?.date) {
    const d = new Date(note.reminder.date);
    ri.value = new Date(d - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  } else { ri.value = ""; }

  // Icons
  const ic = document.getElementById("iconSelector");
  ic.innerHTML = "";
  ICONS.forEach(icon => {
    const d = document.createElement("div");
    d.className = "icon-opt" + (icon === note.icon ? " on" : "");
    d.innerHTML = icon ? `<i class="fa-solid ${icon}"></i>` : `<i class="fa-solid fa-ban" style="opacity:.2"></i>`;
    d.onclick = () => { document.querySelectorAll(".icon-opt").forEach(x=>x.classList.remove("on")); d.classList.add("on"); };
    ic.appendChild(d);
  });

  // Colors
  const cc = document.getElementById("colorSelector");
  cc.innerHTML = "";
  COLORS.forEach(color => {
    const d = document.createElement("div");
    d.className = "color-opt" + (color === note.color ? " on" : "");
    d.style.background = color;
    d.onclick = () => { document.querySelectorAll(".color-opt").forEach(x=>x.classList.remove("on")); d.classList.add("on"); };
    cc.appendChild(d);
  });

  document.getElementById("editModal").classList.add("active");
};

window.saveNoteFromModal = function() {
  const note = allNotes.find(n => n.id === editingId);
  if (!note) return;

  note.title   = document.getElementById("noteTitle").value || "Untitled";
  note.content = document.getElementById("noteContent").value;

  const rv = document.getElementById("noteReminder").value;
  note.reminder = rv ? { date: new Date(rv).toISOString(), notified: new Date(rv) <= new Date() } : null;

  const si = document.querySelector(".icon-opt.on i");
  note.icon = si && !si.classList.contains("fa-ban")
    ? [...si.classList].find(c => c.startsWith("fa-") && c !== "fa-solid") || "" : "";

  const sc = document.querySelector(".color-opt.on");
  if (sc) note.color = sc.style.background;

  window.save();
  window.render();
  window.closeModal();
};

window.clearReminder  = () => { document.getElementById("noteReminder").value = ""; };
window.closeModal     = () => { document.getElementById("editModal").classList.remove("active"); editingId = null; };

let pendingDeleteId = null;

window.deleteNote = function(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  pendingDeleteId = id;
  const nameEl = document.getElementById("deleteNoteName");
  if (nameEl) nameEl.textContent = `"${note.title}"`;
  const btn = document.getElementById("deleteConfirmBtn");
  if (btn) btn.onclick = window.confirmDelete;
  document.getElementById("deleteModal").classList.add("active");
};

window.confirmDelete = function() {
  if (!pendingDeleteId) return;
  allNotes = allNotes.filter(n => n.id !== pendingDeleteId);
  notes    = notes.filter(n => n.id !== pendingDeleteId);
  pendingDeleteId = null;
  window.closeDeleteModal();
  window.closeModal();
  window.save(); window.render();
};

window.closeDeleteModal = function() {
  document.getElementById("deleteModal").classList.remove("active");
  pendingDeleteId = null;
};

window.deleteNoteFromModal = function() { window.deleteNote(editingId); };

window.togglePin = function(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  note.pinned = !note.pinned;
  window.save(); window.render();
};

window.duplicateNote = function(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  const copy = { ...note, id: window.noteAPI.uuid(), title: note.title + " (Copy)", pinned: false };
  allNotes.push(copy); notes = [...allNotes];
  window.save(); window.render();
};

// ─── Views ────────────────────────────────────────────────────────────────────
function setNav(id) {
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  const title = document.getElementById("viewTitle");
  if (title) title.textContent = id === "navAll" ? "All Notes" : "Pinned";
}

window.showAll = function() {
  if (!loggedIn()) return;
  try {
    allNotes = window.noteAPI.loadNotes(password);
    notes    = [...allNotes];
  } catch(e) {
    if (e.message === "WRONG_PASSWORD") { window.logout(); return; }
  }
  const box = document.getElementById("searchBox");
  if (box) box.value = "";
  setNav("navAll"); window.render();
};

window.showPinned = function() {
  document.getElementById("searchBox").value = "";
  notes = allNotes.filter(n => n.pinned);
  setNav("navPinned"); window.render();
};

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
  const box = document.getElementById("searchBox");
  if (!box) return;
  box.addEventListener("input", () => {
    const q = box.value.trim().toLowerCase();
    if (!q) {
      notes = [...allNotes];
    } else {
      notes = allNotes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }
    window.render();
  });
}

// ─── Reminders ────────────────────────────────────────────────────────────────
function checkReminders() {
  if (!loggedIn()) return;
  const now = new Date();
  let changed = false;
  allNotes.forEach(note => {
    if (note.reminder?.date && !note.reminder.notified && new Date(note.reminder.date) <= now) {
      showNotif(note); note.reminder.notified = true; changed = true;
    }
  });
  if (changed) window.save();
}

function showNotif(note) {
  const el = document.createElement("div");
  el.className = "notif";
  el.innerHTML = `
    <div class="notif-inner">
      <div class="notif-label">Reminder <button onclick="this.closest('.notif').remove()">&times;</button></div>
      <div class="notif-title">${esc(note.title)}</div>
      <div class="notif-body">${esc(note.content.substring(0,90))}</div>
      <button class="notif-view" onclick="window.openEditModal('${note.id}');this.closest('.notif').remove()">View Note</button>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 10000);
}

// ─── Export / Import ──────────────────────────────────────────────────────────
window.exportNotes = function() {
  if (!loggedIn() || !allNotes.length) { alert("No notes to export."); return; }
  const blob = new Blob([JSON.stringify({ version:"2.0", exportDate: new Date().toISOString(), notes: allNotes }, null, 2)], { type:"application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `notepro-${new Date().toISOString().slice(0,10)}.json` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  alert(`Exported ${allNotes.length} notes.`);
};

window.importNotes = function() {
  if (!loggedIn()) return;
  const fi = document.getElementById("importFileInput");
  fi.click();
  fi.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.notes)) throw new Error("Invalid file");
        const merge = confirm(`Found ${data.notes.length} notes.\nOK = Merge with existing\nCancel = Replace all`);
        if (merge) { data.notes.forEach(n => { n.id = window.noteAPI.uuid(); allNotes.push(n); }); }
        else        { allNotes = data.notes; }
        notes = [...allNotes];
        window.save(); window.render();
        alert(`Imported ${data.notes.length} notes.`);
      } catch(err) { alert("Import failed: " + err.message); }
      fi.value = "";
    };
    r.readAsText(file);
  };
};

// ─── Login / Logout ───────────────────────────────────────────────────────────
window.login = function() {
  const input = document.getElementById("masterPassword");
  const pwd   = input ? input.value : "";

  if (!pwd) { showLoginError("Please enter your password."); return; }

  try {
    const loaded = window.noteAPI.loadNotes(pwd);
    password = pwd;
    notes = loaded || []; allNotes = [...notes];

    document.getElementById("loginScreen")?.remove();
    window.render();
    setNav("navAll");
    initSearch();

    if (remInterval) clearInterval(remInterval);
    remInterval = setInterval(checkReminders, 30000);
    checkReminders();
  } catch(e) {
    const msg = e.message === "WRONG_PASSWORD" ? "Incorrect password. Please try again." : "Login failed. Please try again.";
    showLoginError(msg);
    if (input) { input.value = ""; input.focus(); }
  }
};

window.logout = function() {
  if (loggedIn() && allNotes.length) window.save();
  if (remInterval) { clearInterval(remInterval); remInterval = null; }
  notes = []; allNotes = []; password = ""; editingId = null;
  location.reload();
};

window.unlockVault = window.login;
window.lockVault   = window.logout;

function showLoginError(msg) {
  const el = document.getElementById("loginError");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!window.noteAPI) { console.error("noteAPI missing!"); return; }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { window.closeModal(); window.closeDeleteModal(); } });
  showLogin();
});

function showLogin() {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="login-screen" id="loginScreen">
      <div class="login-panel">
        <div class="login-logo">
          <div class="login-logo-mark"></div>
          <span class="login-logo-name">NoteX</span>
        </div>
        <h2 class="login-headline">Private notes,<br>fully encrypted.</h2>
        <p class="login-desc">Your notes are protected with AES-256 encryption. Only your master password can unlock them.</p>
      </div>
      <div class="login-right">
        <div class="login-card">
          <h1 class="login-card-title">Sign in</h1>
          <p class="login-card-sub">Enter your master password to access your notes.</p>

          <div id="loginError" class="login-error"></div>

          <div class="login-fields">
            <label class="login-label">Master Password</label>
            <input class="login-input" type="password" id="masterPassword" placeholder="Enter your password">
          </div>
          <button class="login-btn" onclick="window.login()">Sign In</button>

          <div class="login-warning">
            <strong>Password cannot be recovered</strong>
            Your password is never stored. If you forget it, your notes are permanently inaccessible — there is no reset option.
          </div>
        </div>
      </div>
    </div>`);

  setTimeout(() => {
    const input = document.getElementById("masterPassword");
    if (input) { input.focus(); input.addEventListener("keypress", e => { if(e.key==="Enter") window.login(); }); }
  }, 50);
}