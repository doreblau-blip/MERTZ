document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initInteractiveHeader();
  initCapsuleClock();
  initWorksPreview();
  initStickyHeader();
  initVideoAudio();
  initHeroVideoControl();
  initScrollResponsiveMarquee();
  initNavbarHUD();
  scrambleLogo();
  initConstellationEngine();
});

/* -------------------------------------------------------------
 * 1. Custom Interactive Eye Cursor (Lagging Outer, Responsive Inner)
 * ------------------------------------------------------------- */
function initCustomCursor() {
  const container = document.getElementById('custom-cursor-container');
  const cursorArrow = document.getElementById('cursor-arrow');
  const trailingEye = document.getElementById('cursor-trailing-eye');
  const rotateGroup = document.getElementById('eye-rotate-group');
  const eyePupil = document.getElementById('eye-pupil');
  
  if (!container || !cursorArrow || !trailingEye || !rotateGroup || !eyePupil) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  
  // Arrow pointer coordinates (snaps instantly for high responsiveness)
  let arrowX = mouseX, arrowY = mouseY;
  
  // Trailing eye coordinates (smooth lag behind the arrow)
  let eyeX = mouseX, eyeY = mouseY;

  // Track mouse coordinates
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    container.style.opacity = '1';
  });

  // Fade out cursor when leaving the window
  document.addEventListener('mouseleave', () => {
    container.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    container.style.opacity = '1';
  });

  // Interpolation and tracking loop
  function renderCursor() {
    // Arrow moves instantly to match real pointer coordinates
    arrowX = mouseX;
    arrowY = mouseY;
    cursorArrow.style.transform = `translate3d(${arrowX}px, ${arrowY}px, 0)`;

    // Trailing eye follows with a smooth delay (lagging behind)
    eyeX += (mouseX - eyeX) * 0.12;
    eyeY += (mouseY - eyeY) * 0.12;
    const isHovering = document.body.classList.contains('hovering-link');
    const eyeScale = isHovering ? 1.3 : 1.0;
    trailingEye.style.transform = `translate3d(${eyeX}px, ${eyeY}px, 0) scale(${eyeScale})`;

    // Calculate angle & distance from the trailing eye center to the arrow pointer
    const dx = arrowX - eyeX;
    const dy = arrowY - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.5) {
      const angleRad = Math.atan2(dy, dx);
      
      // Calculate 2D elliptical translation for pupil inside static eyelids
      const maxX = 6.5; // Max horizontal travel
      const maxY = 2.4; // Max vertical travel
      const scale = Math.min(dist * 0.08, 1.0); // Scale up as distance increases
      
      const pupilX = Math.cos(angleRad) * scale * maxX;
      const pupilY = Math.sin(angleRad) * scale * maxY;

      eyePupil.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
    } else {
      // Center the pupil if overlapping
      eyePupil.style.transform = `translate3d(0, 0, 0)`;
    }

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Attach hover styles to links and interactive elements
  const interactiveElements = document.querySelectorAll('a, button');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering-link');
    });
  });

  // Dynamic random blink loop (runs infinitely even if mouse is completely stationary)
  const blinkGroup = document.getElementById('eye-blink-group');
  if (blinkGroup) {
    function triggerBlink() {
      // Don't trigger standard blink if currently hovering a link (which runs the faster hover blink animation)
      if (!document.body.classList.contains('hovering-link')) {
        blinkGroup.classList.add('blinking');
        setTimeout(() => {
          blinkGroup.classList.remove('blinking');
        }, 150);
      }
      // Schedule next random blink between 2.5 and 6 seconds
      const nextBlink = 2500 + Math.random() * 3500;
      setTimeout(triggerBlink, nextBlink);
    }
    // Start the infinite blink cycle
    setTimeout(triggerBlink, 2000);

    // Trigger blink on click anywhere (even empty space)
    window.addEventListener('click', () => {
      blinkGroup.classList.remove('blinking');
      void blinkGroup.offsetWidth; // force browser layout reflow to restart animation
      blinkGroup.classList.add('blinking');
      setTimeout(() => {
        if (!document.body.classList.contains('hovering-link')) {
          blinkGroup.classList.remove('blinking');
        }
      }, 150);
    });
  }
}

