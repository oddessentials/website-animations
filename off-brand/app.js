// app.js
gsap.registerPlugin(ScrollTrigger);

// --- Utility: basic character splitter (SplitText-style chars) ----------
function splitText(el) {
  const chars = [...el.textContent].map(char => {
    if (char === " ") return '<span class="char space">&nbsp;</span>';
    return `<span class="char">${char}</span>`;
  });
  el.innerHTML = chars.join("");
}

// --- 1. HERO ------------------------------------------------------------
const titleEl = document.querySelector("#title");
splitText(titleEl);

// Title characters animation
gsap.from("#title .char", {
  opacity: 0,
  y: 80,
  rotationX: -90,
  stagger: 0.035,
  duration: 1.1,
  ease: "back.out(1.7)"
});

// Subtitle + body
gsap.from(".hero-subtitle", {
  opacity: 0,
  y: 26,
  duration: 0.8,
  delay: 0.7,
  ease: "power2.out"
});

gsap.from(".hero-body", {
  opacity: 0,
  y: 22,
  duration: 0.9,
  delay: 0.9,
  ease: "power2.out"
});

// Hero morphing logo (looping) ------------------------------------------
// Both paths share the same command pattern: M + 7 L + Z (8 vertices)
const heroStarPath = "M180,100 L125,125 L100,180 L75,125 L20,100 L75,75 L100,20 L125,75 Z";
const heroCirclePath = "M170,100 L149,149 L100,170 L51,149 L30,100 L51,51 L100,30 L149,51 Z";

const heroMorph = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "power2.inOut" } });

heroMorph
  .fromTo(
    "#morph-shape",
    { attr: { d: heroStarPath }, scale: 0.95, transformOrigin: "50% 50%" },
    { attr: { d: heroCirclePath }, scale: 1.03, duration: 2.4 }
  )
  .to(
    "#hero-orbit",
    { rotation: "+=120", transformOrigin: "50% 50%", duration: 2.4 },
    0
  );

// Slight float on the whole logo block
gsap.to("#hero-logo", {
  y: -16,
  duration: 4,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});

// Mouse parallax on hero logo -------------------------------------------
(function attachHeroParallax() {
  const hero = document.querySelector("#hero");
  const logo = document.querySelector("#hero-logo");
  if (!hero || !logo) return;

  const bounds = { w: 0, h: 0, left: 0, top: 0 };
  function updateBounds() {
    const rect = hero.getBoundingClientRect();
    bounds.w = rect.width;
    bounds.h = rect.height;
    bounds.left = rect.left;
    bounds.top = rect.top;
  }
  updateBounds();
  window.addEventListener("resize", updateBounds);

  hero.addEventListener("pointermove", (e) => {
    const x = (e.clientX - bounds.left) / bounds.w - 0.5;
    const y = (e.clientY - bounds.top) / bounds.h - 0.5;

    gsap.to(logo, {
      x: x * 26,
      y: y * 18,
      rotationY: x * 10,
      rotationX: -y * 8,
      transformPerspective: 600,
      transformOrigin: "50% 50%",
      duration: 0.5,
      ease: "power2.out"
    });
  });

  hero.addEventListener("pointerleave", () => {
    gsap.to(logo, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  });
})();

// --- 2. SCROLL PANELS ---------------------------------------------------
ScrollTrigger.create({
  trigger: "#pinned",
  start: "top top",
  end: "+=300%",
  pin: true,
  scrub: true
});

// Fade + scale each panel in/out on scroll
gsap.utils.toArray(".panel").forEach((panel) => {
  gsap.from(panel.querySelector(".panel-inner"), {
    opacity: 0,
    y: 40,
    scale: 0.95,
    scrollTrigger: {
      trigger: panel,
      start: "top 80%",
      end: "bottom 40%",
      scrub: true
    }
  });
});

// --- 3. SVG LAB: scroll-driven morph ------------------------------------
const labStarPath = heroStarPath;
const labCirclePath = heroCirclePath;

// Optional third shape (slightly asymmetric blob)
const labBlobPath =
  "M176,96 L138,134 L108,182 L66,138 L24,102 L60,70 L98,26 L142,60 Z";

const labTl = gsap.timeline({
  scrollTrigger: {
    trigger: "#svg-lab",
    start: "top 70%",
    end: "bottom 20%",
    scrub: true
  }
});

labTl
  .fromTo(
    "#scroll-morph-shape",
    { attr: { d: labStarPath }, scale: 0.9, transformOrigin: "50% 50%", rotation: -8 },
    { attr: { d: labBlobPath }, scale: 1.05, rotation: 4, duration: 1.5, ease: "power2.inOut" }
  )
  .to(
    "#scroll-morph-shape",
    { attr: { d: labCirclePath }, rotation: 0, scale: 1, duration: 1.5, ease: "power2.inOut" }
  );

// --- 4. FINAL TEXT REVEAL ----------------------------------------------
const finalEl = document.querySelector("#final-text");
splitText(finalEl);

gsap.from("#final-text .char", {
  y: 160,
  opacity: 0,
  rotation: 8,
  stagger: 0.03,
  duration: 1.1,
  ease: "elastic.out(1, 0.45)",
  scrollTrigger: {
    trigger: "#text",
    start: "top 70%"
  }
});

gsap.from(".tagline", {
  opacity: 0,
  y: 22,
  duration: 0.7,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#text",
    start: "top 75%"
  }
});
