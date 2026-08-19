// Helper to compute dynamic viewport heights for mobile devices, bypassing browser UI bar clips
function setMobileViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

document.addEventListener('DOMContentLoaded', () => {
  // Handle Loading Screen (Only on initial load of Homepage)
  const initialPath = window.location.pathname.replace(/^\/|\/$/g, '');
  if (initialPath === '' || initialPath === 'index.html') {
    const startLoadingReveal = () => {
      scaleTitleToFit();
      document.body.classList.add('fonts-loaded');
      
      // Start the original 2.5s countdown
      setTimeout(() => {
        document.body.classList.remove('app-loading');
      }, 2500);
    };

    if (document.fonts) {
      document.fonts.ready.then(startLoadingReveal).catch(startLoadingReveal);
    } else {
      startLoadingReveal();
    }
  } else {
    document.body.classList.remove('app-loading');
  }

  initCustomCursor();
  initHeroParallax();
  initDraggableCollage();
  initProjectTilt();
  initDynamicScribbles();
  initMinimalistVideoPlayer();
  initImageLightbox();
  initAdminPanel();
  
  // Set initial dynamic viewport height
  setMobileViewportHeight();
  
  // Dynamic typography scale
  scaleTitleToFit();
  
  // Resize and layout change listeners
  let prevWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Only recalculate sizes if screen width changes (ignores vertical browser bar collapses)
    if (window.innerWidth !== prevWidth) {
      prevWidth = window.innerWidth;
      scaleTitleToFit();
      setMobileViewportHeight();
    }
  });
  window.addEventListener('orientationchange', () => {
    // Wait briefly for rotation layouts to settle before scaling
    setTimeout(() => {
      prevWidth = window.innerWidth;
      scaleTitleToFit();
      setMobileViewportHeight();
    }, 150);
  });
  window.addEventListener('load', () => {
    scaleTitleToFit();
    setMobileViewportHeight();
  });
  
  if (document.fonts) {
    document.fonts.ready.then(scaleTitleToFit);
  }
  
  // Delayed safety checks for slower mobile font loading or rendering lags
  setTimeout(scaleTitleToFit, 400);
  setTimeout(scaleTitleToFit, 1000);
  setTimeout(scaleTitleToFit, 2000);

  // Initialize device-specific gyroscope states
  window.isAboutMeTappable = false;
  window.aboutMeFadeTimeout = null;
  window.aboutMeRevealTimeout = null;
  initAboutPagination();

  // Initialize SPA Router and interactive navigation elements
  initNavigationInteractions();
  initSpaRouter();
  
  // Start glitch interval for footer static signature
  initFooterGlitch();
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
function applyParallax(xOffset, yOffset) {
  const scribblesLayer = document.getElementById('scribbles-layer');
  const titleLayer = document.getElementById('title-layer');
  const portraitLayer = document.getElementById('portrait-layer');
  const footerLayer = document.querySelector('.hero-footer');
  
  // Layer 1: Background Scribbles (moderate motion)
  if (scribblesLayer) {
    scribblesLayer.style.transform = `translate(${xOffset * 30}px, ${yOffset * 30}px)`;
  }

  // Layer 2: Main Bold Title and Nav Layer (moves opposite, tilts slightly)
  if (titleLayer) {
    const rotX = -yOffset * 6;
    const rotY = xOffset * 6;
    const transformStr = `translate(${xOffset * -20}px, ${yOffset * -20}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    titleLayer.style.transform = transformStr;
    const navLayer = document.getElementById('nav-layer');
    if (navLayer) {
      navLayer.style.transform = transformStr;
    }
  }

  // Layer 3: Portrait Cutout (slight scaling shift)
  if (portraitLayer) {
    portraitLayer.style.transform = `translate(${xOffset * 15}px, ${yOffset * 10}px) scale(1.02)`;
  }

  // Layer 4: Foreground footer elements (Moving in lockstep with title and subtitle)
  // Preserves translateX(-50%) centering layout rule
  if (footerLayer) {
    footerLayer.style.transform = `translateX(-50%) translate(${xOffset * -15}px, ${yOffset * -10}px)`;
  }
}

function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Track mouse coordinates globally on window to prevent interruptions when hovering overlay elements
  window.addEventListener('mousemove', (e) => {
    // Only track if on homepage (body does not have homepage-inactive) and not on mobile viewports
    if (document.body.classList.contains('homepage-inactive')) return;
    if (window.innerWidth <= 767) return;
    
    const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    applyParallax(xOffset, yOffset);
  });

  // Reset layers when cursor leaves the window entirely
  document.addEventListener('mouseleave', () => {
    if (window.innerWidth <= 767) return;
    const scribblesLayer = document.getElementById('scribbles-layer');
    const titleLayer = document.getElementById('title-layer');
    const navLayer = document.getElementById('nav-layer');
    const portraitLayer = document.getElementById('portrait-layer');
    const footerLayer = document.querySelector('.hero-footer');
    if (scribblesLayer) scribblesLayer.style.transform = 'translate(0px, 0px)';
    if (titleLayer) titleLayer.style.transform = 'translate(0px, 0px) rotateX(0deg) rotateY(0deg)';
    if (navLayer) navLayer.style.transform = 'translate(0px, 0px) rotateX(0deg) rotateY(0deg)';
    if (portraitLayer) portraitLayer.style.transform = 'translate(0px, 0px) scale(1)';
    if (footerLayer) footerLayer.style.transform = 'translateX(-50%) translate(0px, 0px)';
  });

  // Gyroscope / Tilt tracking on mobile devices
  if (window.DeviceOrientationEvent) {
    let baselineBeta = null;
    let baselineGamma = null;
    const recentReadings = [];
    const WINDOW_DURATION = 1000; // 1 second sliding window
    const STATIONARY_THRESHOLD = 0.8; // degrees of change to detect holding steady

    function handleOrientation(e) {
      const beta = e.beta; // Tilt front-to-back: -180 to 180
      const gamma = e.gamma; // Tilt left-to-right: -90 to 90
      
      if (beta === null || gamma === null) return;
      
      const now = Date.now();
      
      // Capture initial hold orientation as baseline
      if (baselineBeta === null) {
        baselineBeta = beta;
        baselineGamma = gamma;
      }
      
      // Add current reading to history
      recentReadings.push({ beta, gamma, timestamp: now });
      
      // Remove readings older than the window duration
      while (recentReadings.length > 0 && now - recentReadings[0].timestamp > WINDOW_DURATION) {
        recentReadings.shift();
      }
      
      // Calculate range of movement (max - min) over the window
      let minBeta = beta, maxBeta = beta;
      let minGamma = gamma, maxGamma = gamma;
      
      for (let i = 0; i < recentReadings.length; i++) {
        const r = recentReadings[i];
        if (r.beta < minBeta) minBeta = r.beta;
        if (r.beta > maxBeta) maxBeta = r.beta;
        if (r.gamma < minGamma) minGamma = r.gamma;
        if (r.gamma > maxGamma) maxGamma = r.gamma;
      }
      
      const rangeBeta = maxBeta - minBeta;
      const rangeGamma = maxGamma - minGamma;
      
      // If the device is held steady (movement range < threshold over the last 1s),
      // reset the baseline orientation to the current orientation.
      const portraitOverlay = document.querySelector('.portrait-overlay');
      
      if (rangeBeta < STATIONARY_THRESHOLD && rangeGamma < STATIONARY_THRESHOLD) {
        baselineBeta = beta;
        baselineGamma = gamma;
        
        // Cancel any pending reveal timer if device stopped tilting
        if (window.aboutMeRevealTimeout) {
          clearTimeout(window.aboutMeRevealTimeout);
          window.aboutMeRevealTimeout = null;
        }

        // Device is steady. Start the 1s fade-out timer for About Me trigger
        if (window.isAboutMeTappable && !window.aboutMeFadeTimeout) {
          window.aboutMeFadeTimeout = setTimeout(() => {
            if (portraitOverlay) portraitOverlay.classList.remove('mobile-visible');
            window.isAboutMeTappable = false;
            window.aboutMeFadeTimeout = null;
          }, 1000);
        }
      } else {
        // Device is actively tilting!
        if (window.aboutMeFadeTimeout) {
          clearTimeout(window.aboutMeFadeTimeout);
          window.aboutMeFadeTimeout = null;
        }
        
        // Appear after a 1.5-second delay when tilting is detected
        if (portraitOverlay && !portraitOverlay.classList.contains('mobile-visible') && !window.aboutMeRevealTimeout) {
          window.aboutMeRevealTimeout = setTimeout(() => {
            portraitOverlay.classList.add('mobile-visible');
            window.isAboutMeTappable = true;
            window.aboutMeRevealTimeout = null;
          }, 1500);
        }
      }
      
      // Calculate shifts relative to baseline
      let deltaBeta = beta - baselineBeta;
      let deltaGamma = gamma - baselineGamma;
      
      // Clamp to ±15 degrees limit
      deltaBeta = Math.max(-15, Math.min(15, deltaBeta));
      deltaGamma = Math.max(-15, Math.min(15, deltaGamma));
      
      // Map to scale (-1 to 1)
      const xOffset = deltaGamma / 15;
      const yOffset = deltaBeta / 15;
      
      applyParallax(xOffset, yOffset);
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Gated request for iOS 13+ devices
      document.addEventListener('click', function requestGyro() {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
        document.removeEventListener('click', requestGyro);
      }, { once: true });
    } else {
      // Android / Other mobile browsers
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }
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
  
  // Responsive grid layout settings to ensure even distribution and prevent overlaps
  const isMobile = window.innerWidth < 768;
  const gridCols = isMobile ? 2 : 5;
  const gridRows = isMobile ? 4 : 4;
  const activeScribblesPerCol = 3;
  
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
    const cellWidth = 84 / gridCols;
    const cellHeight = 74 / gridRows;
    
    const colLeft = 6 + (col * cellWidth);
    const rowTop = 8 + (row * cellHeight);
    
    // Add organic wiggling within the cell bounds to keep it casual
    const wiggleX = (Math.random() * 0.4 - 0.2) * cellWidth;
    const wiggleY = (Math.random() * 0.4 - 0.2) * cellHeight;
    
    const leftPercent = colLeft + (cellWidth / 2) + wiggleX;
    const topPercent = rowTop + (cellHeight / 2) + wiggleY;
    
    const rotation = -15 + Math.random() * 30; // -15deg to 15deg
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    
    let baseFontSize = isMobile ? 'clamp(2.5rem, 7.0vw, 5.0rem)' : 'clamp(1.6rem, 2.5vw, 2.8rem)';
    if (font === 'Reenie Beanie') {
      baseFontSize = isMobile ? 'clamp(4.2rem, 10vw, 9.0rem)' : 'clamp(2.2rem, 4.0vw, 4.5rem)';
    }
    
    scribble.style.position = 'absolute';
    scribble.style.top = `${topPercent}%`;
    scribble.style.left = `${leftPercent}%`;
    scribble.dataset.rotation = rotation;
    scribble.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    scribble.style.fontFamily = `'${font}'`;
    scribble.style.fontSize = baseFontSize;
    scribble.style.pointerEvents = isMobile ? 'none' : 'auto';
    scribble.style.cursor = 'default';
    scribble.style.transition = 'opacity 0.5s, transform 0.5s';
    
    // Build character spans for letter-by-letter writing animation
    const chars = phrase.split('');
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'scale(0.85) translateY(4px)';
      span.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out, color 0.4s ease-in-out';
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
    const rows = [];
    for (let r = 0; r < gridRows; r++) rows.push(r);
    rows.sort(() => Math.random() - 0.5);
    const chosenRows = rows.slice(0, activeScribblesPerCol);
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
  });
}

function initSingleScribbleInteractivity(scribble) {
  // Disallowed hover interactions on scribbles
}

/* ==========================================================================
   6. DYNAMIC FONT SCALING (FIT TITLE TO BOX)
   ========================================================================== */
function scaleTitleToFit() {
  const titles = document.querySelectorAll('.hero-title');
  const container = document.querySelector('.hero-title-container');
  const stamp = document.querySelector('.portfolio-stamp');
  const rnLetters = document.querySelector('.rn-letters');
  const ornLetters = document.querySelector('.orn-letters');
  
  if (titles.length === 0 || !container) return;
  
  // 1. Scale main title copy to container width
  const primaryTitle = titles[0];
  primaryTitle.style.fontSize = '100px';
  const textWidth = primaryTitle.offsetWidth;
  const containerWidth = container.offsetWidth;
  if (textWidth === 0 || containerWidth === 0) return;
  
  const targetFontSize = (containerWidth / textWidth) * 100;
  titles.forEach(t => {
    t.style.fontSize = `${targetFontSize}px`;
  });
  
  // 2. Scale PORTFOLIO stamp to match the exact layout width of "RN" (desktop) or "ORN" (mobile)
  if (stamp) {
    const isMobile = window.innerWidth <= 767;
    const targetSpan = (isMobile && ornLetters) ? ornLetters : rnLetters;
    
    if (targetSpan) {
      const targetSpanWidth = targetSpan.offsetWidth;
      stamp.style.fontSize = '100px';
      const stampWidth = stamp.offsetWidth;
      
      if (stampWidth > 0 && targetSpanWidth > 0) {
        const targetStampFontSize = (targetSpanWidth / stampWidth) * 100;
        stamp.style.fontSize = `${targetStampFontSize}px`;
      }
    }
  }
}

/* ==========================================================================
   7. CLIENT SIDE SPA ROUTING & DYNAMIC PAGES
   ========================================================================== */
const categoryData = {
  graphicdesign: {
    title: "Graphic Design",
    projects: [
      { num: "01", tag: "POSTER", title: "Streetwear Campaign", desc: "A series of high-contrast typographic posters for a retro-futuristic streetwear brand.", tags: ["Photoshop", "Illustrator", "Print"] },
      { num: "02", tag: "ZINE", title: "Cyber-Brutalist Zine", desc: "A printed zine exploring raw textures, scanned imagery, and bold neo-brutalist layouts.", tags: ["Indesign", "Graphic Layout", "Riso"] },
      { num: "03", tag: "IDENTITY", title: "Krypton Tech Identity", desc: "Visual identity design, logo design, and brand styling for a decentralised tech startup.", tags: ["Vector", "Figma", "Branding"] }
    ]
  },
  videoproduction: {
    title: "Video Production",
    projects: [
      { num: "01", tag: "CAMPAIGN", title: "ICAUR V23: Stop Oil, Start iCAUR", desc: "Video production and creative direction for the iCAUR V23 campaign.", video: "assets/videos/1.mp4", thumb: "assets/videos/thumb-1.jpg", tags: ["Directing", "Video Production", "Campaign"] },
      { num: "02", tag: "PR VIDEO", title: "Chery Cambodia PR Video", desc: "PR video production and filming for Chery Cambodia.", video: "assets/videos/2.mp4", thumb: "assets/videos/thumb-2.jpg", tags: ["PR Video", "Commercial", "Cinematography"] },
      { num: "03", tag: "PROMO", title: "Hyundai Venue 2026", desc: "Promotional video production for the Hyundai Venue 2026.", video: "assets/videos/3.mp4", thumb: "assets/videos/thumb-3.jpg", tags: ["Automotive", "Commercial", "Video Production"] },
      { num: "04", tag: "PROMO", title: "Tiggo 2 Pro Max KNY", desc: "Commercial and promotional video for Tiggo 2 Pro Max KNY.", video: "assets/videos/4.mp4", thumb: "assets/videos/thumb-4.jpg", tags: ["Automotive", "PR Video", "Commercial"] }
    ]
  },
  sounddesign: {
    title: "Sound Design",
    projects: [
      { num: "01", tag: "AUDIO", title: "iCAUR V23: Born to Play", desc: "Custom sound design and audio composition for iCAUR V23.", tags: ["Sound Design", "Audio Composition", "Foley"] },
      { num: "02", tag: "MEDIA", title: "Basement Club: Contents", desc: "Sound design and audio mixing for Basement Club media contents.", tags: ["Sound Design", "Audio Mixing", "Media"] }
    ]
  },
  uxui: {
    title: "UX/UI Design",
    projects: [
      { num: "01", tag: "FOOD & MEMBERSHIP", title: "Basement Club", desc: "Food ordering website with membership system and more. Collaborative work.", url: "https://basementclubpp.com", thumb: "assets/images/basementclubweb.png", tags: ["Food Ordering", "Membership System", "Collaborative Work"] },
      { num: "02", tag: "TRAVEL AGENCY", title: "Chantrea Travel", desc: "Travel agency website. Created and developed independently.", url: "https://chantreatravel.com", thumb: "assets/images/chantreaweb.png", tags: ["Travel Agency", "Solo Project", "Web Design"] },
      { num: "03", tag: "LIFESTYLE COACHING", title: "Echtventure", desc: "Website for lifestyle coaching. Collaborative work.", url: "https://echtventure.com", thumb: "assets/images/echtweb.png", tags: ["Lifestyle Coaching", "Collaborative Work", "Web Design"] }
    ]
  },
  branding: {
    title: "Branding",
    projects: [
      { num: "01", tag: "IDENTITY", title: "Basement Club", desc: "Comprehensive brand identity and visual styling for Basement Club.", route: "branding/basementclub", tags: ["Brand Identity", "Visual System", "Branding"] },
      { num: "02", tag: "IDENTITY", title: "MR.JJAJANG", desc: "Brand identity, logo design, and visual concept for MR.JJAJANG.", route: "branding/mrjjajang", tags: ["Logo Design", "Brand Identity", "Visual Concept"] },
      { num: "03", tag: "IDENTITY", title: "Chantrea Travel", desc: "Brand identity design, logo assets, and visual design system for Chantrea Travel.", route: "branding/chantreatravel", tags: ["Brand Identity", "Travel Branding", "Visual Assets"] }
    ]
  }
};

const brandingSubData = {
  "branding/basementclub": {
    title: "Basement Club",
    tag: "BRAND IDENTITY & SYSTEM",
    num: "01",
    overview: "Basement Club is a premier culinary and night-life venue in Phnom Penh. The brand identity balances high-contrast brutalist typography with refined hospitality aesthetics, capturing the raw energy of urban street culture.",
    specs: {
      industry: "Hospitality & Nightlife",
      deliverables: "Logo System, Typography, Packaging, Social Assets",
      typography: "Bebas Neue / Outfit / Custom Lettering",
      colors: [
        { hex: "#0C0C0C", name: "Obsidian" },
        { hex: "#4F46E5", name: "Electric Indigo" },
        { hex: "#FAF9F5", name: "Raw Cream" }
      ]
    },
    strategy: "The visual system was engineered to feel bold, industrial, and high-energy. Key brand touchpoints include custom food packaging, digital menu systems, staff apparel, and physical venue signage."
  },
  "branding/mrjjajang": {
    title: "MR.JJAJANG",
    tag: "LOGO & BRAND CONCEPT",
    num: "02",
    overview: "MR.JJAJANG is an authentic Korean-Chinese restaurant brand. The branding combines playfulness with traditional culinary roots, using vibrant graphic shapes, distinctive mascot motifs, and bold storefront graphics.",
    specs: {
      industry: "Food & Beverage",
      deliverables: "Logo Design, Packaging, Storefront Graphics, Menu Layouts",
      typography: "Anton / Outfit",
      colors: [
        { hex: "#E63946", name: "Chili Red" },
        { hex: "#1D3557", name: "Deep Navy" },
        { hex: "#F1FAEE", name: "Soft Pearl" }
      ]
    },
    strategy: "Focusing on memorable dining experiences, the identity leverages energetic colors and high-impact graphic locks to establish instant recognition across delivery platforms and physical store locations."
  },
  "branding/chantreatravel": {
    title: "Chantrea Travel",
    tag: "TRAVEL & LIFESTYLE BRANDING",
    num: "03",
    overview: "Chantrea Travel is a luxury travel and eco-tourism platform. The visual identity reflects serene landscapes, organic minimalism, and modern travel aesthetics.",
    specs: {
      industry: "Travel & Tourism",
      deliverables: "Brand Identity, Itinerary Templates, Digital Assets, Style Guide",
      typography: "Outfit / Reenie Beanie / Sans Serif",
      colors: [
        { hex: "#2A9D8F", name: "Emerald Earth" },
        { hex: "#E9C46A", name: "Sun Sand" },
        { hex: "#264653", name: "Deep Ocean" }
      ]
    },
    strategy: "Built around inspiring wanderlust and seamless travel planning, the brand system uses clean line art, serene color palettes, and elegant typography to resonate with modern global travelers."
  }
};

function initSpaRouter() {
  function handleRouting() {
    const rawPath = window.location.pathname;
    const path = rawPath.replace(/^\/|\/$/g, '');
    
    // Deactivate all secondary views
    document.querySelectorAll('.page-secondary').forEach(page => {
      page.classList.remove('active');
    });
    
    // Reset About Me layouts
    document.body.classList.remove('about-active');
    const aboutPanel = document.getElementById('about-content-panel');
    if (aboutPanel) aboutPanel.classList.remove('active');
    if (typeof resetAboutPagination === 'function') resetAboutPagination();
    
    // Reset gyroscope tilt timeouts
    if (window.aboutMeRevealTimeout) {
      clearTimeout(window.aboutMeRevealTimeout);
      window.aboutMeRevealTimeout = null;
    }
    if (window.aboutMeFadeTimeout) {
      clearTimeout(window.aboutMeFadeTimeout);
      window.aboutMeFadeTimeout = null;
    }
    const portraitOverlay = document.querySelector('.portrait-overlay');
    if (portraitOverlay) portraitOverlay.classList.remove('mobile-visible');
    window.isAboutMeTappable = false;
    
    // Reset Home layout
    document.body.classList.remove('homepage-inactive');
    
    // Close any open dropdowns
    if (typeof closeAllDropdowns === 'function') closeAllDropdowns();
    
    if (path === '' || path === 'index.html') {
      // Home page is active, no additional action needed
    } else if (path === 'adminnn') {
      // Open Admin control page for Graphic Design gallery management
      const adminPage = document.getElementById('page-admin');
      if (adminPage) adminPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
      if (typeof renderAdminItemList === 'function') renderAdminItemList();
    } else if (path === 'contact') {
      // Open contact page
      const contactPage = document.getElementById('page-contact');
      if (contactPage) contactPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
    } else if (path === 'aboutme') {
      // Open About Me layout
      document.body.classList.add('about-active');
      if (aboutPanel) aboutPanel.classList.add('active');
    } else if (path === 'graphicdesign') {
      // Populate Graphic Design Bento Grid Gallery
      const catTitle = document.getElementById('category-title');
      if (catTitle) catTitle.textContent = "GRAPHIC DESIGN";
      
      const grid = document.getElementById('category-project-grid');
      if (grid) {
        renderGraphicDesignBentoGrid(grid);
      }
      
      const categoryPage = document.getElementById('page-category');
      if (categoryPage) categoryPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
    } else if (brandingSubData[path]) {
      // Render Branding Sub-Route Detail View
      const sub = brandingSubData[path];
      const detailTitle = document.getElementById('detail-title');
      if (detailTitle) detailTitle.textContent = sub.title;
      
      const detailBody = document.getElementById('detail-content-body');
      if (detailBody) {
        detailBody.innerHTML = `
          <div class="detail-hero-frame">
            <div class="detail-hero-glow"></div>
            <div class="detail-hero-top">
              <span class="detail-tag">${sub.tag}</span>
              <span class="detail-badge">${sub.num}</span>
            </div>
            <div class="detail-hero-bottom">
              <h1 class="detail-main-title">${sub.title}</h1>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-section-title">OVERVIEW & CONCEPT</h4>
            <p class="detail-body-text">${sub.overview}</p>
          </div>

          <div class="detail-section">
            <h4 class="detail-section-title">BRAND SPECIFICATIONS & SYSTEM</h4>
            <div class="brand-specs-grid">
              <div class="spec-card">
                <div class="spec-title">Industry</div>
                <div class="spec-value">${sub.specs.industry}</div>
              </div>
              <div class="spec-card">
                <div class="spec-title">Deliverables</div>
                <div class="spec-value">${sub.specs.deliverables}</div>
              </div>
              <div class="spec-card">
                <div class="spec-title">Typography System</div>
                <div class="spec-value">${sub.specs.typography}</div>
              </div>
              <div class="spec-card">
                <div class="spec-title">Color Palette</div>
                <div class="swatch-group">
                  ${sub.specs.colors.map(c => `
                    <div class="swatch-item" title="${c.name} (${c.hex})">
                      <div class="swatch-box" style="background-color: ${c.hex};"></div>
                      <span class="swatch-label">${c.name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-section-title">STRATEGY & EXECUTION</h4>
            <p class="detail-body-text">${sub.strategy}</p>
          </div>
        `;
      }
      
      const detailPage = document.getElementById('page-detail');
      if (detailPage) detailPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
    } else if (categoryData[path]) {
      // Populate category page content
      const cat = categoryData[path];
      const catTitle = document.getElementById('category-title');
      if (catTitle) catTitle.textContent = cat.title;
      
      const grid = document.getElementById('category-project-grid');
      if (grid) {
        grid.innerHTML = '';
        
          cat.projects.forEach(proj => {
            const isExternal = !!proj.url;
            const isInternalRoute = !!proj.route;
            const isVideo = !!proj.video;
            
            const card = document.createElement(isExternal ? 'a' : 'div');
            card.className = 'work-card';
            
            if (isExternal) {
              card.href = proj.url;
              card.target = '_blank';
              card.rel = 'noopener noreferrer';
            } else if (isInternalRoute) {
              card.setAttribute('data-route', proj.route);
            } else if (isVideo) {
              card.setAttribute('data-video', proj.video);
              card.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof openMinimalistVideoPlayer === 'function') {
                  openMinimalistVideoPlayer(proj.video, proj.title);
                }
              });
            }

            let cardImageWrapper = '';
            if (proj.thumb) {
              const overlayContent = isVideo
                ? `
                  <div class="card-play-overlay">
                    <div class="play-icon-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>PLAY VIDEO</span>
                    </div>
                  </div>
                `
                : isExternal
                ? `
                  <div class="card-play-overlay">
                    <div class="play-icon-badge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                      <span>VISIT WEBSITE</span>
                    </div>
                  </div>
                `
                : '';

              cardImageWrapper = `
                <div class="card-image-wrapper card-video-thumb">
                  <img src="${proj.thumb}" alt="${proj.title}" class="card-thumb-image" />
                  <div class="card-bg-glow" style="background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%);"></div>
                  <div class="card-image-placeholder">
                    <span class="card-index">${proj.num}</span>
                    <span class="card-project-tag">${proj.tag}</span>
                  </div>
                  ${overlayContent}
                </div>
              `;
            } else {
              cardImageWrapper = `
                <div class="card-image-wrapper">
                  <div class="card-bg-glow" style="background: radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%);"></div>
                  <div class="card-image-placeholder">
                    <span class="card-index">${proj.num}</span>
                    <span class="card-project-tag">${proj.tag}</span>
                  </div>
                </div>
              `;
            }

            card.innerHTML = `
              ${cardImageWrapper}
              <div class="card-info">
                <h3 class="card-title">${proj.title}</h3>
                <p class="card-desc">${proj.desc}</p>
                <div class="card-tags">
                  ${proj.tags.map(t => `<span>${t}</span>`).join('')}
                </div>
              </div>
            `;

            grid.appendChild(card);
          });
      }
      
      // Slide in category page
      const categoryPage = document.getElementById('page-category');
      if (categoryPage) categoryPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
      
      // Reinitialize 3D tilts for newly added cards
      initProjectTilt();
    } else {
      // Path not found, fallback to root
      history.replaceState({}, '', '/');
    }
  }
  
  // Re-define standard navigation function
  window.navigateToRoute = function(route) {
    const formattedRoute = route === '/' ? '/' : `/${route}`;
    history.pushState({}, '', formattedRoute);
    handleRouting();
  };
  
  // Intercept click events for routes
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      const route = link.getAttribute('data-route');
      window.navigateToRoute(route);
    }
  });
  
  // Popstate history listener
  window.addEventListener('popstate', handleRouting);
  
  // Handle initial page load routing
  handleRouting();
}

