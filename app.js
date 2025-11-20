gsap.registerPlugin(ScrollTrigger);

// Hero title lines + photo reveal
gsap.from(".line", {
  y: 180,
  rotation: 8,
  opacity: 0,
  duration: 1.4,
  ease: "power3.out",
  stagger: 0.15
});

gsap.to(".hero-main-photo", {
  scale: 1,
  duration: 2.8,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "+=300",
    scrub: 1
  }
});

gsap.to(".neon-glow", {
  opacity: 0.6,
  duration: 3,
  scrollTrigger: { trigger: "#hero", scrub: 1 }
});

// Vintage sign flicker
const flicker = () => {
  gsap.timeline({repeat: -1, repeatDelay: 4})
    .to(".vintage-sign", {opacity: 0.7, duration: 0.08})
    .to(".vintage-sign", {opacity: 1, duration: 0.1})
    .to(".vintage-sign", {opacity: 0.75, duration: 0.06})
    .to(".vintage-sign", {opacity: 1, duration: 0.2});
};
flicker();

// Horizontal story scroll (the money shot)
gsap.to(".story-track", {
  x: () => -(document.querySelector(".story-track").scrollWidth - window.innerWidth + 200),
  ease: "none",
  scrollTrigger: {
    trigger: "#story-panels",
    start: "top top",
    end: "+=300%",
    scrub: 1,
    pin: true,
    anticipatePin: 1
  }
});