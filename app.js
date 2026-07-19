/* ==========================================================================
   APP INTERACTIVITY - DAVIN HORN PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initHeroParallax();
  initDraggableCollage();
  initProjectTilt();
  initInteractiveScribbles();
  initActiveLinksOnScroll();
});

/* ==========================================================================
   1. CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Grow cursor on hoverable elements
  const hoverables = document.querySelectorAll('a, button, .work-card, .skill-pill, .drag-polaroid, .contact-btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

/* ==========================================================================
   2. HERO 3D PARALLAX EFFECT
   ========================================================================== */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const scribblesLayer = document.getElementById('scribbles-layer');
  const titleLayer = document.getElementById('title-layer');
  const portraitLayer = document.getElementById('portrait-layer');
  const portraitImg = document.getElementById('hero-portrait');

  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    // Calculate normalized offset from screen center (-1 to 1)
    const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    // Layer 1: Background Scribbles (moves with mouse, moderate movement)
    if (scribblesLayer) {
      scribblesLayer.style.transform = `translate(${xOffset * 30}px, ${yOffset * 30}px)`;
    }

    // Layer 2: Main Bold Title (moves opposite to mouse, tilts slightly)
    if (titleLayer) {
      const rotX = -yOffset * 6;
      const rotY = xOffset * 6;
      titleLayer.style.transform = `translate(calc(-50% + ${xOffset * -20}px), ${yOffset * -20}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // Layer 3: Portrait Cutout (moves with mouse, slight scale depth)
    if (portraitLayer) {
      // Must maintain the horizontal centering (-50% transform)
      portraitLayer.style.transform = `translate(calc(-50% + ${xOffset * 15}px), ${yOffset * 10}px) scale(1.02)`;
    }
  });

  // Reset layers on mouse leave
  hero.addEventListener('mouseleave', () => {
    if (scribblesLayer) scribblesLayer.style.transform = 'translate(0px, 0px)';
    if (titleLayer) titleLayer.style.transform = 'translate(-50%, 0px) rotateX(0deg) rotateY(0deg)';
    if (portraitLayer) portraitLayer.style.transform = 'translate(-50%, 0px) scale(1)';
  });
}

/* ==========================================================================
   3. DRAGGABLE POLAROIDS (ZINE STYLE COLLAGE)
   ========================================================================== */
function initDraggableCollage() {
  const draggables = document.querySelectorAll('.drag-polaroid');
  let activeZIndex = 50;

  draggables.forEach(draggable => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    // Extract initial rotations
    const id = draggable.id;
    const initialRot = id === 'polaroid-1' ? -6 : 5;

    draggable.addEventListener('pointerdown', (e) => {
      isDragging = true;
      draggable.style.cursor = 'grabbing';
      
      // Lift the dragged item to front
      activeZIndex += 1;
      draggable.style.zIndex = activeZIndex;

      // Get starting positions
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      
      draggable.setPointerCapture(e.pointerId);
    });

    draggable.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // Apply transform while preserving the original design rotation
      draggable.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${initialRot}deg)`;
    });

    draggable.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      draggable.style.cursor = 'grab';
      draggable.releasePointerCapture(e.pointerId);
    });

    draggable.addEventListener('pointercancel', () => {
      isDragging = false;
      draggable.style.cursor = 'grab';
    });
  });
}

/* ==========================================================================
   4. 3D CARD TILT FOR SELECTED WORK
   ========================================================================== */
function initProjectTilt() {
  const cards = document.querySelectorAll('.work-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside the card
      const y = e.clientY - rect.top;  // y coordinate inside the card
      
      const width = rect.width;
      const height = rect.height;

      // Calculate tilt angles based on cursor offset from card center (-10 to 10 degrees)
      const rotX = -((y - height / 2) / (height / 2)) * 8;
      const rotY = ((x - width / 2) / (width / 2)) * 8;

      // Apply perspective and tilt, maintaining neo-brutalist hover translate
      card.style.transform = `perspective(1000px) translate(-6px, -6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly reset card transform
      card.style.transform = 'perspective(1000px) translate(0px, 0px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* ==========================================================================
   5. INTERACTIVE BACKGROUND SCRIBBLES (EASTER EGGS)
   ========================================================================== */
function initInteractiveScribbles() {
  const scribbles = document.querySelectorAll('.scribble');

  const messages = [
    "You found me!",
    "Life is code.",
    "Aesthetics matter.",
    "Wait, is this a dream?",
    "Keep scrolling!",
    "Streetwear is a lifestyle.",
    "Made with love in 2026."
  ];

  scribbles.forEach(scribble => {
    scribble.style.pointerEvents = 'auto'; // Enable pointer events so users can hover/click
    scribble.style.cursor = 'pointer';

    // Wiggle and pop opacity on hover
    scribble.addEventListener('mouseenter', () => {
      scribble.style.color = '#4f46e5'; // Indigo color highlight
      scribble.style.opacity = '1.0';
      scribble.style.transition = 'color 0.2s, opacity 0.2s, transform 0.2s';
      const currentTransform = scribble.style.transform;
      scribble.style.transform = `${currentTransform} scale(1.15)`;
    });

    scribble.addEventListener('mouseleave', () => {
      scribble.style.color = ''; // Reset color
      scribble.style.opacity = ''; // Reset opacity
      const cleanTransform = scribble.style.transform.replace(' scale(1.15)', '');
      scribble.style.transform = cleanTransform;
    });

    // Spawn a temporary popup bubble when clicked
    scribble.addEventListener('click', (e) => {
      // Prevent bubble stacking
      const existingBubble = document.querySelector('.scribble-bubble');
      if (existingBubble) existingBubble.remove();

      const bubble = document.createElement('div');
      bubble.className = 'scribble-bubble';
      
      // Random message select
      const randomText = messages[Math.floor(Math.random() * messages.length)];
      bubble.textContent = randomText;

      // Position bubble relative to clicked screen coordinates
      bubble.style.position = 'fixed';
      bubble.style.left = `${e.clientX}px`;
      bubble.style.top = `${e.clientY - 40}px`;
      bubble.style.backgroundColor = '#0c0c0c';
      bubble.style.color = '#faf9f5';
      bubble.style.padding = '0.5rem 1rem';
      bubble.style.fontSize = '0.85rem';
      bubble.style.fontWeight = 'bold';
      bubble.style.borderRadius = '4px';
      bubble.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
      bubble.style.zIndex = '999';
      bubble.style.transform = 'translate(-50%, -10px)';
      bubble.style.pointerEvents = 'none';
      bubble.style.transition = 'opacity 0.4s, transform 0.4s';
      
      document.body.appendChild(bubble);

      // Animate bubble entry
      requestAnimationFrame(() => {
        bubble.style.transform = 'translate(-50%, 0)';
      });

      // Remove after 1.5 seconds
      setTimeout(() => {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translate(-50%, -10px)';
        setTimeout(() => bubble.remove(), 400);
      }, 1500);
    });
  });
}

/* ==========================================================================
   6. SCROLL SPY - ACTIVE LINKS HIGHLIGHT
   ========================================================================== */
function initActiveLinksOnScroll() {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 250)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active-nav');
      // Highlight matching item
      if (item.getAttribute('href') === `#${current}`) {
        item.style.color = '#4f46e5'; // Indigo color highlight
      } else {
        item.style.color = '';
      }
    });
  });
}