function initNavigationInteractions() {
  // Trigger Elements (Unified for Desktop and Mobile)
  const desktopTrigger = document.getElementById('portfolio-nav-trigger');
  const desktopMenu = document.getElementById('portfolio-dropdown-menu');
  const titleLayer = document.getElementById('title-layer');
  const navLayer = document.getElementById('nav-layer');

  // Toggle dropdown
  if (desktopTrigger && desktopMenu && titleLayer) {
    desktopTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = desktopTrigger.getAttribute('aria-expanded') === 'true';
      desktopTrigger.setAttribute('aria-expanded', !isExpanded);
      desktopMenu.classList.toggle('active');
      titleLayer.classList.toggle('nav-open');
      if (navLayer) navLayer.classList.toggle('nav-open');
    });
  }

  // Close helper
  window.closeAllDropdowns = function() {
    if (desktopTrigger) desktopTrigger.setAttribute('aria-expanded', 'false');
    if (desktopMenu) desktopMenu.classList.remove('active');
    if (titleLayer) titleLayer.classList.remove('nav-open');
    if (navLayer) navLayer.classList.remove('nav-open');
  };

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // Portrait Hover overlay / click interactions (About Me trigger)
  const portraitImg = document.getElementById('hero-portrait');
  const portraitOverlay = document.querySelector('.portrait-overlay');
  
  let offscreenCanvas = null;
  let offscreenCtx = null;
  
  function initPortraitCanvas() {
    if (!portraitImg || portraitImg.naturalWidth === 0) return;
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = portraitImg.naturalWidth;
    offscreenCanvas.height = portraitImg.naturalHeight;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    offscreenCtx.drawImage(portraitImg, 0, 0);
  }
  
  function checkPortraitAlpha(e) {
    if (!offscreenCtx || !portraitImg) return false;
    const img = portraitImg; // always map against portrait image
    const rect = img.getBoundingClientRect();
    
    // Retrieve touch or mouse client coordinates
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const naturalX = Math.floor((x / rect.width) * img.naturalWidth);
    const naturalY = Math.floor((y / rect.height) * img.naturalHeight);
    
    // Bounds guard
    if (naturalX < 0 || naturalX >= img.naturalWidth || naturalY < 0 || naturalY >= img.naturalHeight) {
      return false;
    }
    
    try {
      const pixel = offscreenCtx.getImageData(naturalX, naturalY, 1, 1).data;
      const alpha = pixel[3]; // alpha channel
      return alpha > 15;
    } catch (err) {
      return true; // fallback
    }
  }
  
  if (portraitImg && portraitOverlay) {
    if (portraitImg.complete) {
      initPortraitCanvas();
    } else {
      portraitImg.addEventListener('load', initPortraitCanvas);
    }
    
    const portraitLayer = document.getElementById('portrait-layer');
    const trackingTarget = portraitLayer || portraitImg;
    
    trackingTarget.addEventListener('mousemove', (e) => {
      const isMobile = window.innerWidth <= 767;
      if (isMobile) return;
      const isOverVisible = checkPortraitAlpha(e);
      if (isOverVisible) {
        portraitOverlay.classList.add('hovered');
        trackingTarget.style.cursor = 'pointer';
      } else {
        portraitOverlay.classList.remove('hovered');
        trackingTarget.style.cursor = 'default';
      }
    });
    
    trackingTarget.addEventListener('mouseleave', () => {
      portraitOverlay.classList.remove('hovered');
    });
    
    const handlePortraitTrigger = (e) => {
      if (checkPortraitAlpha(e)) {
        e.stopPropagation();
        const isMobile = window.innerWidth <= 767;
        if (isMobile) {
          if (window.isAboutMeTappable) {
            e.preventDefault();
            window.navigateToRoute('aboutme');
          }
        } else {
          window.navigateToRoute('aboutme');
        }
      }
    };
    
    trackingTarget.addEventListener('click', handlePortraitTrigger);
    trackingTarget.addEventListener('touchend', handlePortraitTrigger);
  }
}

