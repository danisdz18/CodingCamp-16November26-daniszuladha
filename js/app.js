/* ══════════════════════════════════════
   app.js  —  My Start Page
   Features: Greeting · Timer · To-Do · Quick Links
   Challenges: Light/Dark Mode · Custom Name · Prevent Duplicates · Sort Tasks
══════════════════════════════════════ */

"use strict";

/* ─── Helpers ─────────────────────────────── */

function $(id) { return document.getElementById(id); }

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2500);
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ══════════════════════════════════════
   1. THEME  (Light / Dark)
══════════════════════════════════════ */

const themeToggle = $("themeToggle");
let currentTheme = localStorage.getItem("theme") || "light";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
  currentTheme = theme;
}

applyTheme(currentTheme);

themeToggle.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ══════════════════════════════════════
   2. GREETING  (time, date, custom name)
══════════════════════════════════════ */

const clockEl    = $("clock");
const dateEl     = $("date");
const greetingEl = $("greeting");
const nameInput  = $("nameInput");
const saveNameBtn = $("saveName");

let userName = localStorage.getItem("userName") || "";
if (userName) nameInput.value = userName;

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function updateClock() {
  const now = new Date();
  const h   = String(now.getHours()).padStart(2, "0");
  const m   = String(now.getMinutes()).padStart(2, "0");
  const s   = String(now.getSeconds()).padStart(2, "0");

  clockEl.textContent = `${h}:${m}:${s}`;

  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const greeting = getGreeting(now.getHours());
  greetingEl.textContent = userName
    ? `${greeting}, ${userName}! 👋`
    : `${greeting}! 👋`;
}

setInterval(updateClock, 1000);
updateClock();

saveNameBtn.addEventListener("click", () => {
  const val = nameInput.value.trim();
  userName = val;
  localStorage.setItem("userName", val);
  updateClock();
  toast(val ? `Name saved as "${val}"!` : "Name cleared.");
});

nameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") saveNameBtn.click();
});

/* ══════════════════════════════════════
   3. FOCUS TIMER  (custom duration)
══════════════════════════════════════ */

const timerDisplay  = $("timerDisplay");
const startTimerBtn = $("startTimer");
const stopTimerBtn  = $("stopTimer");
const resetTimerBtn = $("resetTimer");
const customMinutes = $("customMinutes");
const applyTimeBtn  = $("applyTime");

let timerDuration = parseInt(localStorage.getItem("timerDuration") || "25", 10);
let timeLeft      = timerDuration * 60;
let timerInterval = null;
let timerRunning  = false;

customMinutes.value = timerDuration;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
}

renderTimer();

applyTimeBtn.addEventListener("click", () => {
  const val = parseInt(customMinutes.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    toast("Enter a number between 1 and 120.");
    return;
  }
  if (timerRunning) {
    toast("Stop the timer before changing the duration.");
    return;
  }
  timerDuration = val;
  timeLeft      = val * 60;
  localStorage.setItem("timerDuration", val);
  renderTimer();
  toast(`Timer set to ${val} minutes.`);
});

startTimerBtn.addEventListener("click", () => {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.textContent = "00:00";
      toast("⏰ Time's up! Great work!");
      return;
    }
    timeLeft--;
    renderTimer();
  }, 1000);
});

stopTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timeLeft = timerDuration * 60;
  renderTimer();
});

/* ══════════════════════════════════════
   4. TO-DO LIST  (add · edit · done · delete · no-dup · sort)
══════════════════════════════════════ */

const taskInput  = $("taskInput");
const addTaskBtn = $("addTask");
const taskList   = $("taskList");
const sortSelect = $("sortSelect");

/* tasks: [ { id, text, done } ] */
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getSortedTasks() {
  const copy = [...tasks];
  const mode = sortSelect.value;
  if (mode === "az")   return copy.sort((a, b) => a.text.localeCompare(b.text));
  if (mode === "za")   return copy.sort((a, b) => b.text.localeCompare(a.text));
  if (mode === "done") return copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy;
}

