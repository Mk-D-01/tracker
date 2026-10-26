// AI Roadmap Tracker — all state lives in localStorage under STORE_KEY.

const STORE_KEY = "ai-roadmap-tracker-v1";

// Items shown in the "Job-ready" sidebar; each one is tied to a roadmap task.
const READY_ITEMS = [
  { task: "p3-check", text: "Build & deploy an LLM API without a tutorial" },
  { task: "p4-check", text: "2+ projects with baselines, metrics, live links" },
  { task: "int-dsa", text: "LeetCode medium in 30–40 minutes" },
  { task: "int-ml", text: "Explain overfitting, leakage, precision/recall, RAG" },
  { task: "job-apps", text: "50+ targeted applications sent" },
];

const emptyState = () => ({
  done: {},      // taskId -> true
  counts: {},    // taskId -> number
  notes: {},     // phaseId -> string
  activity: {},  // "YYYY-MM-DD" -> number of actions that day
  overrides: {}, // phaseId -> true when manually unlocked
  hideDone: false, // hide completed tasks in the phase view
  selected: "p1",
});

let state = load();

// ---------- storage ----------

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn("Could not load saved progress:", e);
  }
  return emptyState();
}

// Notes are typed a key at a time; batch those writes instead of hitting
// localStorage on every keystroke.
let saveTimer;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}

function save() {
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save progress:", e);
  }
}

// ---------- progress math ----------

const allTasks = (phase) => phase.groups.flatMap((g) => g.tasks);
const findPhase = (id) => ROADMAP.find((p) => p.id === id);
const findTask = (id) => ROADMAP.flatMap(allTasks).find((t) => t.id === id);

// 0..1 completion of a single task
function taskFraction(task) {
  if (task.type === "count") return Math.min((state.counts[task.id] || 0) / task.target, 1);
  return state.done[task.id] ? 1 : 0;
}

function percentOf(tasks) {
  if (!tasks.length) return 0;
  const sum = tasks.reduce((s, t) => s + taskFraction(t), 0);
  return Math.round((sum / tasks.length) * 100);
}

const phasePercent = (phase) => percentOf(allTasks(phase));

function isUnlocked(phase) {
  if (state.overrides[phase.id]) return true;
  return phase.unlock.every((r) => phasePercent(findPhase(r.phase)) >= r.percent);
}

function phaseStatus(phase) {
  if (!isUnlocked(phase)) return "locked";
  return phasePercent(phase) === 100 ? "done" : "active";
}

// ---------- activity / streak ----------

function dayKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function logActivity() {
  const k = dayKey();
  state.activity[k] = (state.activity[k] || 0) + 1;
}

