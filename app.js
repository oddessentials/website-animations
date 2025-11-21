// app.js
gsap.registerPlugin(ScrollTrigger, Observer, Draggable);
let heroTicketTl;

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

// Extra bump animation for the hero sign on hover/tap with boosted flicker
window.addEventListener("DOMContentLoaded", () => {
  const heroSign = document.querySelector(".hero-sign");
  const vintageSign = document.querySelector(".vintage-sign");

  if (!heroSign || !vintageSign) return;

  const boostedFlicker = () => {
    // Flashier flicker for 250ms
    return gsap.fromTo(
      vintageSign,
      { opacity: 0.5 },
      {
        opacity: 1,
        duration: 0.03,
        repeat: 8,     // rapid strobing
        yoyo: true,
        ease: "none"
      }
    );
  };

  const bumpSign = () => {
    if (gsap.isTweening(vintageSign)) return;

    // Run the boosted flicker *in parallel* with the bump
    boostedFlicker();

    gsap.fromTo(
      vintageSign,
      { rotationX: 0, scale: 1, y: 0 },
      {
        rotationX: -12,
        scale: 1.06,
        y: -7,
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      }
    );
  };

  // Desktop hover
  heroSign.addEventListener("mouseenter", bumpSign);

  // Tap/click for mobile + desktop
  heroSign.addEventListener("click", bumpSign);
});

// ------------------------------------------------------------------
// 1b. HERO “GOLDEN TICKET” BADGE (now just the icon, no bubble text)
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const storyPanels = document.querySelector("#story-panels");
  const heroTicketBtn = document.querySelector("#hero-ticket .ticket-badge");

  if (heroTicketBtn) {
    heroTicketTl = gsap.timeline({ delay: 1.1 });

    heroTicketTl.from("#hero-ticket", {
      opacity: 0,
      y: 30,
      rotate: -6,
      duration: 0.8,
      ease: "power3.out"
    });

    heroTicketTl.to(
      "#hero-ticket",
      {
        y: "-=5",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      },
      "-=0.2"
    );

    // smooth scroll to story panels
    heroTicketBtn.addEventListener("click", () => {
      const target = document.querySelector("#story-panels");
      if (!target) return;

      const headerHeight = header ? header.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - headerHeight - 16;

      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });
    });

    // HERO TICKET HOVER SHAKE (as you already have)
    heroTicketBtn.addEventListener("mouseenter", () => {
      gsap.fromTo(
        heroTicketBtn,
        { rotation: -4 },
        {
          rotation: 4,
          duration: 0.06,
          repeat: 7,
          yoyo: true,
          ease: "power1.inOut"
        }
      );
    });

    heroTicketBtn.addEventListener("mouseleave", () => {
      gsap.to(heroTicketBtn, {
        rotation: 0,
        duration: 0.2,
        ease: "power2.out"
      });
    });
  }
});

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
    onComplete: () => gsap.delayedCall(gsap.utils.random(8, 25), flickerSign)
  });
}
flickerSign();

// ------------------------------------------------------------------
// 4. Horizontal story scroll – pinned, but header stays on top
// ------------------------------------------------------------------
const storyTrack = document.querySelector(".story-track");
const storyPanels = document.querySelector("#story-panels");

if (storyTrack) {
  const getDistance = () =>
    Math.max(0, storyTrack.scrollWidth - window.innerWidth * 0.9);

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
// 5. SCROLL-TRIGGERED TICKET DIVIDER
//    - No more pin
//    - Fades out as the timeline kicks in
// ------------------------------------------------------------------
const ticketDivider = document.querySelector("#ticket-divider");
const mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
  if (!ticketDivider) return;

  // nice entrance
  gsap.fromTo(
    ticketDivider,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ticketDivider,
        start: "top 80%",
        end: "top 60%",
        scrub: true
      }
    }
  );

  // fade it away as soon as we hit the horizontal story timeline
  if (storyPanels) {
    ScrollTrigger.create({
      trigger: storyPanels,
      start: "top top",
      onEnter: () => {
        gsap.to(ticketDivider, {
          opacity: 0,
          y: -30,
          duration: 0.4,
          ease: "power2.inOut"
        });
      }
    });
  }
});

// softer one-shot entrance on small screens, no special fade-out needed
mm.add("(max-width: 767px)", () => {
  if (!ticketDivider) return;

  gsap.from(ticketDivider, {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ticketDivider,
      start: "top 85%",
      once: true
    }
  });
});

