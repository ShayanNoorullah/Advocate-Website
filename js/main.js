/* ═══════════════════════════════════════════════════════
   KHOWAJA LAW ASSOCIATES — site behaviour (no dependencies)
   ═══════════════════════════════════════════════════════ */

const FIRM_WHATSAPP = "923332522517";
const FIRM_EMAIL = "khowajaatifimran@gmail.com";

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

$("#year").textContent = new Date().getFullYear();

/* ── Split headline into masked words ────────────────── */
let wordIndex = 0;
function splitWords(el) {
  [...el.childNodes].forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(" "); return; }
        const w = document.createElement("span");
        w.className = "w";
        const inner = document.createElement("span");
        inner.textContent = part;
        inner.style.setProperty("--i", wordIndex++);
        w.append(inner);
        frag.append(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      splitWords(node);
    }
  });
}
$$("[data-split]").forEach(splitWords);

/* ── Preloader → ready ───────────────────────────────── */
const seen = root.classList.contains("seen");
const goReady = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("ready")));
if (seen || reduced) goReady();
else setTimeout(goReady, 1150);
try { sessionStorage.setItem("kla-seen", "1"); } catch (e) {}

/* ── Statement: words fill in as you scroll ──────────── */
const statement = $("[data-fill]");
const fillWords = [];
if (statement) {
  const words = statement.textContent.trim().split(/\s+/);
  statement.textContent = "";
  words.forEach((word, i) => {
    const s = document.createElement("span");
    s.className = "fw";
    s.textContent = word;
    statement.append(s, i < words.length - 1 ? " " : "");
    fillWords.push(s);
  });
}

/* ── Reveal on scroll (staggered per batch) ──────────── */
const revealIO = new IntersectionObserver(entries => {
  let n = 0;
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.setProperty("--d", `${Math.min(n++, 6) * 0.08}s`);
    e.target.classList.add("in");
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
$$(".reveal").forEach(el => revealIO.observe(el));

/* ── Counters ────────────────────────────────────────── */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, t0 = performance.now(), dur = reduced ? 1 : 1600;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
$$("[data-count]").forEach(el => countIO.observe(el));

/* ── Navigation: scrolled / hide on scroll down / current link ── */
const nav = $("#nav");
const burger = $("#burger");
const menu = $("#menu");
function setMenu(open) {
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) nav.classList.remove("is-hidden");
}
burger.addEventListener("click", () => setMenu(menu.hidden));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

const navLinks = $$(".nav__links a");
const sectionIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => sectionIO.observe(s));

/* ── One rAF-throttled scroll handler ────────────────── */
const progress = $("#progress");
const steps = $("#steps");
const stepItems = $$(".step");
const stepLine = $(".steps__line");
const dock = $("#dock");
const booking = $("#booking");
const hero = $(".hero");
const heroImg = $(".hero__photo img");
let lastY = scrollY, ticking = false;

function onScroll() {
  const y = scrollY, vh = innerHeight;
  const max = root.scrollHeight - vh;
  progress.style.setProperty("--p", max > 0 ? y / max : 0);

  nav.classList.toggle("is-scrolled", y > 20);
  if (menu.hidden) nav.classList.toggle("is-hidden", y > 600 && y > lastY + 4);
  if (y < lastY - 4 || y < 600) nav.classList.remove("is-hidden");
  lastY = y;

  if (statement) {
    const r = statement.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
    const lit = Math.round(p * fillWords.length);
    fillWords.forEach((w, i) => w.classList.toggle("on", i < lit));
  }

  if (steps) {
    const r = steps.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.55 - r.top) / r.height, 0), 1);
    stepLine.style.setProperty("--p", p);
    stepItems.forEach(s => s.classList.toggle("on", s.getBoundingClientRect().top < vh * 0.6));
  }

  if (!reduced && y < vh * 1.2) heroImg.style.setProperty("--py", `${y * 0.12}px`);

  const b = booking.getBoundingClientRect();
  dock.classList.toggle("is-on", y > vh * 0.7 && !(b.top < vh && b.bottom > 0));
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll, { passive: true });
onScroll();

