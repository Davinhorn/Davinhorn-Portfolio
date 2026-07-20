// Helper to compute dynamic viewport heights for mobile devices, bypassing browser UI bar clips
function setMobileViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

document.addEventListener('DOMContentLoaded', () => {
  // Handle Loading Screen (Only on initial load of Homepage)
  const initialPath = window.location.pathname.replace(/^\/|\/$/g, '');
  if (initialPath === '' || initialPath === 'index.html') {
    setTimeout(() => {
      document.body.classList.remove('app-loading');
    }, 2500);
  } else {
    document.body.classList.remove('app-loading');
  }

  initCustomCursor();
  initHeroParallax();
  initDraggableCollage();
  initProjectTilt();
  initDynamicScribbles();
  
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
  initAboutPagination();

  // Initialize SPA Router and interactive navigation elements
  initNavigationInteractions();
  initSpaRouter();
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

  // Layer 2: Main Bold Title (moves opposite, tilts slightly)
  if (titleLayer) {
    const rotX = -yOffset * 6;
    const rotY = xOffset * 6;
    titleLayer.style.transform = `translate(${xOffset * -20}px, ${yOffset * -20}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  // Layer 3: Portrait Cutout (slight scaling shift)
  if (portraitLayer) {
    portraitLayer.style.transform = `translate(${xOffset * 15}px, ${yOffset * 10}px) scale(1.02)`;
  }

  // Layer 4: Foreground footer elements (Contact and VOL.2026 moving with layout depth)
  // Preserves translateX(-50%) centering layout rule
  if (footerLayer) {
    footerLayer.style.transform = `translateX(-50%) translate(${xOffset * 10}px, ${yOffset * 5}px)`;
  }
}

function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Track mouse coordinates globally on window to prevent interruptions when hovering overlay elements
  window.addEventListener('mousemove', (e) => {
    // Only track if on homepage (body does not have homepage-inactive)
    if (document.body.classList.contains('homepage-inactive')) return;
    
    const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    applyParallax(xOffset, yOffset);
  });

  // Reset layers when cursor leaves the window entirely
  document.addEventListener('mouseleave', () => {
    const scribblesLayer = document.getElementById('scribbles-layer');
    const titleLayer = document.getElementById('title-layer');
    const portraitLayer = document.getElementById('portrait-layer');
    const footerLayer = document.querySelector('.hero-footer');
    if (scribblesLayer) scribblesLayer.style.transform = 'translate(0px, 0px)';
    if (titleLayer) titleLayer.style.transform = 'translate(0px, 0px) rotateX(0deg) rotateY(0deg)';
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
        
        // Device is steady. Start the 1s fade-out timer for About Me trigger
        if (window.isAboutMeTappable && !window.aboutMeFadeTimeout) {
          window.aboutMeFadeTimeout = setTimeout(() => {
            if (portraitOverlay) portraitOverlay.classList.remove('mobile-visible');
            window.isAboutMeTappable = false;
            window.aboutMeFadeTimeout = null;
          }, 1000);
        }
      } else {
        // Device is actively tilting! Show the overlay immediately
        if (window.aboutMeFadeTimeout) {
          clearTimeout(window.aboutMeFadeTimeout);
          window.aboutMeFadeTimeout = null;
        }
        if (portraitOverlay) portraitOverlay.classList.add('mobile-visible');
        window.isAboutMeTappable = true;
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
    
    let baseFontSize = isMobile ? 'clamp(2.0rem, 5.5vw, 3.8rem)' : 'clamp(1.0rem, 1.8vw, 1.8rem)';
    if (font === 'Reenie Beanie') {
      baseFontSize = isMobile ? 'clamp(3.2rem, 7.5vw, 7.0rem)' : 'clamp(1.5rem, 2.8vw, 3.2rem)';
    }
    
    scribble.style.position = 'absolute';
    scribble.style.top = `${topPercent}%`;
    scribble.style.left = `${leftPercent}%`;
    scribble.dataset.rotation = rotation;
    scribble.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    scribble.style.fontFamily = `'${font}'`;
    scribble.style.fontSize = baseFontSize;
    scribble.style.pointerEvents = 'none';
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
  const title = document.querySelector('.hero-title');
  const container = document.querySelector('.hero-title-container');
  const stamp = document.querySelector('.portfolio-stamp');
  const rnLetters = document.querySelector('.rn-letters');
  
  if (!title || !container) return;
  
  // 1. Scale main title to container width
  title.style.fontSize = '100px';
  const textWidth = title.offsetWidth;
  const containerWidth = container.offsetWidth;
  if (textWidth === 0 || containerWidth === 0) return;
  
  const targetFontSize = (containerWidth / textWidth) * 100;
  title.style.fontSize = `${targetFontSize}px`;
  
  // 2. Scale PORTFOLIO stamp to match the exact layout width of "RN"
  if (stamp && rnLetters) {
    const rnWidth = rnLetters.offsetWidth;
    
    // Measure stamp base width at 100px font size
    stamp.style.fontSize = '100px';
    const stampWidth = stamp.offsetWidth;
    
    if (stampWidth > 0 && rnWidth > 0) {
      const targetStampFontSize = (rnWidth / stampWidth) * 100;
      stamp.style.fontSize = `${targetStampFontSize}px`;
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
  videoediting: {
    title: "Video Editing",
    projects: [
      { num: "01", tag: "REEL", title: "Creative Agency Showreel", desc: "Dynamic showreel editing featuring fast pacing, glitch transitions, and music sync.", tags: ["Premiere Pro", "After Effects", "Sound Design"] },
      { num: "02", tag: "PROMO", title: "Vaporwave Fashion Film", desc: "Color grading and editing for a retro-themed street fashion video campaign.", tags: ["DaVinci Resolve", "Editing", "Color"] },
      { num: "03", tag: "MUSIC", title: "Synthwave Music Video", desc: "Beat-matched, highly stylized music video with stylized overlay assets.", tags: ["Premiere Pro", "Effects", "Sync"] }
    ]
  },
  videoproduction: {
    title: "Video Production",
    projects: [
      { num: "01", tag: "SHORT", title: "Urban Concrete", desc: "A short documentary film profiling local street skaters and creative artists.", tags: ["Cinematography", "Direction", "Directing"] },
      { num: "02", tag: "COMMERCIAL", title: "Apex Apparel Promo", desc: "Creative direction and filming for a high-end streetwear release in industrial settings.", tags: ["Red Camera", "Lighting", "Fashion"] },
      { num: "03", tag: "MV", title: "Neon Nights Music Video", desc: "Full-scale music video production featuring cyberpunk aesthetics and custom set design.", tags: ["Cinematography", "Set Design", "Production"] }
    ]
  },
  sounddesign: {
    title: "Sound Design",
    projects: [
      { num: "01", tag: "AMBIENCE", title: "Cyberpunk Cityscape", desc: "Immersive field recordings and synth textures for a futuristic tabletop audio game.", tags: ["Ableton", "Sound Synthesis", "Foley"] },
      { num: "02", tag: "FILM SCORE", title: "Echoes of Silence OST", desc: "Minimalist, ambient cinematic soundscapes and orchestral elements for an indie short film.", tags: ["Logic Pro X", "Synthesis", "Scoring"] },
      { num: "03", tag: "AUDIO LOGO", title: "Vortex Tech Audio Logo", desc: "Sleek, digital interface sound effects and brand audio logo design.", tags: ["Sound Design", "Audio Brand", "Foley"] }
    ]
  },
  uxui: {
    title: "UX/UI Design",
    projects: [
      { num: "01", tag: "WEB PORTAL", title: "Apex Design System", desc: "A modern design library containing responsive components, typography guidelines, and clean design tokens.", tags: ["Figma", "Design System", "Tokens"] },
      { num: "02", tag: "MOBILE APP", title: "Shift Fitness Mobile", desc: "A clean mobile fitness application with interactive goal tracking and gamified badges.", tags: ["UX Research", "Figma Prototypes", "Wireframes"] },
      { num: "03", tag: "DASHBOARD", title: "Quant Exchange Dashboard", desc: "Sleek user experience design for a complex financial dashboard.", tags: ["UI Design", "Data Visualization", "Figma"] }
    ]
  },
  webdevelopment: {
    title: "Web Development",
    projects: [
      { num: "01", tag: "WEB APP", title: "Chantrea Travel Platform", desc: "A premium travel planning platform with rich interactive maps, seamless itinerary scheduling, and customized routes.", tags: ["Vite", "Supabase", "Vanilla CSS"] },
      { num: "02", tag: "DEV TOOLS", title: "Antigravity Dev-Tools", desc: "An advanced developer productivity suite offering real-time canvas overlays, visual performance metrics, and debuggers.", tags: ["Node.js", "Canvas API", "Chrome Ext"] },
      { num: "03", tag: "AI DASHBOARD", title: "Synapse UI Dashboard", desc: "A modern, responsive AI analytics dashboard implementing glassmorphism, glowing gradients, and fluid charts.", tags: ["Next.js", "ChartJS", "Framer Motion"] }
    ]
  },
  branding: {
    title: "Branding",
    projects: [
      { num: "01", tag: "IDENTITY", title: "Helix Brand System", desc: "A raw, urban identity package including streetwear tags, packaging assets, and custom vector typography.", tags: ["Branding", "Vector Design", "Packaging"] },
      { num: "02", tag: "LOGO", title: "Nirvana Coffee Co.", desc: "Retro-modern logo design, physical product tags, and customized typography details.", tags: ["Logo Design", "Illustration", "Typography"] },
      { num: "03", tag: "CAMPAIGN", title: "Synthetics 2.0 Campaign", desc: "A comprehensive digital advertising design project combining graphic guidelines and video assets.", tags: ["Art Direction", "Motion Graphics", "Branding"] }
    ]
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
    
    // Reset Home layout
    document.body.classList.remove('homepage-inactive');
    
    // Close any open dropdowns
    if (typeof closeAllDropdowns === 'function') closeAllDropdowns();
    
    if (path === '' || path === 'index.html') {
      // Home page is active, no additional action needed
    } else if (path === 'contact') {
      // Open contact page
      const contactPage = document.getElementById('page-contact');
      if (contactPage) contactPage.classList.add('active');
      document.body.classList.add('homepage-inactive');
    } else if (path === 'aboutme') {
      // Open About Me layout
      document.body.classList.add('about-active');
      if (aboutPanel) aboutPanel.classList.add('active');
    } else if (categoryData[path]) {
      // Populate category page content
      const cat = categoryData[path];
      const catTitle = document.getElementById('category-title');
      if (catTitle) catTitle.textContent = cat.title;
      
      const grid = document.getElementById('category-project-grid');
      if (grid) {
        grid.innerHTML = '';
        
        cat.projects.forEach(proj => {
          const card = document.createElement('div');
          card.className = 'work-card';
          card.innerHTML = `
            <div class="card-image-wrapper">
              <div class="card-bg-glow" style="background: radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%);"></div>
              <div class="card-image-placeholder">
                <span class="card-index">${proj.num}</span>
                <span class="card-project-tag">${proj.tag}</span>
              </div>
            </div>
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
  // Desktop Trigger Elements
  const desktopTrigger = document.getElementById('portfolio-nav-trigger');
  const desktopMenu = document.getElementById('portfolio-dropdown-menu');
  const titleLayer = document.getElementById('title-layer');
  
  // Mobile Trigger Elements
  const mobileTrigger = document.getElementById('mobile-portfolio-trigger');
  const mobileMenu = document.getElementById('mobile-portfolio-dropdown');

  // Toggle desktop dropdown
  if (desktopTrigger && desktopMenu && titleLayer) {
    desktopTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = desktopTrigger.getAttribute('aria-expanded') === 'true';
      desktopTrigger.setAttribute('aria-expanded', !isExpanded);
      desktopMenu.classList.toggle('active');
      titleLayer.classList.toggle('nav-open');
    });
  }

  // Toggle mobile dropdown (inverted upward)
  if (mobileTrigger && mobileMenu) {
    mobileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = mobileTrigger.getAttribute('aria-expanded') === 'true';
      mobileTrigger.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('active');
    });
  }

  // Close helper
  window.closeAllDropdowns = function() {
    if (desktopTrigger) desktopTrigger.setAttribute('aria-expanded', 'false');
    if (desktopMenu) desktopMenu.classList.remove('active');
    if (titleLayer) titleLayer.classList.remove('nav-open');
    if (mobileTrigger) mobileTrigger.setAttribute('aria-expanded', 'false');
    if (mobileMenu) mobileMenu.classList.remove('active');
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
    if (!offscreenCtx) return false;
    const img = e.target;
    const rect = img.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
      console.error("Canvas read failed", err);
      return true; // fallback
    }
  }
  
  if (portraitImg && portraitOverlay) {
    if (portraitImg.complete) {
      initPortraitCanvas();
    } else {
      portraitImg.addEventListener('load', initPortraitCanvas);
    }
    
    portraitImg.addEventListener('mousemove', (e) => {
      const isOverVisible = checkPortraitAlpha(e);
      if (isOverVisible) {
        portraitOverlay.classList.add('hovered');
        portraitImg.style.cursor = 'pointer';
      } else {
        portraitOverlay.classList.remove('hovered');
        portraitImg.style.cursor = 'default';
      }
    });
    
    portraitImg.addEventListener('mouseleave', () => {
      portraitOverlay.classList.remove('hovered');
    });
    
    portraitImg.addEventListener('click', (e) => {
      if (checkPortraitAlpha(e)) {
        e.stopPropagation();
        const isMobile = window.innerWidth <= 767;
        if (isMobile) {
          // On mobile, click is only active if the device is currently tilting
          if (window.isAboutMeTappable) {
            window.navigateToRoute('aboutme');
          }
        } else {
          // Desktop is always active on hover
          window.navigateToRoute('aboutme');
        }
      }
    });
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


