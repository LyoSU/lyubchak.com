// ============================================
// MODERN PURPLE AESTHETIC - REFACTORED JS
// ============================================

'use strict';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const utils = {
    // Calculate age from birth date
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    },

    // Body scroll lock/unlock
    lockScroll() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    },

    unlockScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    },

    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // Copy to clipboard (modern API)
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
                return true;
            } catch (e) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
};

// ============================================
// AGE UPDATER
// ============================================

class AgeUpdater {
    constructor(elementId, birthDate) {
        this.element = document.getElementById(elementId);
        this.birthDate = birthDate;
    }

    update() {
        if (!this.element) return;
        this.element.textContent = utils.calculateAge(this.birthDate);
    }
}

// ============================================
// MODAL MANAGER
// ============================================

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.activeSections = new Set();
        this.backdrop = document.getElementById('section-backdrop');
        this.init();
    }

    init() {
        // Handle ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleHashChange());

        // Handle initial hash
        if (window.location.hash) {
            setTimeout(() => this.handleHashChange(), 100);
        }

        // Handle backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeAll());
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.closeAll();
        this.activeModal = modal;

        modal.classList.add('active');
        utils.lockScroll();

        // Add backdrop click handler
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal(modalId), { once: true });
        }

        // Add close button handler
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modalId), { once: true });
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        this.activeModal = null;
        utils.unlockScroll();

        // Clear hash if it matches (handle both modal ID and section ID)
        const currentHash = window.location.hash.substring(1);
        if (currentHash === modalId || (modalId === 'projects-modal' && currentHash === 'projects')) {
            history.replaceState(null, null, ' ');
        }
    }

    openSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Close other sections
        this.activeSections.forEach(id => {
            if (id !== sectionId) {
                this.closeSection(id, false);
            }
        });

        section.classList.add('active');
        this.activeSections.add(sectionId);

        // Show backdrop
        if (this.backdrop) {
            this.backdrop.classList.add('active');
        }

        utils.lockScroll();
    }

    closeSection(sectionId, clearBackdrop = true) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        section.classList.remove('active');
        this.activeSections.delete(sectionId);

        // Hide backdrop if no sections are open
        if (clearBackdrop && this.activeSections.size === 0 && this.backdrop) {
            this.backdrop.classList.remove('active');
            utils.unlockScroll();
        }

        // Clear hash if it matches
        if (window.location.hash === `#${sectionId}`) {
            history.replaceState(null, null, ' ');
        }
    }

    closeAll() {
        // Close modal
        if (this.activeModal) {
            this.closeModal(this.activeModal.id);
        }

        // Close all sections
        this.activeSections.forEach(id => this.closeSection(id, false));
        this.activeSections.clear();

        // Hide backdrop
        if (this.backdrop) {
            this.backdrop.classList.remove('active');
        }

        utils.unlockScroll();
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        // Check if it's a modal
        if (hash === 'projects') {
            this.openModal('projects-modal');
        } else {
            // Check if it's a section
            const section = document.getElementById(hash);
            if (section && section.classList.contains('collapsible-section')) {
                this.openSection(hash);
            }
        }
    }
}

// ============================================
// NAVIGATION HANDLER
// ============================================

class NavigationHandler {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.init();
    }

    init() {
        // Section buttons
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = btn.getAttribute('data-section');

                if (sectionId === 'projects') {
                    this.modalManager.openModal('projects-modal');
                } else {
                    this.modalManager.openSection(sectionId);
                }

                window.location.hash = sectionId;
            });
        });

        // Close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.getAttribute('data-close');
                this.modalManager.closeSection(sectionId);
            });
        });
    }
}

// ============================================
// CLIPBOARD HANDLER
// ============================================

class ClipboardHandler {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('input[readonly]').forEach(input => {
            input.addEventListener('click', async () => {
                const success = await utils.copyToClipboard(input.value);

                if (success) {
                    this.showFeedback(input);
                }
            });
        });
    }

    showFeedback(element) {
        const originalBorder = element.style.borderColor;
        const originalShadow = element.style.boxShadow;

        element.style.borderColor = '#cbafff';
        element.style.boxShadow = '0 0 15px rgba(203, 175, 255, 0.5)';

        setTimeout(() => {
            element.style.borderColor = originalBorder;
            element.style.boxShadow = originalShadow;
        }, 400);
    }
}

