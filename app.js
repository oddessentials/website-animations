// app.js
gsap.registerPlugin(ScrollTrigger, Draggable);

// We'll reuse this for responsive behaviors
const mm = gsap.matchMedia();

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
// 1a. Extra bump animation for the hero sign on hover/tap with boosted flicker
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const heroSign = document.querySelector(".hero-sign");
  const vintageSign = document.querySelector(".vintage-sign");

  if (!heroSign || !vintageSign) return;

  const boostedFlicker = () => {
    return gsap.fromTo(
      vintageSign,
      { opacity: 0.5 },
      {
        opacity: 1,
        duration: 0.03,
        repeat: 8,
        yoyo: true,
        ease: "none"
      }
    );
  };

  const bumpSign = () => {
    if (gsap.isTweening(vintageSign)) return;

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

  heroSign.addEventListener("mouseenter", bumpSign);
  heroSign.addEventListener("click", bumpSign);
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

// Only run the infinite flicker if user does NOT request reduced motion
mm.add("(prefers-reduced-motion: no-preference)", () => {
  flickerSign();
});

// ------------------------------------------------------------------
// 4. Story panels + ticket-divider
//    - Desktop: ticket-divider tied to the scrubbed story timeline
//    - Mobile: ticket-divider appears *between* hero and panels,
//              and is gone before the slideshow pins
// ------------------------------------------------------------------
const storyTrack = document.querySelector(".story-track");
const storyPanels = document.querySelector("#story-panels");
const ticketDivider = document.querySelector("#ticket-divider");

if (storyTrack && storyPanels) {
  const getDistance = () =>
    Math.max(0, storyTrack.scrollWidth - window.innerWidth * 0.9);

  // Base timeline that controls the horizontal scrub + pin
  const storyTl = gsap.timeline({
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

  // Horizontal scroll of the photo track
  storyTl.to(
    storyTrack,
    {
      x: () => -getDistance(),
      ease: "none"
    },
    0
  );

  // ------------ TICKET DIVIDER BEHAVIOR ------------ //
  if (ticketDivider) {
    // Desktop / tablet: divider tied to the pinned story timeline
    mm.add("(min-width: 768px)", () => {
      gsap.set(ticketDivider, { autoAlpha: 0 });

      // Fade in near the start of the pinned section
      storyTl.fromTo(
        ticketDivider,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.25,
          ease: "power2.out"
        },
        0.0 // appear right as the timeline starts
      );

      // Fade out fairly early so photos are unobstructed
      storyTl.to(
        ticketDivider,
        {
          autoAlpha: 0,
          y: -40,
          duration: 0.25,
          ease: "power2.in"
        },
        0.18 // gone before we're deep into the slideshow
      );
    });

    // Mobile: divider lives in the "gap" between hero and panels,
    // not over the pinned slideshow itself.
    // MOBILE: divider appears between hero + panels,
    //         then disappears before the pinned slideshow.
    mm.add("(max-width: 767px)", () => {
      gsap.set(ticketDivider, { autoAlpha: 0, y: 40 });

      let lastAlpha = -1;
      let lastY = NaN;

      ScrollTrigger.create({
        trigger: "#story-panels",
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate: self => {
          const p = self.progress; // 0 → 1 over the approach zone

          let alpha;
          if (p < 0.3) {
            alpha = p / 0.3;
          } else if (p > 0.7) {
            alpha = (1 - p) / 0.3;
          } else {
            alpha = 1;
          }

          const y = gsap.utils.mapRange(0, 1, 40, -40, p);

          // Only touch the DOM when something actually changes
          if (alpha !== lastAlpha || y !== lastY) {
            lastAlpha = alpha;
            lastY = y;
            gsap.set(ticketDivider, { autoAlpha: alpha, y });
          }
        }
      });
    });
  }
}


// ------------------------------------------------------------------
// 5. DRAGGABLE TICKET PEEK (DESKTOP ONLY)
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
// 6. HERO TICKET "AUTUMN LEAF" FALL FROM TICKET-PEEK INTO FOOTER
//    - hero-ticket is ONLY visible between About and Footer
//    - starts from ticket-peek's position when entering About
//    - hides again when we scroll back above About
// ------------------------------------------------------------------
(() => {
  const heroTicket = document.querySelector("#hero-ticket");
  const ticketPeek = document.querySelector("#ticket-peek");
  const aboutSection = document.querySelector("#about");
  const footer = document.querySelector(".footer");

  if (!heroTicket || !aboutSection || !footer) return;

  // Ensure hero-ticket is hidden at load / in the hero.
  gsap.set(heroTicket, { autoAlpha: 0 });

  // Define the leaf-like path once; Scrub will control progression.
  const leafTl = gsap.timeline();

  // Absolute transform values so behavior is deterministic
  leafTl
    .to(heroTicket, {
      y: 200,
      x: -40,
      rotation: -10,
      duration: 0.33,
      ease: "sine.inOut"
    })
    .to(heroTicket, {
      y: 460,
      x: -10,
      rotation: 12,
      duration: 0.33,
      ease: "sine.inOut"
    })
    .to(heroTicket, {
      y: 720,
      x: -30,
      rotation: 0,
      duration: 0.34,
      ease: "power2.out"
    });

  ScrollTrigger.create({
    animation: leafTl,
    trigger: aboutSection,
    start: "top bottom",   // when About first enters the viewport
    endTrigger: footer,
    end: "bottom bottom",
    scrub: true,

    // Entering the About→Footer band from above (scrolling down)
    onEnter: () => {
      // Reset transform baseline for a clean leaf path
      gsap.set(heroTicket, { x: 0, y: 0, rotation: 0 });

      if (ticketPeek) {
        const rect = ticketPeek.getBoundingClientRect();

        // Start hero-ticket where ticket-peek currently is
        gsap.set(heroTicket, {
          position: "fixed",
          top: rect.top,
          left: rect.left,
          right: "auto",
          bottom: "auto",
          zIndex: 9999
        });

        // Hide ticket-peek while leaf is active
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
          zIndex: 9999
        });
      }

      gsap.to(heroTicket, {
        autoAlpha: 1,
        duration: 0.2,
        ease: "power1.out"
      });
    },

    // Coming back into the About band from ABOVE (scrolling down again)
    onEnterBack: () => {
      // Same behavior as onEnter for deterministic feel
      gsap.set(heroTicket, { x: 0, y: 0, rotation: 0 });

      if (ticketPeek) {
        const rect = ticketPeek.getBoundingClientRect();

        gsap.set(heroTicket, {
          position: "fixed",
          top: rect.top,
          left: rect.left,
          right: "auto",
          bottom: "auto",
          zIndex: 9999
        });

        gsap.set(ticketPeek, {
          autoAlpha: 0,
          pointerEvents: "none"
        });
      } else {
        gsap.set(heroTicket, {
          position: "fixed",
          top: "120px",
          right: "8vw",
          left: "auto",
          zIndex: 9999
        });
      }

      gsap.to(heroTicket, {
        autoAlpha: 1,
        duration: 0.2,
        ease: "power1.out"
      });
    },

    // Leaving the About band back upwards toward the story panels
    onLeaveBack: () => {
      // Hide hero-ticket completely as soon as we're above About again
      gsap.to(heroTicket, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.set(heroTicket, {
            clearProps: "position,top,left,right,bottom,x,y,rotation,zIndex"
          });
        }
      });

      // Restore ticket-peek in the story section
      if (ticketPeek) {
        gsap.set(ticketPeek, {
          autoAlpha: 1,
          pointerEvents: "auto"
        });
      }
    }
  });
})();

// ------------------------------------------------------------------
// Performance boost
// ------------------------------------------------------------------
gsap.set(
  [
    ".hero-main-photo",
    ".hero-actions .btn",
    ".hero-sign",
    ".story-card img",
    ".vintage-sign",
    "#ticket-peek",
    "#hero-ticket"
  ],
  {
    willChange: "transform, opacity",
    force3D: true
  }
);
