import { gsap } from "gsap";

type AnimateParams = {
  target: string | Element;
  properties: Record<string, any>;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
};

// Utility function for GSAP animations
export const animate = ({
  target,
  properties,
  duration = 0.5,
  delay = 0,
  ease = "power2.out",
  stagger = 0,
}: AnimateParams) => {
  return gsap.to(target, {
    ...properties,
    duration,
    delay,
    ease,
    stagger,
  });
};

// Fade in animation
export const fadeIn = (target: string | Element, delay = 0, duration = 0.5) => {
  return animate({
    target,
    properties: { opacity: 1, y: 0 },
    duration,
    delay,
    ease: "power2.out",
  });
};

// Fade out animation
export const fadeOut = (target: string | Element, delay = 0, duration = 0.5) => {
  return animate({
    target,
    properties: { opacity: 0, y: 20 },
    duration,
    delay,
    ease: "power2.in",
  });
};

// Stagger animation for list items
export const staggerItems = (
  target: string | Element,
  delay = 0,
  duration = 0.5,
  stagger = 0.1
) => {
  return animate({
    target,
    properties: { opacity: 1, y: 0 },
    duration,
    delay,
    stagger,
  });
};

// Initialize animations for the home page
export const initHomeAnimations = () => {
  gsap.set(".animate-on-scroll", { opacity: 0, y: 30 });
  
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const isVisible = elementTop < window.innerHeight && elementBottom > 0;
      
      if (isVisible) {
        gsap.to(element, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      }
    });
  };
  
  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll(); // Trigger once on load
  
  return () => {
    window.removeEventListener("scroll", animateOnScroll);
  };
};