// ============================================
// PARALLAX EFFECT
// ============================================

class ParallaxEffect {
    constructor(selector, speed = 0.3) {
        this.element = document.querySelector(selector);
        this.speed = speed;
        this.init();
    }

    init() {
        if (!this.element) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updatePosition();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updatePosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.element.style.transform = `translateY(${scrollTop * this.speed}px)`;
    }
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

class AnimationObserver {
    constructor(selector, className = 'visible') {
        this.className = className;
        this.init(selector);
    }

    init(selector) {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(this.className);
                }
            });
        }, options);

        document.querySelectorAll(selector).forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add CSS for visible state
        if (!document.querySelector('#animation-observer-styles')) {
            const style = document.createElement('style');
            style.id = 'animation-observer-styles';
            style.textContent = `
                .${this.className} {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ============================================
// EASTER EGG HANDLER
// ============================================

class EasterEggHandler {
    constructor() {
        this.clickCount = 0;
        this.resetTimeout = null;
        this.init();
    }

    init() {
        const avatar = document.querySelector('.avatar');
        const easterEgg = document.getElementById('switch-easter-egg');

        if (!avatar || !easterEgg) return;

        avatar.style.cursor = 'pointer';

        avatar.addEventListener('click', () => {
            this.clickCount++;

            // Reset counter after 2 seconds of inactivity
            clearTimeout(this.resetTimeout);
            this.resetTimeout = setTimeout(() => {
                this.clickCount = 0;
            }, 2000);

            // Reveal easter egg after 3 clicks
            if (this.clickCount === 3) {
                easterEgg.classList.add('revealed');
                this.clickCount = 0;
            }
        });
    }
}

// ============================================
// DONATE PAGE INTERACTIONS
// ============================================

class DonateInteractions {
    constructor() {
        this.coffeeCount = 0;
        this.init();
    }

    init() {
        this.initCoffeeCounter();
        this.initCopyButtons();
    }

    initCoffeeCounter() {
        const coffeeIcon = document.querySelector('.coffee-icon');
        const coffeeNum = document.querySelector('.coffee-num');

        if (!coffeeIcon || !coffeeNum) return;

        coffeeIcon.addEventListener('click', () => {
            this.coffeeCount++;

            if (this.coffeeCount < 10) {
                coffeeNum.textContent = this.coffeeCount;
            } else if (this.coffeeCount === 10) {
                coffeeNum.textContent = '∞';
                coffeeNum.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    coffeeNum.style.animation = '';
                }, 500);
            } else if (this.coffeeCount === 20) {
                coffeeNum.textContent = '∞ + ∞';
            } else if (this.coffeeCount === 42) {
                coffeeNum.textContent = '42 (the answer)';
            } else if (this.coffeeCount > 50) {
                coffeeNum.textContent = 'please stop';
                this.coffeeCount = 0;
            }
        });
    }

    initCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const textToCopy = btn.getAttribute('data-copy');
                const success = await utils.copyToClipboard(textToCopy);

                if (success) {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove('copied');
                    }, 2000);
                }
            });
        });
    }
}

// ============================================
// CONSOLE BRANDING
// ============================================

class ConsoleBranding {
    static init() {
        console.log(
            '%c LYUBCHAK.COM ',
            'background: linear-gradient(135deg, #d6bfff, #b58dff); color: #1c132c; font-weight: bold; padding: 10px 20px; font-size: 14px; border-radius: 3px;'
        );
        console.log(
            '%c Made in Ukraine ',
            'color: #cbafff; font-family: monospace; font-size: 12px;'
        );
        console.log(
            '%c Powered by Claude Code 🤖 ',
            'color: #a89ec4; font-family: monospace; font-size: 11px; font-style: italic;'
        );
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Update age
    const ageUpdater = new AgeUpdater('age', new Date(1999, 1, 27)); // Feb 27, 1999
    ageUpdater.update();

    // Initialize modal manager
    const modalManager = new ModalManager();

    // Initialize navigation
    new NavigationHandler(modalManager);

    // Initialize clipboard
    new ClipboardHandler();

    // Parallax effect
    new ParallaxEffect('.grid-bg', 0.3);

    // Animate elements on scroll
    new AnimationObserver('.contact-card, .project-item');

    // Easter egg handler
    new EasterEggHandler();

    // Donate page interactions
    new DonateInteractions();

    // Console branding
    ConsoleBranding.init();
});
