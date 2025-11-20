// app.js
gsap.registerPlugin(ScrollTrigger);

// ------------------------------------------------------------------
// 1. Hero entrance – runs once on load
// ------------------------------------------------------------------
const heroTL = gsap.timeline({
  defaults: { ease: "power3.out", duration: 1.2 }
});

heroTL
  .from(".line", {
    y: 180,
    rotation: 6,
    opacity: 0,
    stagger: 0.18,
    duration: 1.4
  })
  .from(
    ".hero-main-photo",
    {
      scale: 1.25,
      duration: 2.6,
      ease: "power2.out"
    },
    "-=1"
  )
  .fromTo(
    ".hero-actions .btn",
    {
      y: 60,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.9,
      ease: "power3.out"
    },
    "-=1.1"
  )
  .from(
    ".hero-sign",
    {
      opacity: 0,
      y: 40,
      duration: 1.2
    },
    "-=1"
  );

// ------------------------------------------------------------------
// 2. Neon glow that follows scroll (subtle & performant)
// ------------------------------------------------------------------
gsap.to(".neon-glow", {
  opacity: 0.55,
  ease: "none",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

// ------------------------------------------------------------------
// 3. Vintage sign flicker – lightweight & runs forever
// ------------------------------------------------------------------
function flickerSign() {
  gsap.to(".vintage-sign", {
    opacity: gsap.utils.random(0.72, 0.88),
    duration: 0.08,
    repeat: 5,
    yoyo: true,
    ease: "none",
    onComplete: () =>
      gsap.delayedCall(gsap.utils.random(8, 25), flickerSign)
  });
}
flickerSign();

// ------------------------------------------------------------------
// 4. Horizontal story scroll – pinned, but header stays on top
// ------------------------------------------------------------------
const storyTrack = document.querySelector(".story-track");

if (storyTrack) {
  const getDistance = () =>
    Math.max(
      0,
      storyTrack.scrollWidth - window.innerWidth * 0.9
    );

  gsap.to(storyTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: "#story-panels",
      start: "top top",
      end: () => `+=${getDistance()}`,
      scrub: 0.8,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });
}

// ------------------------------------------------------------------
// Optional: tiny performance boost for all animated elements
// ------------------------------------------------------------------
gsap.set(
  [".hero-main-photo", ".story-card img", ".vintage-sign"],
  {
    willChange: "transform, opacity",
    force3D: true
  }
);
