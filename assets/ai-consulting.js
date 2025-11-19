/**
 * AI Consulting Landing Page Interactive Logic - Bright Future Edition
 * 2025 Yuri Lyubchak
 */

document.addEventListener('DOMContentLoaded', () => {
    initFluidCanvas();
    initTypeEffect();
    initScrollAnimations();
    initCounters();
    initForm();
});

/* ============================================
   FLUID GRADIENT ANIMATION
   ============================================ */
function initFluidCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let blobs = [];

    // Configuration
    const blobCount = 6;
    const colors = [
        { r: 99, g: 102, b: 241 },  // Violet
        { r: 236, g: 72, b: 153 },  // Pink
        { r: 6, g: 182, b: 212 },   // Cyan
        { r: 139, g: 92, b: 246 },  // Purple
        { r: 244, g: 63, b: 94 }    // Rose
    ];

    window.addEventListener('resize', resize);

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Blob {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.min(width, height) * (0.4 + Math.random() * 0.4); // Large blobs
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.002;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.angleSpeed;

            // Soft bounce
            if (this.x < -this.radius) this.vx = Math.abs(this.vx);
            if (this.x > width + this.radius) this.vx = -Math.abs(this.vx);
            if (this.y < -this.radius) this.vy = Math.abs(this.vy);
            if (this.y > height + this.radius) this.vy = -Math.abs(this.vy);
        }

        draw() {
            ctx.beginPath();

            // Create gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );

            const r = this.color.r;
            const g = this.color.g;
            const b = this.color.b;

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = gradient;

            // Draw slightly distorted circle
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(1 + Math.sin(this.angle) * 0.2, 1 + Math.cos(this.angle) * 0.2);
            ctx.translate(-this.x, -this.y);

            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function initBlobs() {
        blobs = [];
        for (let i = 0; i < blobCount; i++) {
            blobs.push(new Blob());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Use 'screen' or 'lighter' blend mode for vibrant overlap
        ctx.globalCompositeOperation = 'multiply'; // 'multiply' for watercolor effect on white
        // Or 'screen' if background was dark. For light bg, multiply or overlay works well.
        // Let's try normal alpha blending first for softness.
        ctx.globalCompositeOperation = 'source-over';

        blobs.forEach(blob => {
            blob.update();
            blob.draw();
        });

        requestAnimationFrame(animate);
    }

    resize();
    initBlobs();
    animate();
}

/* ============================================
   TYPING EFFECT
   ============================================ */
function initTypeEffect() {
    const element = document.querySelector('.type-effect');
    if (!element) return;

    const words = JSON.parse(element.getAttribute('data-words'));
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            element.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            element.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before typing next
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const elements = document.querySelectorAll('.service-card, .case-study, .step, .contact-wrapper');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // Add visible class style dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/* ============================================
   COUNTERS
   ============================================ */
function initCounters() {
    const stats = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing function for smooth count
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/* ============================================
   FORM HANDLING
   ============================================ */
function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button');
        const originalText = btn.textContent;

        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Simulate sending
        setTimeout(() => {
            btn.textContent = 'Message Sent!';
            btn.style.background = '#10b981'; // Success Green
            btn.style.color = '#ffffff';
            btn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';

            form.reset();

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.boxShadow = '';
            }, 3000);
        }, 1500);
    });
}