// Mobile About Me Pagination Handler
function initAboutPagination() {
  const btnPrev = document.getElementById('about-btn-prev');
  const btnNext = document.getElementById('about-btn-next');
  const indicator = document.getElementById('about-page-indicator');
  const slide1 = document.getElementById('about-slide-1');
  const slide2 = document.getElementById('about-slide-2');
  
  if (!btnPrev || !btnNext || !indicator || !slide1 || !slide2) return;
  
  let currentPage = 1;
  
  function updatePagination() {
    if (currentPage === 1) {
      slide1.classList.add('active');
      slide2.classList.remove('active');
      btnPrev.setAttribute('disabled', 'true');
      btnNext.removeAttribute('disabled');
      indicator.textContent = 'PAGE 1/2';
    } else {
      slide1.classList.remove('active');
      slide2.classList.add('active');
      btnPrev.removeAttribute('disabled');
      btnNext.setAttribute('disabled', 'true');
      indicator.textContent = 'PAGE 2/2';
    }
  }
  
  btnPrev.addEventListener('click', () => {
    currentPage = 1;
    updatePagination();
  });
  
  btnNext.addEventListener('click', () => {
    currentPage = 2;
    updatePagination();
  });
  
  window.resetAboutPagination = function() {
    currentPage = 1;
    updatePagination();
  };
}

