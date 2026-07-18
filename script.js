const head = document.getElementById('maskHead');
const tail = document.getElementById('maskTail');
const rippleContainer = document.getElementById('rippleContainer');

const vid1 = document.getElementById('vid1');
const vid2 = document.getElementById('vid2');

let mouseX = -1000;
let mouseY = -1000;
let trailX = -1000;
let trailY = -1000;

const speed = 0.015; 
let ripples = [];

// --- NEW STATE & TIMERS ---
let isHolding = false;
let isSwapped = false; // Remembers which dimension we are currently locked into
let startVibrateTimer;
let lockSwapTimer;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isHolding = true;
    
    // 1. PREVIEW THE SWAP INSTANTLY
    if (!isSwapped) {
        vid1.className = "bg-video top-layer";
        vid2.className = "bg-video bottom-layer";
    } else {
        vid1.className = "bg-video bottom-layer";
        vid2.className = "bg-video top-layer";
    }

    // 2. SPAWN INITIAL SHOCKWAVE (Your custom 95 width)
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', e.clientX);
    ring.setAttribute('cy', e.clientY);
    ring.setAttribute('fill', 'none'); 
    ring.setAttribute('stroke', 'white'); 
    ring.setAttribute('stroke-width', '95'); 
    rippleContainer.appendChild(ring);
    ripples.push({ element: ring, radius: 400, opacity: 1 });

    // 3. START TIMERS
    // Start shaking at 3 seconds
    startVibrateTimer = setTimeout(() => {
        if (isHolding) {
            document.body.classList.add('vibrating');
        }
    }, 3000);

    // Lock the dimension swap permanently at 10 seconds
    lockSwapTimer = setTimeout(() => {
        if (isHolding) {
            isSwapped = !isSwapped; // Permanently flip the memory state
            document.body.classList.remove('vibrating'); // Stop the shaking to signal it worked
            
            // Spawn a MASSIVE shockwave burst to indicate the dimension tore successfully!
            const massiveRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            massiveRing.setAttribute('cx', mouseX);
            massiveRing.setAttribute('cy', mouseY);
            massiveRing.setAttribute('fill', 'none'); 
            massiveRing.setAttribute('stroke', 'white'); 
            massiveRing.setAttribute('stroke-width', '150'); // Extra thick blast
            rippleContainer.appendChild(massiveRing);
            ripples.push({ element: massiveRing, radius: 400, opacity: 1 });
        }
    }, 10000); // 10,000 milliseconds = 10 seconds
});

document.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    isHolding = false;

    // 1. CLEAR TIMERS AND SHAKE EFFECT
    clearTimeout(startVibrateTimer);
    clearTimeout(lockSwapTimer);
    document.body.classList.remove('vibrating');

    // 2. SET LAYERS BASED ON THE PERMANENT STATE
    if (!isSwapped) {
        // Normal State (Vid 1 is base, Vid 2 is mouse reveal)
        vid1.className = "bg-video bottom-layer";
        vid2.className = "bg-video top-layer";
    } else {
        // Dimension Swapped State (Vid 2 is base, Vid 1 is mouse reveal)
        vid1.className = "bg-video top-layer";
        vid2.className = "bg-video bottom-layer";
    }
});

// --- ANIMATION LOOP ---
function animate() {
    trailX += (mouseX - trailX) * speed;
    trailY += (mouseY - trailY) * speed;

    head.setAttribute('cx', mouseX);
    head.setAttribute('cy', mouseY);

    const dx = trailX - mouseX;
    const dy = trailY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
        const angle = Math.atan2(dy, dx);
        
        const p1x = mouseX + Math.cos(angle + Math.PI / 2) * 400;
        const p1y = mouseY + Math.sin(angle + Math.PI / 2) * 400;
        
        const p2x = mouseX + Math.cos(angle - Math.PI / 2) * 400;
        const p2y = mouseY + Math.sin(angle - Math.PI / 2) * 400;

        tail.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y} ${trailX},${trailY}`);
    } else {
        tail.setAttribute('points', '');
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
        let r = ripples[i];
        r.radius += 18; 
        r.opacity -= 0.015; 

        if (r.opacity <= 0) {
            r.element.remove();
            ripples.splice(i, 1);
        } else {
            r.element.setAttribute('r', r.radius);
            r.element.setAttribute('stroke-opacity', r.opacity);
        }
    }

    requestAnimationFrame(animate);
}

animate();