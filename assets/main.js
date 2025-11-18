// ============================================
// MODERN AESTHETIC - JS
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

    // Show feedback for copy actions
    showFeedback(element) {
        const originalBorder = element.style.borderColor;
        const originalShadow = element.style.boxShadow;

        element.style.borderColor = 'var(--primary)';
        element.style.boxShadow = '0 0 15px var(--glow)';

        // If it's a button or card, add copied class
        if (element.classList.contains('contact-card') || element.tagName === 'BUTTON') {
            element.classList.add('copied');
            const originalText = element.innerText;

            // Try to find the value span or just change text
            const valueSpan = element.querySelector('.contact-value');
            if (valueSpan) {
                const oldVal = valueSpan.innerText;
                valueSpan.innerText = 'Copied!';
                setTimeout(() => {
                    valueSpan.innerText = oldVal;
                    element.classList.remove('copied');
                }, 2000);
            } else {
                // It might be an input or just text
                if (element.tagName !== 'INPUT') {
                    element.innerText = 'Copied!';
                    setTimeout(() => {
                        element.innerText = originalText;
                        element.classList.remove('copied');
                    }, 2000);
                }
            }
        }

        setTimeout(() => {
            element.style.borderColor = originalBorder;
            element.style.boxShadow = originalShadow;
        }, 400);
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

class AgeClicker {
    constructor(elementId, birthDate) {
        this.element = document.getElementById(elementId);
        this.birthDate = birthDate;
        this.mode = 0; // 0: years, 1: days, 2: hours, 3: hex, 4: binary
        this.init();
    }

    init() {
        if (!this.element) return;

        this.element.style.cursor = 'pointer';
        this.element.title = 'Click to cycle format';

        this.element.addEventListener('click', () => {
            this.mode = (this.mode + 1) % 5;
            this.updateDisplay();
        });
    }

    updateDisplay() {
        const ageYears = utils.calculateAge(this.birthDate);
        const diffTime = Math.abs(new Date() - this.birthDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        let text = '';
        switch (this.mode) {
            case 0: text = ageYears; break;
            case 1: text = `${diffDays} days`; break;
            case 2: text = `${diffHours} hours`; break;
            case 3: text = `0x${ageYears.toString(16)}`; break;
            case 4: text = ageYears.toString(2); break;
        }

        this.element.textContent = text;
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
        document.body.style.overflow = 'hidden';

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
        document.body.style.overflow = '';

        // Clear hash if it matches
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

        document.body.style.overflow = 'hidden';
    }

    closeSection(sectionId, clearBackdrop = true) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        section.classList.remove('active');
        this.activeSections.delete(sectionId);

        // Hide backdrop if no sections are open
        if (clearBackdrop && this.activeSections.size === 0 && this.backdrop) {
            this.backdrop.classList.remove('active');
            document.body.style.overflow = '';
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

        document.body.style.overflow = '';
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

                // Scroll to it
                setTimeout(() => {
                    utils.scrollToElement(easterEgg, 100);
                }, 300);
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
}

// ============================================
// VIBE CODER HANDLER
// ============================================

class VibeCoderHandler {
    constructor() {
        this.trigger = document.getElementById('vibe-coder-trigger');
        this.isActive = false;
        this.init();
    }

    init() {
        if (!this.trigger) return;

        this.trigger.addEventListener('click', () => {
            this.isActive = !this.isActive;
            document.body.classList.toggle('vibe-mode');

            if (this.isActive) {
                console.log('%c VIBE MODE ACTIVATED ', 'background: #ff00c1; color: white; font-weight: bold;');
            } else {
                console.log('%c Vibe mode deactivated ', 'color: #888;');
            }
        });
    }
}

// ============================================
// TERMINAL HANDLER
// ============================================

class TerminalHandler {
    constructor() {
        this.overlay = document.getElementById('terminal-overlay');
        this.input = document.querySelector('.terminal-input');
        this.output = document.querySelector('.terminal-output');
        this.closeBtn = document.querySelector('.terminal-close');
        this.isOpen = false;
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        if (!this.overlay || !this.input) return;

        // Open terminal with Cmd+K or Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleTerminal();
            }
        });

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeTerminal());
        }

        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeTerminal();
            }
        });

        // Input handling
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.processCommand(command);
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.history.length - 1 - this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.history.length - 1 - this.historyIndex];
                } else if (this.historyIndex === 0) {
                    this.historyIndex = -1;
                    this.input.value = '';
                }
            }
        });
    }

    toggleTerminal() {
        if (this.isOpen) {
            this.closeTerminal();
        } else {
            this.openTerminal();
        }
    }

    openTerminal() {
        this.overlay.classList.add('active');
        this.input.focus();
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeTerminal() {
        this.overlay.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    processCommand(cmd) {
        if (!cmd) return;

        this.history.push(cmd);
        this.historyIndex = -1;

        this.printLine(`guest@lyubchak:~$ ${cmd}`, 'command');

        const command = cmd.toLowerCase().split(' ')[0];
        const args = cmd.split(' ').slice(1);

        switch (command) {
            case 'help':
                this.printLine('Available commands:');
                this.printLine('  help      - Show this help message');
                this.printLine('  clear     - Clear terminal output');
                this.printLine('  about     - Display about info');
                this.printLine('  contact   - Show contact details');
                this.printLine('  projects  - List projects');
                this.printLine('  sudo      - Try it and see');
                this.printLine('  exit      - Close terminal');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'about':
                this.printLine('Yuri Lyubchak - AI Researcher & Developer');
                this.printLine('Based in Ukraine. Leveraging modern AI to build cool stuff.');
                break;
            case 'contact':
                this.printLine('Email: yuri@lyubchak.com');
                this.printLine('Telegram: @LyoSU');
                this.printLine('GitHub: @LyoSU');
                break;
            case 'projects':
                this.printLine('Active Projects:');
                this.printLine('* fStikBot - Sticker manager');
                this.printLine('* LyBot - Music downloader');
                this.printLine('* QuotLyBot - Quote generator');
                this.printLine('* LyOSBot - Hacking simulator');
                break;
            case 'sudo':
                if (args.join(' ') === 'make me a sandwich') {
                    this.printLine('Make it yourself.', 'error');
                } else {
                    this.printLine('Permission denied: you are not root.', 'error');
                }
                break;
            case 'exit':
                this.closeTerminal();
                break;
            case 'ls':
                this.printLine('index.html  assets/  images/  README.md');
                break;
            case 'date':
                this.printLine(new Date().toString());
                break;
            case 'whoami':
                this.printLine('guest');
                break;
            case 'neofetch':
                this.showNeofetch();
                break;
            default:
                this.printLine(`Command not found: ${command}`, 'error');
        }

        // Scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }

    showNeofetch() {
        const logo = [
            '       /\\       ',
            '      /  \\      ',
            '     / /\\ \\     ',
            '    / /  \\ \\    ',
            '   / /    \\ \\   ',
            '  / /      \\ \\  ',
            ' / /        \\ \\ ',
            '/_/          \\_\\'
        ];

        const info = [
            { label: 'guest@lyubchak.com', value: '', header: true },
            { label: '------------------', value: '', header: true },
            { label: 'OS', value: 'LyOS v2.0.5 x86_64' },
            { label: 'Host', value: 'MacBook Pro (Web Edition)' },
            { label: 'Kernel', value: '5.15.0-ly-generic' },
            { label: 'Uptime', value: `${utils.calculateAge(new Date(1999, 1, 27))} years` },
            { label: 'Shell', value: 'LyShell 3.2.57' },
            { label: 'Resolution', value: `${window.innerWidth}x${window.innerHeight}` },
            { label: 'DE', value: 'CSS Grid' },
            { label: 'WM', value: 'Flexbox' },
            { label: 'Theme', value: 'Deep Purple [GTK2/3]' },
            { label: 'Icons', value: 'FontAwesome' },
            { label: 'Terminal', value: 'LyTerm' },
            { label: 'CPU', value: 'Neural Engine (Bio-based)' },
            { label: 'Memory', value: 'Loading...' }
        ];

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '20px';
        container.style.marginTop = '10px';
        container.style.marginBottom = '10px';
        container.style.fontFamily = 'monospace';
        container.style.lineHeight = '1.2';

        // Logo Column
        const logoDiv = document.createElement('div');
        logoDiv.style.color = 'var(--primary)';
        logoDiv.style.fontWeight = 'bold';
        logoDiv.innerHTML = logo.join('<br>').replace(/ /g, '&nbsp;');

        // Info Column
        const infoDiv = document.createElement('div');
        info.forEach(item => {
            const line = document.createElement('div');
            if (item.header) {
                line.style.fontWeight = 'bold';
                line.style.color = 'var(--primary)';
                line.textContent = item.label;
            } else {
                const labelSpan = document.createElement('span');
                labelSpan.style.color = 'var(--primary)';
                labelSpan.textContent = item.label;

                const valueSpan = document.createElement('span');
                valueSpan.style.color = '#fff';
                valueSpan.textContent = `: ${item.value}`;

                line.appendChild(labelSpan);
                line.appendChild(valueSpan);
            }
            infoDiv.appendChild(line);
        });

        // Color Palette
        const paletteDiv = document.createElement('div');
        paletteDiv.style.marginTop = '10px';
        const colors = ['#000', '#f00', '#0f0', '#ff0', '#00f', '#f0f', '#0ff', '#fff'];
        colors.forEach(color => {
            const block = document.createElement('span');
            block.style.display = 'inline-block';
            block.style.width = '20px';
            block.style.height = '10px';
            block.style.backgroundColor = color;
            block.style.marginRight = '2px';
            paletteDiv.appendChild(block);
        });
        infoDiv.appendChild(paletteDiv);

        container.appendChild(logoDiv);
        container.appendChild(infoDiv);

        this.output.appendChild(container);
    }

    printLine(text, type = 'normal') {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        div.textContent = text;

        if (type === 'error') {
            div.style.color = '#ff5555';
        } else if (type === 'command') {
            div.style.color = '#aaa';
        }

        this.output.appendChild(div);
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

    // Parallax effect
    new ParallaxEffect('.grid-bg', 0.3);

    // Animate elements on scroll
    new AnimationObserver('.contact-card, .project-item');

    // Easter egg handler
    new EasterEggHandler();

    // Donate page interactions
    new DonateInteractions();

    // Vibe Coder toggle
    new VibeCoderHandler();

    // Hidden Terminal
    new TerminalHandler();

    // Age Clicker (replaces simple updater)
    new AgeClicker('age', new Date(1999, 1, 27));

    // Console branding
    ConsoleBranding.init();
});