// ------------------------------------------------------------------
// 6. DRAGGABLE TICKET PEEK (DESKTOP ONLY) – unchanged
// ------------------------------------------------------------------
mm.add("(pointer: fine) and (min-width: 1024px)", () => {
  const ticketPeek = document.querySelector("#ticket-peek");
  if (!ticketPeek || !storyPanels || typeof Draggable === "undefined") return;

  gsap.set(ticketPeek, { opacity: 0, scale: 0.85, y: 40 });

  gsap.to(ticketPeek, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.75,
    ease: "power3.out",
    scrollTrigger: {
      trigger: storyPanels,
      start: "top center",
      once: true
    }
  });

  const drags = Draggable.create("#ticket-peek", {
    type: "x,y",
    bounds: "#story-panels",
    edgeResistance: 0.65,
    inertia: false,
    onPress() {
      gsap.to(this.target, { scale: 1.03, duration: 0.2 });
    },
    onRelease() {
      gsap.to(this.target, { scale: 1, duration: 0.2 });
    }
  });

  return () => drags.forEach(d => d.kill());
});

// ------------------------------------------------------------------
// 7. HERO TICKET "AUTUMN LEAF" FALL FROM TICKET-PEEK INTO FOOTER
// ------------------------------------------------------------------
// Reveal hero-ticket when story panels come into view (first time)
ScrollTrigger.create({
  trigger: "#story-panels",
  start: "top center",
  once: true,
  onEnter: () => {
    gsap.set("#hero-ticket", { visibility: "visible", autoAlpha: 1 });
  }
});

(() => {
  const heroTicket = document.querySelector("#hero-ticket");
  const ticketPeek = document.querySelector("#ticket-peek");
  const aboutSection = document.querySelector("#about");
  const footer = document.querySelector(".footer");

  if (!heroTicket || !aboutSection || !footer) return;

  // The path the ticket follows once it starts "falling"
  const leafTl = gsap.timeline();

  leafTl
    .to(heroTicket, {
      y: "+=200",
      x: "-=40",
      rotation: -10,
      duration: 0.3,
      ease: "sine.inOut"
    })
    .to(heroTicket, {
      y: "+=260",
      x: "+=30",
      rotation: 12,
      duration: 0.35,
      ease: "sine.inOut"
    })
    .to(heroTicket, {
      y: "+=360",
      x: "-=20",
      rotation: 0,
      duration: 0.4,
      ease: "power2.out"
    });

  ScrollTrigger.create({
    animation: leafTl,
    trigger: aboutSection,
    start: "top bottom",   // when About first enters the viewport
    endTrigger: footer,
    end: "bottom bottom",
    scrub: true,

    onEnter: () => {
      // pause the gentle hero float once the leaf behavior takes over
      if (heroTicketTl) {
        heroTicketTl.pause();
      }

      // If we have a ticket-peek (desktop), start from its LAST position
      if (ticketPeek) {
        const rect = ticketPeek.getBoundingClientRect();

        // Move hero-ticket to match ticket-peek's current on-screen position
        gsap.set(heroTicket, {
          position: "fixed",
          top: rect.top,
          left: rect.left,
          right: "auto",
          bottom: "auto",
          zIndex: 9999,
          autoAlpha: 1
        });

        // Hide & disable ticket-peek so only hero-ticket is visible now
        gsap.set(ticketPeek, {
          autoAlpha: 0,
          pointerEvents: "none"
        });
      } else {
        // Fallback (e.g., mobile where ticket-peek is hidden)
        gsap.set(heroTicket, {
          position: "fixed",
          top: "120px",
          right: "8vw",
          left: "auto",
          zIndex: 9999,
          autoAlpha: 1
        });
      }
    },

    // When scrolling back UP from About → Story
    onLeaveBack: () => {
      // restore ticket-peek when coming back into timeline
      if (ticketPeek) {
        gsap.set(ticketPeek, {
          autoAlpha: 1,
          pointerEvents: "auto"
        });
      }

      // hide hero-ticket again when returning above About
      gsap.set(heroTicket, {
        visibility: "hidden",
        autoAlpha: 0,
        clearProps: "position,top,left,right,bottom,zIndex"
      });

      // restore hero floating only if you ever want it visible again in the hero
      if (heroTicketTl) {
        heroTicketTl.play();
      }
    }
  });
})();

// ------------------------------------------------------------------
// Performance boost
// ------------------------------------------------------------------
gsap.set([".hero-main-photo", ".story-card img", ".vintage-sign"], {
  willChange: "transform, opacity",
  force3D: true
});