function streak() {
  const d = new Date();
  // a streak is still alive if you haven't logged anything yet today
  if (!state.activity[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (state.activity[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// ---------- mutations ----------

// Short haptic tick on Android; silently ignored where unsupported.
const buzz = (pattern = 12) => navigator.vibrate?.(pattern);

// Wraps every change: remembers which phases were locked, applies the change,
// then announces any phase that just unlocked.
function mutate(fn, { activity = true } = {}) {
  const lockedBefore = ROADMAP.filter((p) => !isUnlocked(p)).map((p) => p.id);
  fn();
  if (activity) logActivity();
  save();
  const newlyOpen = lockedBefore.map(findPhase).filter(isUnlocked);
  newlyOpen.forEach((p) => toast(`🔓 Phase unlocked: ${p.title}`));
  render();
}

function toggleTask(id, checked) {
  mutate(() => {
    if (checked) state.done[id] = true;
    else delete state.done[id];
  });
  const task = findTask(id);
  if (checked) buzz(task.checkpoint ? [20, 60, 20] : 12);
  if (checked && task.checkpoint) toast("★ Checkpoint cleared!");
}

function setCount(id, value) {
  const task = findTask(id);
  const n = Math.max(0, Math.floor(Number(value) || 0));
  const wasComplete = (state.counts[id] || 0) >= task.target;
  mutate(() => { state.counts[id] = n; });
  if (!wasComplete && n >= task.target) {
    buzz([20, 60, 20]);
    toast(`🎯 Target reached: ${task.text}`);
  }
}

// ---------- rendering ----------

const $ = (id) => document.getElementById(id);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c != null) node.append(c);
  }
  return node;
}

function bar(percent, extraClass = "") {
  return el("div", { class: `bar ${extraClass}` },
    el("div", { class: `bar-fill${percent >= 100 ? " full" : ""}`, style: `width:${percent}%` }));
}

function renderStats() {
  const tasks = ROADMAP.flatMap(allTasks);
  const overall = percentOf(tasks);
  const doneCount = tasks.filter((t) => taskFraction(t) === 1).length;
  $("stat-overall").textContent = `${overall}%`;
  $("stat-tasks").textContent = `${doneCount}/${tasks.length}`;
  $("stat-streak").textContent = streak();
  $("overall-fill").style.width = `${overall}%`;
}

const isPhone = () => matchMedia("(max-width: 860px)").matches;

// On phones the phase strip scrolls sideways; keep the selected phase visible.
// (scrollLeft rather than scrollIntoView, which would also scroll the page.)
function centerSelectedNode() {
  const path = $("path");
  const node = path.querySelector(".node.selected");
  if (!node) return;
  path.scrollTo({
    left: node.offsetLeft - (path.clientWidth - node.offsetWidth) / 2,
    behavior: "smooth",
  });
}

function renderPath() {
  const path = $("path");
  path.replaceChildren(...ROADMAP.map((p, i) => {
    const status = phaseStatus(p);
    const icon = status === "done" ? "✓" : status === "locked" ? "🔒" : i + 1;
    return el("button", {
      class: `node ${status}${state.selected === p.id ? " selected" : ""}`,
      onclick: () => {
        state.selected = p.id;
        save();
        render();
        centerSelectedNode();
        if (isPhone()) $("phase").scrollIntoView({ behavior: "smooth", block: "start" });
      },
      "aria-current": state.selected === p.id ? "step" : false,
    },
      el("span", { class: "dot" }, String(icon)),
      el("span", { class: "node-title" }, p.title),
      el("span", { class: "node-meta" }, `${phasePercent(p)}% · ${p.weeks}`),
    );
  }));
}

function renderTask(task) {
  if (task.type === "count") {
    const n = state.counts[task.id] || 0;
    const pct = Math.round(taskFraction(task) * 100);
    return el("div", { class: `task${pct === 100 ? " checked" : ""}`, style: "flex-wrap:wrap" },
      el("label", { for: `in-${task.id}` }, task.text),
      el("div", { class: "counter" },
        el("button", { "aria-label": "Decrease", onclick: () => setCount(task.id, n - 1) }, "−"),
        el("input", {
          id: `in-${task.id}`, type: "number", min: "0", value: String(n),
          inputmode: "numeric", enterkeyhint: "done",
          onchange: (e) => setCount(task.id, e.target.value),
        }),
        el("button", { "aria-label": "Increase", onclick: () => setCount(task.id, n + 1) }, "+"),
        el("span", { class: "target" }, `/ ${task.target}`),
      ),
      bar(pct, "mini-bar"),
    );
  }

  const checked = !!state.done[task.id];
  return el("div", { class: `task${checked ? " checked" : ""}${task.checkpoint ? " checkpoint" : ""}` },
    el("input", {
      type: "checkbox", id: `cb-${task.id}`, checked,
      onchange: (e) => toggleTask(task.id, e.target.checked),
    }),
    el("label", { for: `cb-${task.id}` }, task.text),
  );
}

function renderPhase() {
  const phase = findPhase(state.selected) || ROADMAP[0];
  const status = phaseStatus(phase);
  const pct = phasePercent(phase);
  const badgeText = { done: "Completed", active: "In progress", locked: "Locked" }[status];

  let lockBox = null;
  if (status === "locked") {
    const reqs = phase.unlock
      .map((r) => `${findPhase(r.phase).title} ≥ ${r.percent}% (now ${phasePercent(findPhase(r.phase))}%)`)
      .join(", ");
    lockBox = el("div", { class: "lock-box" },
      el("span", {}, `🔒 Unlocks when: ${reqs}`),
      el("button", {
        class: "btn",
        onclick: () => mutate(() => { state.overrides[phase.id] = true; }, { activity: false }),
      }, "I already know the earlier material — unlock"),
    );
  } else if (state.overrides[phase.id]) {
    lockBox = el("p", { class: "muted small" },
      "Unlocked manually. ",
      el("button", {
        class: "btn", style: "padding:2px 8px",
        onclick: () => mutate(() => { delete state.overrides[phase.id]; }, { activity: false }),
      }, "Re-lock"),
    );
  }

  const isDone = (t) => taskFraction(t) === 1;
  const doneCount = allTasks(phase).filter(isDone).length;
  const doneToggle = el("button", {
    class: "btn",
    "aria-pressed": state.hideDone ? "true" : "false",
    onclick: () => mutate(() => { state.hideDone = !state.hideDone; }, { activity: false }),
  }, state.hideDone ? `Show completed (${doneCount})` : `Hide completed (${doneCount})`);

  const groups = phase.groups.map((g) => {
    const visible = state.hideDone ? g.tasks.filter((t) => !isDone(t)) : g.tasks;
    return el("div", { class: "group" },
      el("div", { class: "group-head" },
        el("span", {}, g.name),
        el("span", {}, `${percentOf(g.tasks)}%`)),
      visible.length ? visible.map(renderTask) : el("p", { class: "muted small" }, "✓ All done"),
    );
  });

  const notes = el("div", { class: "notes" },
    el("h3", {}, "Notes & resources"),
    el("textarea", {
      placeholder: "Links, what you learned, what confused you…",
      oninput: (e) => { state.notes[phase.id] = e.target.value; saveSoon(); },
      onblur: save,
    }),
  );
  notes.querySelector("textarea").value = state.notes[phase.id] || "";

  const section = $("phase");
  section.className = `phase${status === "locked" ? " locked-phase" : ""}`;
  // replaceChildren() doesn't flatten arrays or skip nulls (it would print
  // "null[object HTMLDivElement]…"), so build the list explicitly.
  section.replaceChildren(...[
    el("div", { class: "phase-head" },
      el("h2", {}, phase.title),
      el("span", { class: `badge ${status}` }, `${badgeText} · ${phase.weeks}`)),
    el("p", { class: "goal" }, `Goal: ${phase.goal}`),
    bar(pct),
    el("div", { class: "phase-tools" },
      el("p", { class: "muted small" }, `${pct}% complete`),
      doneToggle),
    lockBox,
    ...groups,
    notes,
  ].filter(Boolean));
}

function renderHeatmap() {
  const days = 12 * 7;
  const today = dayKey();
  // columns are weeks (Sun..Sat); the last column is the current week
  const start = new Date();
  start.setDate(start.getDate() + (6 - start.getDay()) - (days - 1));
  const cells = [];
  let activeDays = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = dayKey(d);
    if (k > today) {
      cells.push(el("div", { class: "cell", style: "opacity:0.3" }));
      continue;
    }
    const n = state.activity[k] || 0;
    if (n) activeDays++;
    const level = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : 3;
    cells.push(el("div", { class: "cell", "data-l": String(level), title: `${k}: ${n} update${n === 1 ? "" : "s"}` }));
  }
  $("heatmap").replaceChildren(...cells);

  const keys = Object.keys(state.activity).sort();
  $("last-active").textContent = keys.length
    ? `${activeDays} active days in this window · last active ${keys[keys.length - 1]}`
    : "No activity yet. Check off your first task!";
}

function renderReady() {
  $("ready").replaceChildren(...READY_ITEMS.map((r) =>
    el("li", { class: taskFraction(findTask(r.task)) === 1 ? "ok" : "" }, r.text)));
}

function render() {
  renderStats();
  renderPath();
  renderPhase();
  renderHeatmap();
  renderReady();
}

// ---------- toast ----------

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- export / import / reset ----------

$("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = el("a", { href: URL.createObjectURL(blob), download: `roadmap-progress-${dayKey()}.json` });
  a.click();
  // Android Chrome starts the download asynchronously; revoking right away
  // can cancel it.
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$("file-import").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (typeof data !== "object" || !data.done) throw new Error("Not a tracker backup");
    state = { ...emptyState(), ...data };
    save();
    render();
    toast("Progress imported");
  } catch (err) {
    alert(`Import failed: ${err.message}`);
  }
  e.target.value = "";
});

$("btn-reset").addEventListener("click", () => {
  if (!confirm("Erase all progress? Export a backup first if you might want it back.")) return;
  state = emptyState();
  save();
  render();
});

// Android may kill a backgrounded tab without warning; flush pending notes.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") save();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW registration failed:", e));
  });
}

render();
centerSelectedNode();
