document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initInteractiveHeader();
  initCapsuleClock();
  initWorksPreview();
  initStickyHeader();
  initVideoAudio();
  initHeroVideoControl();
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