// Disable right-click context menu on images to prevent downloading
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

function initFooterGlitch() {
  const staticText = document.querySelector('.footer-static-text');
  if (!staticText) return;
  
  setInterval(() => {
    // Glitch transition to "Sometimes it's not."
    staticText.classList.add('glitch-active');
    
    setTimeout(() => {
      staticText.textContent = "Sometimes it's not.";
    }, 150);
    
    setTimeout(() => {
      staticText.classList.remove('glitch-active');
    }, 350);
    
    // Glitch transition back to "Life is nice." after 1 second
    setTimeout(() => {
      staticText.classList.add('glitch-active');
      
      setTimeout(() => {
        staticText.textContent = "Life is nice.";
      }, 150);
      
      setTimeout(() => {
        staticText.classList.remove('glitch-active');
      }, 350);
    }, 1000);
    
  }, 10000); // Trigger every 10 seconds
}

/* ==========================================================================
   MINIMALIST VIDEO PLAYER MODAL CONTROLLER
   ========================================================================== */
function initMinimalistVideoPlayer() {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('custom-video-element');
  const modalTitle = document.getElementById('video-modal-title');
  const closeBtn = document.getElementById('video-close-btn');
  const backdrop = document.getElementById('video-modal-backdrop');
  
  const playBtn = document.getElementById('video-play-btn');
  const playLabel = document.getElementById('play-btn-label');
  const iconPlay = playBtn ? playBtn.querySelector('.icon-play') : null;
  const iconPause = playBtn ? playBtn.querySelector('.icon-pause') : null;
  
  const muteBtn = document.getElementById('video-mute-btn');
  const muteLabel = document.getElementById('mute-btn-label');
  const iconUnmuted = muteBtn ? muteBtn.querySelector('.icon-unmuted') : null;
  const iconMuted = muteBtn ? muteBtn.querySelector('.icon-muted') : null;
  
  const fullscreenBtn = document.getElementById('video-fullscreen-btn');
  const fullscreenLabel = document.getElementById('fullscreen-btn-label');
  const iconFullscreen = fullscreenBtn ? fullscreenBtn.querySelector('.icon-fullscreen') : null;
  const iconExitFullscreen = fullscreenBtn ? fullscreenBtn.querySelector('.icon-exit-fullscreen') : null;
  
  const progressContainer = document.getElementById('video-progress-container');
  const progressFill = document.getElementById('video-progress-fill');
  const clickOverlay = document.getElementById('video-click-overlay');
  const playerContainer = document.getElementById('video-player-container');

  if (!modal || !video) return;

  let hideControlsTimeout = null;

  function resetControlsTimeout() {
    modal.classList.remove('controls-hidden');
    clearTimeout(hideControlsTimeout);
    
    if (modal.classList.contains('is-fullscreen') && !video.paused) {
      hideControlsTimeout = setTimeout(() => {
        if (modal.classList.contains('is-fullscreen') && !video.paused) {
          modal.classList.add('controls-hidden');
        }
      }, 2000);
    }
  }

  function updatePlayStateUI() {
    if (video.paused) {
      if (iconPlay) iconPlay.style.display = 'inline-block';
      if (iconPause) iconPause.style.display = 'none';
      if (playLabel) playLabel.textContent = 'PLAY';
      modal.classList.remove('controls-hidden');
      clearTimeout(hideControlsTimeout);
    } else {
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'inline-block';
      if (playLabel) playLabel.textContent = 'PAUSE';
      resetControlsTimeout();
    }
  }

  function updateMuteStateUI() {
    if (video.muted) {
      if (iconUnmuted) iconUnmuted.style.display = 'none';
      if (iconMuted) iconMuted.style.display = 'inline-block';
      if (muteLabel) muteLabel.textContent = 'UNMUTE';
    } else {
      if (iconUnmuted) iconUnmuted.style.display = 'inline-block';
      if (iconMuted) iconMuted.style.display = 'none';
      if (muteLabel) muteLabel.textContent = 'MUTE';
    }
  }

  function updateFullscreenStateUI() {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || modal.classList.contains('is-fullscreen'));
    
    if (isFS) {
      modal.classList.add('is-fullscreen');
      if (iconFullscreen) iconFullscreen.style.display = 'none';
      if (iconExitFullscreen) iconExitFullscreen.style.display = 'inline-block';
      if (fullscreenLabel) fullscreenLabel.textContent = 'WINDOW';
      resetControlsTimeout();
    } else {
      modal.classList.remove('is-fullscreen', 'controls-hidden');
      clearTimeout(hideControlsTimeout);
      if (iconFullscreen) iconFullscreen.style.display = 'inline-block';
      if (iconExitFullscreen) iconExitFullscreen.style.display = 'none';
      if (fullscreenLabel) fullscreenLabel.textContent = 'FULLSCREEN';
    }
  }

  window.openMinimalistVideoPlayer = function(videoSrc, title) {
    if (modalTitle) modalTitle.textContent = title;
    video.src = videoSrc;
    video.currentTime = 0;
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    video.play().then(() => {
      updatePlayStateUI();
    }).catch(err => {
      console.log('Autoplay deferred:', err);
      updatePlayStateUI();
    });
  };

  window.closeMinimalistVideoPlayer = function() {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('src');
    video.load();
    
    modal.classList.remove('active', 'is-fullscreen', 'controls-hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    clearTimeout(hideControlsTimeout);
    
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Play / Pause Toggle
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      updatePlayStateUI();
    });
  }

  // Click stage toggles play / pause
  if (clickOverlay) {
    clickOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      updatePlayStateUI();
      
      clickOverlay.classList.add('show-badge');
      setTimeout(() => {
        clickOverlay.classList.remove('show-badge');
      }, 400);
    });
  }

  // Mute / Unmute Toggle
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      updateMuteStateUI();
    });
  }

  // Fullscreen / Window Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || modal.classList.contains('is-fullscreen'));
      
      if (!isFS) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen().then(() => {
            modal.classList.add('is-fullscreen');
            updateFullscreenStateUI();
          }).catch(() => {
            modal.classList.add('is-fullscreen');
            updateFullscreenStateUI();
          });
        } else if (playerContainer.webkitRequestFullscreen) {
          playerContainer.webkitRequestFullscreen();
          modal.classList.add('is-fullscreen');
          updateFullscreenStateUI();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else {
          modal.classList.add('is-fullscreen');
          updateFullscreenStateUI();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            modal.classList.remove('is-fullscreen');
            updateFullscreenStateUI();
          }).catch(() => {
            modal.classList.remove('is-fullscreen');
            updateFullscreenStateUI();
          });
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
          modal.classList.remove('is-fullscreen');
          updateFullscreenStateUI();
        } else {
          modal.classList.remove('is-fullscreen');
          updateFullscreenStateUI();
        }
      }
    });
  }

  // Activity events for auto-hiding controls in fullscreen
  ['mousemove', 'touchstart', 'touchmove', 'pointermove', 'click'].forEach(evt => {
    if (playerContainer) {
      playerContainer.addEventListener(evt, resetControlsTimeout, { passive: true });
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenStateUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenStateUI);

  // Close Button & Backdrop
  if (closeBtn) closeBtn.addEventListener('click', closeMinimalistVideoPlayer);
  if (backdrop) backdrop.addEventListener('click', closeMinimalistVideoPlayer);

  // Progress Bar update & Scrubber
  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      if (progressFill) progressFill.style.width = `${pct}%`;
    }
  });

  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (video.duration) {
        video.currentTime = pos * video.duration;
      }
    });
  }

  video.addEventListener('play', updatePlayStateUI);
  video.addEventListener('pause', updatePlayStateUI);
  video.addEventListener('ended', () => {
    updatePlayStateUI();
    if (progressFill) progressFill.style.width = '100%';
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeMinimalistVideoPlayer();
    } else if (e.key === ' ') {
      e.preventDefault();
      if (video.paused) video.play(); else video.pause();
      updatePlayStateUI();
    } else if (e.key.toLowerCase() === 'm') {
      video.muted = !video.muted;
      updateMuteStateUI();
    } else if (e.key.toLowerCase() === 'f') {
      if (fullscreenBtn) fullscreenBtn.click();
    }
  });
}

