// Utility: create element with classes/attrs
function el(tag, opts = {}) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text) node.textContent = opts.text;
  if (opts.html) node.innerHTML = opts.html;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/* ===========================
   State
=========================== */
const state = {
  skills: [],
  education: [], // {degree, institute, year, details, id}
  experience: [], // {role, company, period, details, id}
  totalFields: 12, // for progress (approximate)
};

const form = document.getElementById("resumeForm");
const progressBar = document.getElementById("progressBar");

/* ===========================
   Basic Info -> Preview
=========================== */
const bind = (inputId, previewId, transform = (v) => v) => {
  const $in = document.getElementById(inputId);
  const $out = document.getElementById(previewId);
  const onInput = () => {
    const v = $in.value.trim();
    $out.textContent = v ? transform(v) : ($out.dataset.placeholder || "");
    toggleSectionVisibility();
    updateProgress();
  };
  // store placeholder to restore on empty
  $out.dataset.placeholder = $out.textContent;
  $in.addEventListener("input", onInput);
  onInput();
};

bind("name", "p_name");
bind("email", "p_email");
bind("phone", "p_phone");
bind("location", "p_location");
bind("summary", "p_summary");

/* ===========================
   Section visibility
=========================== */
function toggleSectionVisibility() {
  // summary
  const hasSummary = !!document.getElementById("summary").value.trim();
  setSection("p_summary_sec", hasSummary);

  // skills
  setSection("p_skills_sec", state.skills.length > 0);

  // education
  setSection("p_edu_sec", state.education.length > 0);

  // experience
  setSection("p_exp_sec", state.experience.length > 0);
}
function setSection(id, show) {
  const sec = document.getElementById(id);
  sec.classList.toggle("hidden", !show);
}

/* ===========================
   Skills (tag-like)
=========================== */
const skillInput = document.getElementById("skillInput");
const skillTags = document.getElementById("skillTags");
const pSkills = document.getElementById("p_skills");

function renderSkills() {
  // Form tags
  skillTags.innerHTML = "";
  state.skills.forEach((s, idx) => {
    const tag = el("span", { class: "tag" });
    tag.append(s);
    const btn = el("button", { text: "×", attrs: { title: "Remove" } });
    btn.addEventListener("click", () => {
      state.skills.splice(idx, 1);
      renderSkills();
      toggleSectionVisibility();
      updateProgress();
    });
    tag.append(btn);
    skillTags.append(tag);
  });

  // Preview list
  pSkills.innerHTML = "";
  state.skills.forEach((s) => pSkills.append(el("li", { text: s })));
}

function addSkillFromInput() {
  const raw = skillInput.value.trim();
  if (!raw) return;
  raw.split(",").map(s => s.trim()).filter(Boolean).forEach(s => {
    if (!state.skills.includes(s)) state.skills.push(s);
  });
  skillInput.value = "";
  renderSkills();
  toggleSectionVisibility();
  updateProgress();
}

skillInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addSkillFromInput();
  }
});

/* ===========================
   Education / Experience blocks
=========================== */
const educationList = document.getElementById("educationList");
const experienceList = document.getElementById("experienceList");
const pEduList = document.getElementById("p_edu_list");
const pExpList = document.getElementById("p_exp_list");

function educationGroup(item) {
  const wrap = el("div", { class: "group" });
  const g = el("div", { class: "grid-2" });

  const degree = el("input", { attrs:{ placeholder:"Degree e.g., B.Tech CSE", type:"text"} });
  const institute = el("input", { attrs:{ placeholder:"Institution", type:"text"} });
  const year = el("input", { attrs:{ placeholder:"Year / CGPA", type:"text"} });
  const details = el("textarea", { attrs:{ rows:"2", placeholder:"Relevant courses / highlights"} });

  degree.value = item?.degree || "";
  institute.value = item?.institute || "";
  year.value = item?.year || "";
  details.value = item?.details || "";

  g.append(
    labelWrap("Degree", degree),
    labelWrap("Institution", institute),
    labelWrap("Year / Score", year),
    labelWrap("Details", details)
  );

  const actions = el("div", { class: "row-between" });
  const remove = el("button", { class: "btn danger remove", text: "Remove" });
  remove.addEventListener("click", () => {
    state.education = state.education.filter((x) => x.id !== item.id);
    renderEducation();
    toggleSectionVisibility();
    updateProgress();
  });
  actions.append(el("span", { class: "muted", text: "Entry" }), remove);

  wrap.append(g, actions);

  // Update state & preview on input
  [degree, institute, year, details].forEach((input) =>
    input.addEventListener("input", () => {
      Object.assign(item, {
        degree: degree.value.trim(),
        institute: institute.value.trim(),
        year: year.value.trim(),
        details: details.value.trim(),
      });
      renderEducation();
      updateProgress();
    })
  );

  return wrap;
}