/* -------------------------------------------------------------
 * 2. Interactive Header (Giant Year Scrambler)
 * ------------------------------------------------------------- */
function initInteractiveHeader() {
  const giantNum = document.getElementById('giant-number');
  if (!giantNum) return;

  const defaultText = giantNum.textContent; // "26"
  const alternateChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "X", "Y", "Z"];
  let interval = null;

  giantNum.addEventListener('mouseenter', () => {
    document.body.classList.add('hovering-giant');
    let iteration = 0;
    clearInterval(interval);
    
    interval = setInterval(() => {
      giantNum.textContent = defaultText
        .split("")
        .map((char, index) => {
          if (index < iteration) {
            return defaultText[index];
          }
          return alternateChars[Math.floor(Math.random() * alternateChars.length)];
        })
        .join("");
      
      if (iteration >= defaultText.length) {
        clearInterval(interval);
      }
      iteration += 1/3;
    }, 45);
  });

  giantNum.addEventListener('mouseleave', () => {
    document.body.classList.remove('hovering-giant');
    clearInterval(interval);
    giantNum.textContent = defaultText;
    giantNum.style.transform = `rotateX(0deg) rotateY(0deg) translate3d(0,0,0)`;
  });

  // Dynamic 3D tilt tracking relative to screen cursor position
  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      // Fine-tuned max 10 degrees tilt for premium feel
      const tiltX = (dy / cy) * -10;
      const tiltY = (dx / cx) * 10;
      
      if (giantNum) {
        giantNum.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, 0, 0)`;
      }
      
      // Also tilt the background year watermarks
      const yearWatermarks = document.querySelectorAll('.year-watermark-number');
      yearWatermarks.forEach(wm => {
        wm.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, 0, 0)`;
      });
    }
  });

  // Reset tilt on mouse leaving the window entirely
  document.addEventListener('mouseleave', () => {
    if (giantNum) {
      giantNum.style.transform = `rotateX(0deg) rotateY(0deg) translate3d(0,0,0)`;
    }
    const yearWatermarks = document.querySelectorAll('.year-watermark-number');
    yearWatermarks.forEach(wm => {
      wm.style.transform = `rotateX(0deg) rotateY(0deg) translate3d(0,0,0)`;
    });
  });
}

/* -------------------------------------------------------------
 * 3. Dynamic Capsule Clock (HH:MM format updating in real-time)
 * ------------------------------------------------------------- */
function initCapsuleClock() {
  const clockTimes = document.querySelectorAll('.clock-time');
  if (clockTimes.length === 0) return;

  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    clockTimes.forEach(clock => {
      clock.textContent = timeStr;
    });
  }
  
  updateTime();
  // Update every second to ensure accuracy
  setInterval(updateTime, 1000);
}

/* -------------------------------------------------------------
 * 4. Awwwards-style Hover Preview Container with Lerping Translation
 * ------------------------------------------------------------- */