/* ==========================================================================
   GRAPHIC DESIGN BENTO GALLERY & ADMIN MANAGEMENT CONTROLLER
   ========================================================================== */
const DEFAULT_GRAPHIC_DESIGN_ITEMS = [
  { id: "gd_1", title: "Streetwear Artboard 01", url: "assets/graphicdesign/Artboard 1.png", span: "tall" },
  { id: "gd_2", title: "Streetwear Artboard 02", url: "assets/graphicdesign/Artboard 2.png", span: "wide" },
  { id: "gd_3", title: "BAC Cap Mockup", url: "assets/graphicdesign/BAC_B-CAP-MOCKUP.png", span: "large" },
  { id: "gd_4", title: "BAC Friday Fun Poster", url: "assets/graphicdesign/BAC_FRIDAYFUN-POSTERv2.png", span: "normal" },
  { id: "gd_5", title: "Chery Ladies Notice", url: "assets/graphicdesign/CHR_LADIES-NOTICEv2.png", span: "tall" },
  { id: "gd_6", title: "Chery Ladies Red Poster", url: "assets/graphicdesign/CHR_LADIES-RED38x53cm-v2.png", span: "wide" },
  { id: "gd_7", title: "ORS Internship Poster", url: "assets/graphicdesign/ORS_INTERNSHIP-POSTER.png", span: "normal" }
];