function experienceGroup(item) {
  const wrap = el("div", { class: "group" });
  const g = el("div", { class: "grid-2" });

  const role = el("input", { attrs:{ placeholder:"Role e.g., Frontend Intern", type:"text"} });
  const company = el("input", { attrs:{ placeholder:"Company / Org", type:"text"} });
  const period = el("input", { attrs:{ placeholder:"Dates e.g., Jun 2024 – Aug 2024", type:"text"} });
  const details = el("textarea", { attrs:{ rows:"2", placeholder:"Impact & responsibilities (use bullets)"} });

  role.value = item?.role || "";
  company.value = item?.company || "";
  period.value = item?.period || "";
  details.value = item?.details || "";

  g.append(
    labelWrap("Role", role),
    labelWrap("Company", company),
    labelWrap("Period", period),
    labelWrap("Details", details)
  );

  const actions = el("div", { class: "row-between" });
  const remove = el("button", { class: "btn danger remove", text: "Remove" });
  remove.addEventListener("click", () => {
    state.experience = state.experience.filter((x) => x.id !== item.id);
    renderExperience();
    toggleSectionVisibility();
    updateProgress();
  });
  actions.append(el("span", { class: "muted", text: "Entry" }), remove);

  wrap.append(g, actions);

  [role, company, period, details].forEach((input) =>
    input.addEventListener("input", () => {
      Object.assign(item, {
        role: role.value.trim(),
        company: company.value.trim(),
        period: period.value.trim(),
        details: details.value.trim(),
      });
      renderExperience();
      updateProgress();
    })
  );

  return wrap;
}

function labelWrap(text, control) {
  const l = el("label");
  l.append(el("span", { text }), control);
  return l;
}

function renderEducation() {
  // Form side
  educationList.innerHTML = "";
  state.education.forEach((item) => educationList.append(educationGroup(item)));

  // Preview side
  pEduList.innerHTML = "";
  state.education.forEach((e) => {
    const it = el("div", { class: "item" });
    it.append(el("h3", { text: e.degree || "—" }));
    it.append(el("div", { class: "sub", text: [e.institute, e.year].filter(Boolean).join(" • ") }));
    if (e.details) it.append(el("p", { text: e.details }));
    pEduList.append(it);
  });
}

function renderExperience() {
  experienceList.innerHTML = "";
  state.experience.forEach((item) => experienceList.append(experienceGroup(item)));

  pExpList.innerHTML = "";
  state.experience.forEach((x) => {
    const it = el("div", { class: "item" });
    it.append(el("h3", { text: x.role || "—" }));
    it.append(el("div", { class: "sub", text: [x.company, x.period].filter(Boolean).join(" • ") }));
    if (x.details) it.append(el("p", { text: x.details }));
    pExpList.append(it);
  });
}

/* Add buttons */
document.getElementById("addEducation").addEventListener("click", () => {
  state.education.push({ id: crypto.randomUUID(), degree: "", institute: "", year: "", details: "" });
  renderEducation();
  toggleSectionVisibility();
  updateProgress();
});

document.getElementById("addExperience").addEventListener("click", () => {
  state.experience.push({ id: crypto.randomUUID(), role: "", company: "", period: "", details: "" });
  renderExperience();
  toggleSectionVisibility();
  updateProgress();
});

/* ===========================
   Progress bar
=========================== */
function countFilled() {
  let n = 0;
  const ids = ["name","email","phone","location","summary"];
  ids.forEach(id => { if (document.getElementById(id).value.trim()) n++; });
  if (state.skills.length) n++;
  n += state.education.reduce((acc, e) => acc + ["degree","institute","year","details"].filter(k => (e[k]||"").trim()).length/4, 0);
  n += state.experience.reduce((acc, e) => acc + ["role","company","period","details"].filter(k => (e[k]||"").trim()).length/4, 0);
  return Math.min(n, state.totalFields);
}
function updateProgress() {
  const pct = Math.round((countFilled() / state.totalFields) * 100);
  progressBar.style.width = `${pct}%`;
}
updateProgress();

/* ===========================
   Clear & Download
=========================== */
document.getElementById("clearBtn").addEventListener("click", () => {
  // Reset state
  state.skills = [];
  state.education = [];
  state.experience = [];
  // Re-render
  renderSkills();
  renderEducation();
  renderExperience();
  toggleSectionVisibility();
  // Inputs will reset because it is a <button type="reset">
  setTimeout(() => { // wait for inputs reset
    ["p_name","p_email","p_phone","p_location"].forEach(id => {
      const el = document.getElementById(id);
      el.textContent = el.dataset.placeholder || "";
    });
    document.getElementById("p_summary").textContent = "";
    updateProgress();
  }, 0);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  // Simplest cross-browser approach: print dialog (user can save as PDF)
  window.print();
});

/* Initial hydrate (empty preview sections hidden) */
renderSkills();
renderEducation();
renderExperience();
toggleSectionVisibility();