/* ── Pointer effects (desktop only) ──────────────────── */
if (finePointer && !reduced) {
  // Custom cursor ring
  const cursor = $("#cursor");
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; cursor.classList.add("is-on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  (function loop() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener("pointerover", e => {
    cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .choice, summary, input, textarea"));
  });

  // Magnetic buttons
  $$(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  // Bento spotlight
  const bento = $("#bento");
  const tiles = $$(".tile", bento);
  bento.addEventListener("pointermove", e => {
    tiles.forEach(t => {
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Hero depth: floating cards follow the pointer
  const cards = $$("[data-depth]");
  hero.addEventListener("pointermove", e => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    cards.forEach(c => { const d = +c.dataset.depth; c.style.transform = `translate(${nx * d}px, ${ny * d}px)`; });
  });
  hero.addEventListener("pointerleave", () => cards.forEach(c => { c.style.transform = ""; }));
}

/* ── Gallery lightbox ────────────────────────────────── */
const shots = $$(".shot");
const lightbox = $("#lightbox");
const lbImg = $("#lightboxImg");
const lbCap = $("#lightboxCap");
let shotIndex = 0;
function showShot(i) {
  shotIndex = (i + shots.length) % shots.length;
  const shot = shots[shotIndex];
  lbImg.src = shot.dataset.full;
  lbImg.alt = $("img", shot).alt;
  lbCap.textContent = $("span", shot).textContent;
}
shots.forEach((shot, i) => shot.addEventListener("click", () => {
  showShot(i);
  lightbox.showModal();
  document.body.style.overflow = "hidden";
}));
lightbox.addEventListener("close", () => { document.body.style.overflow = ""; });
lightbox.addEventListener("click", e => {
  const action = e.target.closest("[data-lb]")?.dataset.lb;
  if (action === "close" || e.target === lightbox) lightbox.close();
  else if (action) showShot(shotIndex + Number(action));
});
lightbox.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") showShot(shotIndex + 1);
  if (e.key === "ArrowLeft") showShot(shotIndex - 1);
});

/* ═══════════ Booking wizard ═══════════ */
const form = $("#wizard");
const stepsEls = $$(".wstep", form);
const bar = $("#wizardBar");
const stepNow = $("#stepNow");
const stepLabel = $("#stepLabel");
const errorEl = $("#wizardError");
const backBtn = $("#back");
const nextBtn = $("#next");
const sendBtns = $$("button[type=submit]", form);
const done = $("#wdone");
const navWrap = $("#wizardNav");
let current = 1;

const pad = n => String(n).padStart(2, "0");
const today = new Date();
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
$("#date").min = todayStr;

const val = name => {
  const el = form.elements[name];
  return (el && el.value ? el.value : "").trim();
};
const prettyDate = v => new Date(v + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

function validate(n) {
  $$(".is-invalid", form).forEach(el => el.classList.remove("is-invalid"));
  if (n === 1 && !val("matter")) {
    $(".choices--matter").classList.add("is-invalid");
    return "Please choose the type of matter.";
  }
  if (n === 2) {
    if (!val("mode")) { $(".choices--mode").classList.add("is-invalid"); return "Please choose how you would like to meet."; }
    if (!val("date") || val("date") < todayStr) { $("#date").classList.add("is-invalid"); return "Please pick a date from today onwards."; }
  }
  if (n === 3) {
    if (!val("name")) { $("#name").classList.add("is-invalid"); return "Please enter your name."; }
    if (val("phone").replace(/\D/g, "").length < 10) { $("#phone").classList.add("is-invalid"); return "Please enter a valid phone number."; }
    if (val("email") && !form.elements.email.checkValidity()) { $("#email").classList.add("is-invalid"); return "Please check your email address."; }
  }
  return "";
}

function show(n, isBack = false) {
  current = n;
  stepsEls.forEach(s => {
    const active = +s.dataset.step === n;
    s.classList.toggle("is-active", active);
    s.classList.toggle("is-back", active && isBack);
  });
  bar.style.width = `${(n / 3) * 100}%`;
  stepNow.textContent = n;
  stepLabel.textContent = stepsEls[n - 1].dataset.label;
  backBtn.hidden = n === 1;
  nextBtn.hidden = n === 3;
  sendBtns.forEach(b => { b.hidden = n !== 3; });
  showError("");

  if (n === 3) {
    const summary = $("#summary");
    summary.replaceChildren(...[val("matter"), val("mode"), prettyDate(val("date")), val("time")].map(t => {
      const s = document.createElement("span");
      s.textContent = t;
      return s;
    }));
  }
  if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

nextBtn.addEventListener("click", () => {
  const err = validate(current);
  if (err) return showError(err);
  show(current + 1);
});
backBtn.addEventListener("click", () => show(current - 1, true));
form.addEventListener("change", () => { if (!errorEl.hidden) showError(validate(current)); });

form.addEventListener("submit", e => {
  e.preventDefault();
  if (current < 3) { nextBtn.click(); return; }
  const err = validate(3);
  if (err) return showError(err);

  const longDate = new Date(val("date") + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const message = [
    "CONSULTATION REQUEST — Khowaja Law Associates",
    "",
    "Name: " + val("name"),
    "Phone: " + val("phone"),
    val("email") ? "Email: " + val("email") : null,
    "Matter: " + val("matter"),
    "Mode: " + val("mode"),
    "Preferred date: " + longDate,
    "Preferred time: " + val("time"),
    val("details") ? "\nDetails: " + val("details") : null,
    "",
    "(Sent from the Khowaja Law Associates website)"
  ].filter(l => l !== null).join("\n");

  const channel = e.submitter && e.submitter.dataset.channel === "email" ? "email" : "whatsapp";
  if (channel === "whatsapp") {
    window.open(`https://wa.me/${FIRM_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  } else {
    const subject = `Consultation Request — ${val("name")} (${val("matter")})`;
    location.href = `mailto:${FIRM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  stepsEls.forEach(s => s.classList.remove("is-active"));
  navWrap.hidden = true;
  bar.style.width = "100%";
  stepLabel.textContent = "Done";
  done.hidden = false;
  done.focus({ preventScroll: true });
});

$("#restart").addEventListener("click", () => {
  form.reset();
  done.hidden = true;
  navWrap.hidden = false;
  show(1);
});
