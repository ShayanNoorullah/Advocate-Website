/* ═══════════════════════════════════════════════════════
   KHOWAJA LAW ASSOCIATES — Site behaviour
   ═══════════════════════════════════════════════════════ */

const FIRM_WHATSAPP = "923332522517";           // +92 333 2522517
const FIRM_EMAIL = "khowajaatifimran@gmail.com";

/* ── Footer year ─────────────────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ── Sticky nav shadow ───────────────────────────────── */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

/* ── Mobile menu ─────────────────────────────────────── */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("is-open");
  navLinks.classList.toggle("is-open");
});
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    navToggle.classList.remove("is-open");
    navLinks.classList.remove("is-open");
  })
);

/* ── Reveal on scroll ────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("is-visible");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ── Animated stat counters ──────────────────────────── */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".stats__num").forEach(el => statObserver.observe(el));

/* ── Mobile sticky CTA (hidden while booking section on screen) ── */
const stickyCta = document.getElementById("stickyCta");
const bookingSection = document.getElementById("booking");
window.addEventListener("scroll", () => {
  const pastHero = window.scrollY > window.innerHeight * 0.6;
  const b = bookingSection.getBoundingClientRect();
  const bookingOnScreen = b.top < window.innerHeight && b.bottom > 0;
  stickyCta.classList.toggle("is-visible", pastHero && !bookingOnScreen);
}, { passive: true });

/* ── Booking form ────────────────────────────────────── */
const form = document.getElementById("bookingForm");
const formError = document.getElementById("formError");
const formSuccess = document.getElementById("formSuccess");

// Preferred date: today onwards
const dateInput = document.getElementById("bkDate");
dateInput.min = new Date().toISOString().split("T")[0];

let channel = "whatsapp";
form.querySelectorAll("button[type=submit]").forEach(btn =>
  btn.addEventListener("click", () => { channel = btn.dataset.channel; })
);

form.addEventListener("submit", e => {
  e.preventDefault();

  // Validate required fields
  let valid = true;
  form.querySelectorAll("[required]").forEach(field => {
    const bad = !field.value || (field.type === "email" && !field.checkValidity());
    field.classList.toggle("is-invalid", bad);
    if (bad) valid = false;
  });
  formError.hidden = valid;
  if (!valid) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }

  const v = id => document.getElementById(id).value.trim();
  const dateStr = new Date(v("bkDate") + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const lines = [
    "CONSULTATION REQUEST — Khowaja Law Associates",
    "",
    "Name: " + v("bkName"),
    "Phone: " + v("bkPhone"),
    v("bkEmail") ? "Email: " + v("bkEmail") : null,
    "Matter: " + v("bkMatter"),
    "Mode: " + v("bkOffice"),
    "Preferred date: " + dateStr,
    v("bkTime") ? "Preferred time: " + v("bkTime") : null,
    v("bkDetails") ? "" : null,
    v("bkDetails") ? "Details: " + v("bkDetails") : null,
    "",
    "(Sent from the Khowaja Law Associates website)"
  ].filter(l => l !== null);
  const message = lines.join("\n");

  if (channel === "whatsapp") {
    window.open("https://wa.me/" + FIRM_WHATSAPP + "?text=" + encodeURIComponent(message), "_blank");
  } else {
    const subject = "Consultation Request — " + v("bkName") + " (" + v("bkMatter") + ")";
    window.location.href = "mailto:" + FIRM_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(message);
  }

  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* Clear invalid state as the user types */
form.querySelectorAll("input, select, textarea").forEach(field =>
  field.addEventListener("input", () => field.classList.remove("is-invalid"))
);