function initWorksPreview() {
  const listItems = document.querySelectorAll('.clients-list li');
  if (listItems.length === 0) return;

  // Create preview container element dynamically
  const previewContainer = document.createElement('div');
  previewContainer.className = 'hover-preview-container';
  
  const previewVideo = document.createElement('video');
  previewVideo.id = 'hover-preview-video';
  previewVideo.muted = true;
  previewVideo.loop = true;
  previewVideo.playsInline = true;
  previewVideo.autoplay = true;
  previewContainer.appendChild(previewVideo);
  document.body.appendChild(previewContainer);

  // Map of client name to video source
  const videoMap = {
    'AWGE': '/spider2.mp4',
    'AMIRI': '/1_16.mp4',
    'CLOONE': '/DMB3.mp4',
    'LOWLIGHTS STUDIOS': '/nisas.mp4',
    'LATTO': '/cheeta5.mp4',
    'CULT GAIA': '/stormy_horse.mp4',
    'SNEAKS UP': '/5052.mp4',
    'TFF': '/umapaa.mp4'
  };

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovered = false;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function updatePreviewPosition() {
    // Lerp positioning: move 8% of the distance each frame for a smooth lagging float effect
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    
    const scaleVal = isHovered ? 1 : 0.6;
    
    // Default offset to the right of the cursor (so it hovers in the right empty space)
    let offsetX = 220;
    let offsetY = 0;
    
    // Automatic overflow protection: if the preview card overflows the right side, flip it to the left
    const cardWidth = 210;
    const halfWidth = cardWidth / 2;
    if (currentX + offsetX + halfWidth > window.innerWidth - 20) {
      offsetX = -220;
    }
    
    // On tablet or mobile, place it above the cursor so it doesn't overflow off-screen
    if (window.innerWidth <= 1024) {
      offsetX = 0;
      offsetY = -180;
    }
    
    // Apply offset, scale, and center translation (-50%, -50%)
    previewContainer.style.transform = `translate3d(${currentX + offsetX}px, ${currentY + offsetY}px, 0) scale(${scaleVal}) translate(-50%, -50%)`;
    
    requestAnimationFrame(updatePreviewPosition);
  }
  updatePreviewPosition();

  listItems.forEach(item => {
    const text = item.getAttribute('data-work') || item.textContent.trim();
    const videoSrc = videoMap[text];
    
    if (videoSrc) {
      item.addEventListener('mouseenter', () => {
        previewVideo.src = videoSrc;
        previewVideo.play().catch(err => console.log(err));
        previewContainer.classList.add('active');
        isHovered = true;
        // Snap start coordinates to avoid large jumping sweeps
        currentX = targetX;
        currentY = targetY;
        document.body.classList.add('hovering-link');
      });

      item.addEventListener('mouseleave', () => {
        previewContainer.classList.remove('active');
        isHovered = false;
        previewVideo.pause();
        previewVideo.removeAttribute('src');
        previewVideo.load();
        document.body.classList.remove('hovering-link');
      });
    }
  });
}

/* -------------------------------------------------------------
 * 5. Sticky Header Scroll Tracker (Detects when scrolled over projects)
 * ------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header-fixed');
  if (!header) return;

  function handleScroll() {
    // When the user scrolls past the hero fold (100vh minus header/padding offset),
    // toggle the .scrolled class to trigger dynamic mix-blend-mode negation.
    const heroThreshold = window.innerHeight - 120;
    if (window.scrollY > heroThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load to initialize state
}

/* -------------------------------------------------------------
 * 6. Audio controller for video grids (Muted by default, unmuted on button click, muted on mouseleave)
 * ------------------------------------------------------------- */
function initVideoAudio() {
  const videoWrappers = document.querySelectorAll('.project-video-wrapper');
  videoWrappers.forEach(wrapper => {
    const video = wrapper.querySelector('.project-video');
    const soundBtn = wrapper.querySelector('.video-sound-btn');
    if (!video || !soundBtn) return;
    
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const isMuted = video.muted;
      video.muted = !isMuted;
      
      if (video.muted) {
        soundBtn.classList.remove('unmuted');
      } else {
        soundBtn.classList.add('unmuted');
      }
    });
    
    wrapper.addEventListener('mouseleave', () => {
      video.muted = true;
      soundBtn.classList.remove('unmuted');
    });
  });
}

/* -------------------------------------------------------------
 * 7. Background video controller (Play/Pause with animated brackets)
 * ------------------------------------------------------------- */