function renderTasks() {
  taskList.innerHTML = "";
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    const empty = document.createElement("li");
    empty.style.cssText = "color:var(--text-muted);font-size:.875rem;padding:8px 0;text-align:center;";
    empty.textContent = "No tasks yet. Add one above!";
    taskList.appendChild(empty);
    return;
  }

  sorted.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="task-check" ${task.done ? "checked" : ""} title="Mark done" />
      <span class="task-label">${escHtml(task.text)}</span>
      <div class="task-actions">
        <button class="task-btn edit">Edit</button>
        <button class="task-btn del">Delete</button>
      </div>
    `;

    li.querySelector(".task-check").addEventListener("change", e => {
      const t = tasks.find(t => t.id === task.id);
      if (t) { t.done = e.target.checked; saveTasks(); renderTasks(); }
    });

    li.querySelector(".task-btn.edit").addEventListener("click", () => {
      startEdit(li, task);
    });

    li.querySelector(".task-btn.del").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

function startEdit(li, task) {
  const label = li.querySelector(".task-label");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task-edit-input";
  editInput.value = task.text;
  editInput.maxLength = 100;
  label.replaceWith(editInput);

  const editBtn = li.querySelector(".task-btn.edit");
  editBtn.textContent = "Save";

  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) { toast("Task cannot be empty."); return; }

    const dup = tasks.find(t => t.id !== task.id &&
      t.text.toLowerCase() === newText.toLowerCase());
    if (dup) { toast("A task with that name already exists."); return; }

    task.text = newText;
    saveTasks();
    renderTasks();
  }

  editBtn.onclick = commitEdit;
  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter")  commitEdit();
    if (e.key === "Escape") renderTasks();
  });
  editInput.focus();
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) { toast("Please type a task first."); return; }

  /* Challenge: Prevent duplicate tasks */
  const dup = tasks.find(t => t.text.toLowerCase() === text.toLowerCase());
  if (dup) { toast("That task already exists!"); return; }

  tasks.push({ id: Date.now().toString(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
sortSelect.addEventListener("change", renderTasks);

renderTasks();

/* ══════════════════════════════════════
   5. QUICK LINKS
══════════════════════════════════════ */

const linkNameInput = $("linkName");
const linkUrlInput  = $("linkUrl");
const addLinkBtn    = $("addLink");
const linkGrid      = $("linkGrid");

/* links: [ { id, name, url } ] */
let links = JSON.parse(localStorage.getItem("quickLinks") || "[]");

if (links.length === 0) {
  links = [
    { id: "1", name: "Google",  url: "https://google.com" },
    { id: "2", name: "YouTube", url: "https://youtube.com" },
    { id: "3", name: "GitHub",  url: "https://github.com" },
  ];
  localStorage.setItem("quickLinks", JSON.stringify(links));
}

function saveLinks() {
  localStorage.setItem("quickLinks", JSON.stringify(links));
}

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch { return ""; }
}

function renderLinks() {
  linkGrid.innerHTML = "";
  links.forEach(link => {
    const chip = document.createElement("a");
    chip.href      = link.url;
    chip.target    = "_blank";
    chip.rel       = "noopener noreferrer";
    chip.className = "link-chip";

    const icon = getFavicon(link.url);
    chip.innerHTML = `
      ${icon ? `<img src="${icon}" alt="" width="16" height="16" style="border-radius:3px;flex-shrink:0;" onerror="this.remove()">` : ""}
      ${escHtml(link.name)}
      <button class="link-del" title="Remove link">✕</button>
    `;

    chip.querySelector(".link-del").addEventListener("click", e => {
      e.preventDefault();
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    linkGrid.appendChild(chip);
  });
}

addLinkBtn.addEventListener("click", () => {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  if (!name || !url) { toast("Enter both a label and a URL."); return; }
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  try { new URL(url); } catch { toast("Please enter a valid URL."); return; }

  links.push({ id: Date.now().toString(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = "";
  linkUrlInput.value  = "";
});

linkUrlInput.addEventListener("keydown", e => { if (e.key === "Enter") addLinkBtn.click(); });

renderLinks();
