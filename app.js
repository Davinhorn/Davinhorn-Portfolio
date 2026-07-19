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
  
  // Delayed safety checks for slower mobile font loading or rendering lags
  setTimeout(scaleTitleToFit, 400);
  setTimeout(scaleTitleToFit, 1000);
  setTimeout(scaleTitleToFit, 2000);
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
    "Design is how it works",
    "Less is more",
    "Form follows feeling",
    "Why am i here?",
    "What is life?",
    "Where do ideas go?",
    "Vibe is everything",
    "I love Nana",
    "Create to exist",
    "Nothing lasts forever",
    "Is this real?",
    "Simplicity is complex",
    "Trust the process",
    "Live in the details",
    "Are we dreaming?",
    "Enjoy the time"
  ];
  
  const fonts = ['Reenie Beanie', 'Caveat', 'Nothing You Could Do'];
  const activePhrases = new Set();
  
  // Grid layout parameters (5 columns, 4 rows)
  const gridCols = 5;
  const gridRows = 4;
  
  // Track occupied rows for each column: Map<colIndex, Set<rowIndex>>
  const occupiedByColumn = new Map();
  for (let c = 0; c < gridCols; c++) {
    occupiedByColumn.set(c, new Set());
  }
  
  function spawnScribble(col, row) {
    // Pick unique phrase
    let availablePhrases = phrases.filter(p => !activePhrases.has(p));
    if (availablePhrases.length === 0) {
      activePhrases.clear();
      availablePhrases = phrases;
    }
    const phrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    activePhrases.add(phrase);
    
    // Mark as occupied
    occupiedByColumn.get(col).add(row);
    
    const scribble = document.createElement('div');
    scribble.className = 'scribble';
    
    // Calculate cell layout positions
    const cellWidth = 84 / gridCols; // 16.8%
    const cellHeight = 74 / gridRows; // 18.5%
    
    const colLeft = 6 + (col * cellWidth);
    const rowTop = 8 + (row * cellHeight);
    
    // Add organic wiggling within the cell bounds to keep it casual
    const wiggleX = (Math.random() * 0.4 - 0.2) * cellWidth;
    const wiggleY = (Math.random() * 0.4 - 0.2) * cellHeight;
    
    const leftPercent = colLeft + (cellWidth / 2) + wiggleX;
    const topPercent = rowTop + (cellHeight / 2) + wiggleY;
    
    const rotation = -15 + Math.random() * 30; // -15deg to 15deg
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    
    let baseFontSize = 'clamp(1.5rem, 3vw, 3rem)';
    if (font === 'Reenie Beanie') {
      baseFontSize = 'clamp(2.2rem, 4.5vw, 5.5rem)';
    }
    
    scribble.style.position = 'absolute';
    scribble.style.top = `${topPercent}%`;
    scribble.style.left = `${leftPercent}%`;
    scribble.dataset.rotation = rotation;
    scribble.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    scribble.style.fontFamily = `'${font}'`;
    scribble.style.fontSize = baseFontSize;
    scribble.style.pointerEvents = 'auto';
    scribble.style.cursor = 'pointer';
    scribble.style.transition = 'color 0.2s, opacity 0.5s, transform 0.5s';
    
    // Build character spans for letter-by-letter writing animation
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
    const charInterval = 40 + Math.random() * 20; // 40ms to 60ms per character
    const spans = scribble.querySelectorAll('span');
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.transform = 'scale(1) translateY(0)';
      }, index * charInterval);
    });
    
    const typingDuration = spans.length * charInterval;
    const visibleDuration = 6000 + Math.random() * 7000; // Visible for 6-13s
    
    // Schedule character-by-character un-writing (erasing) and replacement spawn
    setTimeout(() => {
      const eraseInterval = 30; // 30ms per character for erasing
      
      // Erase spans one by one in reverse (right to left)
      for (let i = spans.length - 1; i >= 0; i--) {
        const revIndex = spans.length - 1 - i;
        setTimeout(() => {
          spans[i].style.opacity = '0';
          spans[i].style.transform = 'scale(0.85) translateY(4px)';
        }, revIndex * eraseInterval);
      }
      
      const eraseDuration = spans.length * eraseInterval;
      setTimeout(() => {
        scribble.remove();
        occupiedByColumn.get(col).delete(row);
        activePhrases.delete(phrase);
        
        // Find empty rows in this column to spawn replacement
        const emptyRows = [];
        for (let r = 0; r < gridRows; r++) {
          if (!occupiedByColumn.get(col).has(r)) {
            emptyRows.push(r);
          }
        }
        
        const nextRow = emptyRows.length > 0 
          ? emptyRows[Math.floor(Math.random() * emptyRows.length)]
          : row; // fallback
          
        // Spawn replacement in the same column
        spawnScribble(col, nextRow);
      }, eraseDuration + 100);
      
    }, typingDuration + visibleDuration);
  }
  
  // Build initial cell list: exactly 3 rows per column
  const initialCells = [];
  for (let c = 0; c < gridCols; c++) {
    // Pick 3 random rows out of {0, 1, 2, 3}
    const rows = [0, 1, 2, 3];
    rows.sort(() => Math.random() - 0.5);
    const chosenRows = rows.slice(0, 3);
    chosenRows.forEach(r => {
      initialCells.push({ col: c, row: r });
    });
  }
  
  // Shuffle initial cells so the spawn stagger is randomly distributed across the screen
  initialCells.sort(() => Math.random() - 0.5);
  
  initialCells.forEach((cell, index) => {
    setTimeout(() => {
      spawnScribble(cell.col, cell.row);
    }, index * 200); // Stagger initial text typing sequence
  }
  );
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
    const rot = scribble.dataset.rotation || '0';
    scribble.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1.15)`;
  });

  scribble.addEventListener('mouseleave', () => {
    scribble.style.color = '';
    const rot = scribble.dataset.rotation || '0';
    scribble.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
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