function initHeroVideoControl() {
  const video = document.querySelector('.hero-bg-video');
  const controlBtn = document.getElementById('hero-video-control');
  if (!video || !controlBtn) return;

  controlBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(err => console.log(err));
      controlBtn.classList.remove('paused');
    } else {
      video.pause();
      controlBtn.classList.add('paused');
    }
  });
}

/* -------------------------------------------------------------
 * 8. Scroll-Velocity-Responsive Marquee Ticker Speed
 * ------------------------------------------------------------- */
function initScrollResponsiveMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  // Disable default CSS animation to drive it via JS requestAnimationFrame
  track.style.animation = 'none';

  let offset = 0;
  const baseSpeed = 0.8; // default smooth scrolling speed
  let speed = baseSpeed;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  function tick() {
    const currentScrollY = window.scrollY;
    scrollVelocity = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    // The faster the scroll, the faster the marquee translates
    const targetSpeed = baseSpeed + scrollVelocity * 0.18;
    
    // Smoothly decay back to base speed
    speed += (targetSpeed - speed) * 0.08;

    offset += speed;

    const halfWidth = track.offsetWidth / 2;
    if (halfWidth > 0 && offset >= halfWidth) {
      offset = offset % halfWidth;
    }

    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* -------------------------------------------------------------
 * 9. Live System HUD Overlay inside the Navbar
 * ------------------------------------------------------------- */
function initNavbarHUD() {
  const scrollVal = document.getElementById('hud-scroll-val');
  const seedVal = document.getElementById('hud-seed-val');
  if (!scrollVal && !seedVal) return;

  // Update scroll percentage readout
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.min(Math.max(Math.round((window.scrollY / docHeight) * 100), 0), 100);
    if (scrollVal) {
      scrollVal.textContent = String(pct).padStart(2, '0');
    }
  }, { passive: true });

  // Update seed calculations based on mouse coordinates
  let currentSeed = 0.5173;
  let targetSeed = 0.5173;

  document.addEventListener('mousemove', (e) => {
    const normX = e.clientX / window.innerWidth;
    const normY = e.clientY / window.innerHeight;
    targetSeed = (normX * 829.17 + normY * 114.65) % 1000;
  });

  function updateSeed() {
    currentSeed += (targetSeed - currentSeed) * 0.04;
    if (seedVal) {
      seedVal.textContent = currentSeed.toFixed(4);
    }
    requestAnimationFrame(updateSeed);
  }
  updateSeed();
}

/* -------------------------------------------------------------
 * 10. Logo Text Scrambler Animation
 * ------------------------------------------------------------- */
function scrambleLogo() {
  const brandLogo = document.querySelector('.brand-logo');
  if (!brandLogo || !brandLogo.childNodes[0]) return;

  const originalText = "MERTZ";
  const glyphs = "01XY$&#%*?[]^-_+={}/\\";
  let isScrambling = false;

  brandLogo.addEventListener('mouseenter', () => {
    if (isScrambling) return;
    isScrambling = true;

    let iterations = 0;
    const interval = setInterval(() => {
      const scrambled = originalText
        .split("")
        .map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");

      // Update the first text node, preserving the reg-symbol span child
      brandLogo.childNodes[0].textContent = scrambled;

      if (iterations >= originalText.length) {
        clearInterval(interval);
        isScrambling = false;
      }

      iterations += 1/3;
    }, 30);
  });
}

/* -------------------------------------------------------------
 * 11. Constellation Engine (Interactive Mind Map / Constellation)
 * ------------------------------------------------------------- */