function getGraphicDesignItems() {
  try {
    const saved = localStorage.getItem('davinhorn_graphicdesign_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return DEFAULT_GRAPHIC_DESIGN_ITEMS;
}

function saveGraphicDesignItems(items) {
  try {
    localStorage.setItem('davinhorn_graphicdesign_items', JSON.stringify(items));
  } catch (e) {
    console.error('Error saving localStorage:', e);
  }
}

function renderGraphicDesignBentoGrid(gridContainer) {
  if (!gridContainer) return;
  gridContainer.innerHTML = '';
  gridContainer.className = 'bento-grid';
  
  const items = getGraphicDesignItems();
  
  items.forEach((item) => {
    const bentoCard = document.createElement('div');
    const spanClass = item.span ? `span-${item.span}` : 'span-normal';
    bentoCard.className = `bento-item ${spanClass}`;
    
    bentoCard.innerHTML = `
      <img src="${item.url}" alt="${item.title}" class="bento-img" loading="lazy" />
      <div class="bento-overlay">
        <h3 class="bento-item-title">${item.title}</h3>
        <span class="bento-zoom-badge">VIEW IMAGE</span>
      </div>
    `;
    
    bentoCard.addEventListener('click', () => {
      if (typeof openImageLightbox === 'function') {
        openImageLightbox(item.url, item.title);
      }
    });
    
    gridContainer.appendChild(bentoCard);
  });
}

function initAdminPanel() {
  const addForm = document.getElementById('admin-add-form');
  const titleInput = document.getElementById('admin-img-title');
  const fileInput = document.getElementById('admin-img-file');
  const urlInput = document.getElementById('admin-img-url');
  const spanInput = document.getElementById('admin-img-span');
  const resetBtn = document.getElementById('admin-reset-btn');

  if (!addForm) return;

  window.renderAdminItemList = function() {
    const listContainer = document.getElementById('admin-items-list');
    const countSpan = document.getElementById('admin-item-count');
    if (!listContainer) return;

    const items = getGraphicDesignItems();
    if (countSpan) countSpan.textContent = items.length;

    listContainer.innerHTML = '';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'admin-item-card';
      row.innerHTML = `
        <div class="admin-item-preview">
          <img src="${item.url}" alt="${item.title}" />
        </div>
        <div class="admin-item-info">
          <h4 class="admin-item-name">${item.title}</h4>
          <span class="admin-item-tag">LAYOUT: ${item.span || 'normal'}</span>
        </div>
        <button class="admin-delete-btn" data-id="${item.id}" aria-label="Remove item">
          REMOVE
        </button>
      `;

      const deleteBtn = row.querySelector('.admin-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          const updated = getGraphicDesignItems().filter(i => i.id !== item.id);
          saveGraphicDesignItems(updated);
          renderAdminItemList();
        });
      }

      listContainer.appendChild(row);
    });
  };

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const span = spanInput.value;
    const file = fileInput.files[0];

    if (!title) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const newItem = {
          id: 'gd_' + Date.now(),
          title: title,
          url: evt.target.result,
          span: span
        };
        const current = getGraphicDesignItems();
        current.push(newItem);
        saveGraphicDesignItems(current);
        addForm.reset();
        renderAdminItemList();
        alert('Picture successfully added to Graphic Design gallery!');
      };
      reader.readAsDataURL(file);
    } else if (url) {
      const newItem = {
        id: 'gd_' + Date.now(),
        title: title,
        url: url,
        span: span
      };
      const current = getGraphicDesignItems();
      current.push(newItem);
      saveGraphicDesignItems(current);
      addForm.reset();
      renderAdminItemList();
      alert('Picture successfully added to Graphic Design gallery!');
    } else {
      alert('Please upload an image file or enter an image URL.');
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset Graphic Design gallery to default pictures?')) {
        saveGraphicDesignItems(DEFAULT_GRAPHIC_DESIGN_ITEMS);
        renderAdminItemList();
      }
    });
  }
}

function initImageLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const backdrop = document.getElementById('lightbox-backdrop');

  if (!modal || !modalImg) return;

  window.openImageLightbox = function(src, title) {
    if (modalTitle) modalTitle.textContent = title || 'GRAPHIC DESIGN';
    modalImg.src = src;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeImageLightbox = function() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeImageLightbox);
  if (backdrop) backdrop.addEventListener('click', closeImageLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeImageLightbox();
    }
  });
}


