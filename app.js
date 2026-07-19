/* ==========================================================================
   APP INTERACTIVITY - DAVIN HORN PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initHeroParallax();
  initDraggableCollage();
  initProjectTilt();
  initDynamicScribbles();
  
  // Dynamic typography scale
  scaleTitleToFit();
  window.addEventListener('resize', scaleTitleToFit);
  window.addEventListener('load', scaleTitleToFit);
  if (document.fonts) {
    document.fonts.ready.then(scaleTitleToFit);
  }
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
   5. DYNAMIC BACKGROUND SCRIBBLES & INTERACTIVITY
   ========================================================================== */
function initDynamicScribbles() {
  const container = document.getElementById('scribbles-layer');
  if (!container) return;
  
  // Clear any existing elements
  container.innerHTML = '';
  
  const phrases = [
    "What is reality?",
    "I love her",
    "Mom's favorite developer",
    "CSS is my passion (help)",
    "Will code for sneakers",
    "Why am i here?",
    "What is life?",
    "Are you looking at my face?",
    "Sleep is for compile times",
    "I love Nana",
    "hehe boi",
    "Built with caffeine & vibes",
    "Insert cool quote here",
    "Peak human",
    "This is not a template, mom",
    "This portfolio sucks",
    "No cookies, only vibes",
    "Enjoy the time"
  ];
  
  const fonts = ['Reenie Beanie', 'Caveat', 'Nothing You Could Do'];
  let activeScribbles = [];
  
  function createScribbleElement(phrase) {
    const scribble = document.createElement('div');
    scribble.className = 'scribble';
    
    // Position outside center zone (where title & portrait sit)
    const isLeft = Math.random() > 0.5;
    const leftPercent = isLeft 
      ? (4 + Math.random() * 20)
      : (72 + Math.random() * 20);
    const topPercent = 8 + Math.random() * 76;
    const rotation = -15 + Math.random() * 30;
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    
    let baseFontSize = 'clamp(1.5rem, 3vw, 3rem)';
    if (font === 'Reenie Beanie') {
      baseFontSize = 'clamp(2.2rem, 4.5vw, 5.5rem)';
    }
    
    scribble.style.position = 'absolute';
    scribble.style.top = `${topPercent}%`;
    scribble.style.left = `${leftPercent}%`;
    scribble.style.transform = `rotate(${rotation}deg)`;
    scribble.style.fontFamily = `'${font}'`;
    scribble.style.fontSize = baseFontSize;
    scribble.style.pointerEvents = 'auto';
    scribble.style.cursor = 'pointer';
    scribble.style.transition = 'color 0.2s, opacity 0.5s, transform 0.5s';
    
    // Split into character spans for letter-by-letter writing animation
    const chars = phrase.split('');
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'scale(0.85) translateY(4px)';
      span.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
      scribble.appendChild(span);
    });
    
    container.appendChild(scribble);
    initSingleScribbleInteractivity(scribble);
    
    // Character typing reveal
    const charInterval = 40 + Math.random() * 20;
    const spans = scribble.querySelectorAll('span');
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.transform = 'scale(1) translateY(0)';
      }, index * charInterval);
    });
    
    return scribble;
  }
  
  // Spawn all 17 initial phrases (leaving 1 out of play for the cycle pool)
  const initialPhrases = [...phrases];
  initialPhrases.sort(() => Math.random() - 0.5);
  
  initialPhrases.forEach((phrase, index) => {
    setTimeout(() => {
      const scribbleEl = createScribbleElement(phrase);
      activeScribbles.push({ element: scribbleEl, phrase: phrase });
    }, index * 180); // Stagger initial writing across the canvas
  });
  
  // Start the cyclical fade-out / fade-in spawner once initial spawn completes
  const loopStartDelay = (initialPhrases.length * 180) + 3000;
  
  setTimeout(() => {
    setInterval(() => {
      if (activeScribbles.length === 0) return;
      
      // Select random active scribble to remove
      const removeIndex = Math.floor(Math.random() * activeScribbles.length);
      const removed = activeScribbles.splice(removeIndex, 1)[0];
      
      const scribbleEl = removed.element;
      const rotationMatch = scribbleEl.style.transform.match(/rotate\(([^)]+)\)/);
      const rot = rotationMatch ? rotationMatch[0] : '';
      
      // Fade out
      scribbleEl.style.opacity = '0';
      scribbleEl.style.transform = `${rot} scale(0.92)`;
      
      setTimeout(() => {
        scribbleEl.remove();
      }, 500);
      
      // Pick a phrase that is NOT currently visible on screen
      const currentVisiblePhrases = activeScribbles.map(s => s.phrase);
      const available = phrases.filter(p => !currentVisiblePhrases.includes(p));
      const newPhrase = available[Math.floor(Math.random() * available.length)];
      
      // Spawn new scribble in a new random coordinate after fade-out completes
      setTimeout(() => {
        const newScribbleEl = createScribbleElement(newPhrase);
        activeScribbles.push({ element: newScribbleEl, phrase: newPhrase });
      }, 600);
      
    }, 3200); // Cycle one phrase every 3.2 seconds
  }, loopStartDelay);
}

function initSingleScribbleInteractivity(scribble) {
  const messages = [
    "You found me!",
    "Life is code.",
    "Aesthetics matter.",
    "Wait, is this a dream?",
    "Keep scrolling!",
    "Streetwear is a lifestyle.",
    "Made with love in 2026."
  ];

  scribble.addEventListener('mouseenter', () => {
    scribble.style.color = '#4f46e5';
    const match = scribble.style.transform.match(/rotate\(([^)]+)\)/);
    const rot = match ? match[0] : '';
    scribble.style.transform = `${rot} scale(1.15)`;
  });

  scribble.addEventListener('mouseleave', () => {
    scribble.style.color = '';
    const match = scribble.style.transform.match(/rotate\(([^)]+)\)/);
    const rot = match ? match[0] : '';
    scribble.style.transform = rot;
  });

  scribble.addEventListener('click', (e) => {
    const existing = document.querySelector('.scribble-bubble');
    if (existing) existing.remove();

    const bubble = document.createElement('div');
    bubble.className = 'scribble-bubble';
    bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
    
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
    requestAnimationFrame(() => {
      bubble.style.transform = 'translate(-50%, 0)';
    });

    setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translate(-50%, -10px)';
      setTimeout(() => bubble.remove(), 400);
    }, 1500);
  });
}

/* ==========================================================================
   6. DYNAMIC FONT SCALING (FIT TITLE TO BOX)
   ========================================================================== */
function scaleTitleToFit() {
  const title = document.querySelector('.hero-title');
  const container = document.querySelector('.hero-title-container');
  if (!title || !container) return;
  
  title.style.fontSize = '100px';
  const textWidth = title.offsetWidth;
  const containerWidth = container.offsetWidth;
  if (textWidth === 0 || containerWidth === 0) return;
  
  const targetFontSize = (containerWidth / textWidth) * 100;
  title.style.fontSize = `${targetFontSize}px`;
}