function initConstellationEngine() {
  const container = document.getElementById('constellation-container');
  const svg = document.getElementById('constellation-svg');
  const nodesContainer = document.getElementById('constellation-nodes');
  const orb = document.getElementById('center-orb');
  if (!container || !svg || !nodesContainer || !orb) return;

  const nodeData = [
    { id: 'direction', label: 'CREATIVE DIRECTION', dx: -240, dy: -140, phase: 0 },
    { id: 'ai', label: 'GENERATIVE SYSTEMS', dx: -280, dy: 80, phase: 1.2 },
    { id: 'artistry', label: 'AI ARTISTRY', dx: -100, dy: -240, phase: 2.5 },
    { id: 'design', label: '3D DESIGN', dx: 140, dy: -240, phase: 3.8 },
    { id: 'landscapes', label: 'DIGITAL LANDSCAPES', dx: 260, dy: -100, phase: 4.7 },
    { id: 'storytelling', label: 'STORYTELLING', dx: -180, dy: -30, phase: 5.9 }
  ];

  let isExpanded = false;
  let activeNodeId = null;
  let animationFrameId = null;

  // Create SVG lines and circles
  const lines = [];
  const dots = [];
  
  // Track dynamic properties of nodes (positions and pulse speeds)
  const nodeState = nodeData.map(node => ({
    ...node,
    x: 0,
    y: 0,
    currentScale: 0,
    targetScale: 0,
    currentOpacity: 0,
    targetOpacity: 0,
    pulseProgress: Math.random(),
    pulseSpeed: 0.003 + Math.random() * 0.002
  }));

  // Initialize SVG elements
  nodeState.forEach((node, i) => {
    // Connection line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'constellation-line');
    svg.appendChild(line);
    lines.push(line);

    // Pulse dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'pulse-dot');
    dot.setAttribute('r', '2');
    svg.appendChild(dot);
    dots.push(dot);

    // DOM button
    const btn = document.createElement('button');
    btn.setAttribute('class', 'constellation-node-btn');
    btn.setAttribute('id', `node-${node.id}`);
    btn.innerHTML = `
      <span class="node-label">${node.label}</span>
      <span class="node-coords">[x:${node.dx.toFixed(1)}, y:${node.dy.toFixed(1)}]</span>
    `;
    nodesContainer.appendChild(btn);

    // Node click handler
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeNodeId === node.id) {
        // De-select
        activeNodeId = null;
      } else {
        // Select and trigger scramble
        activeNodeId = node.id;
        scrambleNodeLabel(btn, node.label);
      }
      updateStateClasses();
    });
  });

  // Toggle expansion on orb click
  orb.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      expand();
    } else {
      collapse();
    }
  });

  function getScaleFactor() {
    const w = window.innerWidth;
    if (w <= 480) return 0.42;
    if (w <= 768) return 0.58;
    if (w <= 1024) return 0.78;
    return 1.0;
  }

  function expand() {
    isExpanded = true;
    activeNodeId = null;
    orb.style.transform = 'translate(-50%, -50%) scale(1.15)';
    nodeState.forEach(node => {
      node.targetScale = 1;
      node.targetOpacity = 0.7;
    });
    updateStateClasses();
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function collapse() {
    isExpanded = false;
    activeNodeId = null;
    orb.style.transform = 'translate(-50%, -50%) scale(1)';
    nodeState.forEach(node => {
      node.targetScale = 0;
      node.targetOpacity = 0;
    });
    updateStateClasses();
  }

  function updateStateClasses() {
    nodeState.forEach(node => {
      const btn = document.getElementById(`node-${node.id}`);
      if (!btn) return;

      if (!isExpanded) {
        btn.classList.remove('visible', 'active-focus', 'dimmed');
      } else {
        btn.classList.add('visible');
        if (activeNodeId) {
          if (activeNodeId === node.id) {
            btn.classList.add('active-focus');
            btn.classList.remove('dimmed');
          } else {
            btn.classList.add('dimmed');
            btn.classList.remove('active-focus');
          }
        } else {
          btn.classList.remove('active-focus', 'dimmed');
        }
      }
    });
  }

  function scrambleNodeLabel(btn, labelText) {
    const labelSpan = btn.querySelector('.node-label');
    if (!labelSpan) return;
    const glyphs = "01XY$&#%*?[]^-_+={}/\\";
    let iterations = 0;
    const interval = setInterval(() => {
      labelSpan.textContent = labelText
        .split("")
        .map((char, index) => {
          if (index < iterations) return labelText[index];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");
      
      if (iterations >= labelText.length) {
        clearInterval(interval);
      }
      iterations += 1;
    }, 25);
  }

  function tick(timestamp) {
    const scaleFactor = getScaleFactor();
    const cx = container.offsetWidth / 2;
    const cy = container.offsetHeight / 2;

    let hasActiveAnimations = false;

    nodeState.forEach((node, i) => {
      const btn = document.getElementById(`node-${node.id}`);
      const line = lines[i];
      const dot = dots[i];
      if (!btn || !line || !dot) return;

      // Interpolation for smooth scaling/opacity transitions
      node.currentScale += (node.targetScale - node.currentScale) * 0.12;
      node.currentOpacity += (node.targetOpacity - node.currentOpacity) * 0.12;

      if (Math.abs(node.targetScale - node.currentScale) > 0.005 || node.currentScale > 0.01) {
        hasActiveAnimations = true;
      }

      // Ambient float swaying calculation (sinusoidal offset)
      const swayX = Math.sin(timestamp * 0.0018 + node.phase) * 12 * scaleFactor;
      const swayY = Math.cos(timestamp * 0.0014 + node.phase) * 12 * scaleFactor;

      // Node coordinate position on container
      node.x = cx + node.dx * scaleFactor + swayX;
      node.y = cy + node.dy * scaleFactor + swayY;

      // Update button style
      btn.style.left = '0px';
      btn.style.top = '0px';
      btn.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) scale(${node.currentScale})`;
      btn.style.opacity = node.currentOpacity;

      // Dynamically display relative coordinates based on position
      const coordsSpan = btn.querySelector('.node-coords');
      if (coordsSpan) {
        const relativeX = (node.x - cx) / scaleFactor;
        const relativeY = (node.y - cy) / scaleFactor;
        coordsSpan.textContent = `[x:${relativeX.toFixed(1)}, y:${relativeY.toFixed(1)}]`;
      }

      // Update lines/particles in canvas
      if (node.currentScale > 0.05) {
        let x1, y1, x2, y2;
        let isFocusedLine = false;

        if (activeNodeId) {
          const activeNode = nodeState.find(n => n.id === activeNodeId);
          if (activeNode) {
            if (node.id === activeNodeId) {
              x1 = cx;
              y1 = cy;
              x2 = activeNode.x;
              y2 = activeNode.y;
              isFocusedLine = true;
            } else {
              // Lines bend to point from all other nodes to the clicked node
              x1 = node.x;
              y1 = node.y;
              x2 = activeNode.x;
              y2 = activeNode.y;
            }
          }
        } else {
          // Default: all lines radiate from center orb
          x1 = cx;
          y1 = cy;
          x2 = node.x;
          y2 = node.y;
        }

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.style.opacity = node.currentOpacity;
        
        if (isFocusedLine || activeNodeId) {
          line.classList.add('active-path');
        } else {
          line.classList.remove('active-path');
        }

        // Animate pulse particle along vector paths
        node.pulseProgress += node.pulseSpeed;
        if (node.pulseProgress > 1.0) {
          node.pulseProgress = 0;
        }

        const px = x1 + (x2 - x1) * node.pulseProgress;
        const py = y1 + (y2 - y1) * node.pulseProgress;

        dot.setAttribute('cx', px);
        dot.setAttribute('cy', py);
        dot.setAttribute('class', 'pulse-dot active-pulse');
        dot.style.opacity = node.currentOpacity;
      } else {
        // Retracted/Collapsed state
        line.setAttribute('x1', 0);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', 0);
        line.setAttribute('y2', 0);
        dot.setAttribute('class', 'pulse-dot');
      }
    });

    if (isExpanded || hasActiveAnimations) {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      animationFrameId = null;
    }
  }
}
