// ============================================
// LYUBCHAK.COM — Clean JS
// ============================================

'use strict';

// ============================================
// UTILITIES
// ============================================

const utils = {
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    copyToClipboard(text, element) {
        navigator.clipboard.writeText(text);
        if (element) {
            element.classList.add('copied');
            setTimeout(() => element.classList.remove('copied'), 1500);
        }
    }
};

// ============================================
// AGE DISPLAY
// ============================================

class AgeDisplay {
    constructor(elementId, birthDate) {
        this.element = document.getElementById(elementId);
        this.birthDate = birthDate;
        this.mode = 0;
        this.init();
    }

    init() {
        if (!this.element) return;
        this.element.textContent = utils.calculateAge(this.birthDate);
        this.element.style.cursor = 'pointer';
        this.element.title = 'Click to change format';
        this.element.addEventListener('click', () => this.cycle());
    }

    cycle() {
        this.mode = (this.mode + 1) % 4;
        const age = utils.calculateAge(this.birthDate);
        const diff = Math.abs(new Date() - this.birthDate);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        const formats = [
            age,
            `${days} days`,
            `0x${age.toString(16)}`,
            age.toString(2)
        ];
        this.element.textContent = formats[this.mode];
    }
}

// ============================================
// MODAL MANAGER
// ============================================

class ModalManager {
    constructor() {
        this.backdrop = document.getElementById('section-backdrop');
        this.activeSection = null;
        this.activeModal = null;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAll();
        });

        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeAll());
        }

        // Handle initial hash
        if (window.location.hash) {
            setTimeout(() => this.handleHash(), 100);
        }
        window.addEventListener('hashchange', () => this.handleHash());
    }

    handleHash() {
        const hash = window.location.hash.substring(1);
        if (hash === 'projects') {
            this.openModal('projects-modal');
        } else if (hash) {
            this.openSection(hash);
        }
    }

    openSection(id) {
        const section = document.getElementById(id);
        if (!section) return;

        this.closeAll();
        section.classList.add('active');
        this.backdrop?.classList.add('active');
        this.activeSection = section;
        document.body.style.overflow = 'hidden';
    }

    closeSection() {
        if (this.activeSection) {
            this.activeSection.classList.remove('active');
            this.activeSection = null;
        }
        this.backdrop?.classList.remove('active');
        document.body.style.overflow = '';
        if (window.location.hash) {
            history.replaceState(null, null, ' ');
        }
    }

    openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;

        this.closeAll();
        modal.classList.add('active');
        this.activeModal = modal;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            this.activeModal = null;
        }
        document.body.style.overflow = '';
        if (window.location.hash) {
            history.replaceState(null, null, ' ');
        }
    }

    closeAll() {
        this.closeSection();
        this.closeModal();
    }
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.init();
    }

    init() {
        // Section buttons
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-section');
                if (id === 'projects') {
                    this.modalManager.openModal('projects-modal');
                } else {
                    this.modalManager.openSection(id);
                }
                window.location.hash = id;
            });
        });

        // Close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modalManager.closeSection();
            });
        });

        // Modal close button
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.modalManager.closeModal();
        });

        // Modal overlay click
        document.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.modalManager.closeModal();
        });
    }
}

// ============================================
// EASTER EGGS
// ============================================

class EasterEggs {
    constructor() {
        this.avatarClicks = 0;
        this.coffeeCount = 0;
        this.init();
    }

    init() {
        // Avatar click - Nintendo Switch code
        const avatar = document.querySelector('.avatar');
        const easterEgg = document.getElementById('switch-easter-egg');
        if (avatar && easterEgg) {
            let resetTimer;
            avatar.addEventListener('click', () => {
                this.avatarClicks++;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => this.avatarClicks = 0, 2000);
                if (this.avatarClicks === 3) {
                    easterEgg.classList.add('revealed');
                    this.avatarClicks = 0;
                }
            });
        }

        // Copy egg code
        const eggCode = document.querySelector('.egg-code');
        if (eggCode) {
            eggCode.addEventListener('click', () => {
                utils.copyToClipboard(eggCode.value, eggCode);
            });
        }

        // Coffee counter
        const coffeeIcon = document.querySelector('.coffee-icon');
        const coffeeNum = document.querySelector('.coffee-num');
        if (coffeeIcon && coffeeNum) {
            coffeeIcon.addEventListener('click', () => {
                this.coffeeCount++;
                if (this.coffeeCount < 10) coffeeNum.textContent = this.coffeeCount;
                else if (this.coffeeCount === 10) coffeeNum.textContent = '∞';
                else if (this.coffeeCount === 20) coffeeNum.textContent = '∞²';
                else if (this.coffeeCount === 42) coffeeNum.textContent = '42';
                else if (this.coffeeCount > 50) {
                    coffeeNum.textContent = '☕';
                    this.coffeeCount = 0;
                }
            });
        }

        // Vibe coder mode
        const vibeTrigger = document.getElementById('vibe-coder-trigger');
        if (vibeTrigger) {
            vibeTrigger.addEventListener('click', () => {
                document.body.classList.toggle('vibe-mode');
            });
        }
    }
}

// ============================================
// TERMINAL
// ============================================

class Terminal {
    constructor() {
        this.overlay = document.getElementById('terminal-overlay');
        this.input = document.querySelector('.terminal-input');
        this.output = document.querySelector('.terminal-output');
        this.history = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        if (!this.overlay || !this.input) return;

        // Cmd+K / Ctrl+K to open
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close button
        document.querySelector('.terminal-close')?.addEventListener('click', () => this.close());

        // Click outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Input
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) this.run(cmd);
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
                } else {
                    this.historyIndex = -1;
                    this.input.value = '';
                }
            }
        });
    }

    toggle() {
        this.overlay.classList.contains('active') ? this.close() : this.open();
    }

    open() {
        this.overlay.classList.add('active');
        this.input.focus();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    clearOutput() {
        while (this.output.firstChild) {
            this.output.removeChild(this.output.firstChild);
        }
    }

    run(cmd) {
        this.history.push(cmd);
        this.historyIndex = -1;
        this.print(`$ ${cmd}`, '#888');

        const [command, ...args] = cmd.toLowerCase().split(' ');

        const commands = {
            help: () => {
                this.print('Available commands:', '#cbafff');
                this.print('  about     — who am I');
                this.print('  skills    — tech stack');
                this.print('  ai        — AI/LLM expertise');
                this.print('  projects  — my work');
                this.print('  contact   — get in touch');
                this.print('  neofetch  — system info');
                this.print('  clear     — clear screen');
                this.print('  exit      — close terminal');
            },
            clear: () => {
                this.clearOutput();
            },
            about: () => {
                this.print('Yuri Lyubchak', '#cbafff');
                this.print('Full-Stack Developer from Ukraine');
                this.print('Telegram bots for millions, enterprise AI for business');
                this.print('10+ years · 3M+ users · 150+ projects · 800+ GitHub stars');
            },
            skills: () => {
                this.print('Languages:', '#cbafff');
                this.print('  TypeScript, JavaScript, Python, Go, Swift');
                this.print('Backend:', '#cbafff');
                this.print('  Node.js, NestJS, Fastify, Hono, Express');
                this.print('Frontend:', '#cbafff');
                this.print('  React, Next.js, Vite, Tailwind CSS');
                this.print('AI/LLM:', '#cbafff');
                this.print('  OpenAI, Claude, Gemini, LangChain, Qdrant, RAG');
                this.print('Telegram:', '#cbafff');
                this.print('  Telegraf, grammY, TDLib, MTProto, Mini Apps');
                this.print('Data:', '#cbafff');
                this.print('  MongoDB, Redis, PostgreSQL, BullMQ');
                this.print('Infra:', '#cbafff');
                this.print('  Docker, PM2, Sentry, Prometheus');
            },
            ai: () => {
                this.print('AI/LLM Engineering', '#cbafff');
                this.print('─────────────────');
                this.print('Models:     OpenAI GPT, Claude, Gemini, ElevenLabs');
                this.print('Frameworks: LangChain, Vertex AI, Transformers.js');
                this.print('Vector DB:  Qdrant, HNSWLib, FlexSearch');
                this.print('RAG:        PDF/Excel indexing, semantic search');
                this.print('ML:         TensorFlow.js, NSFW detection, NMT');
                this.print('Infra:      Dify, LangFuse, LiteLLM');
                this.print('');
                this.print('Production AI in Telegram bots, enterprise tools,');
                this.print('RAG systems, and analytics dashboards.');
            },
            contact: () => {
                this.print('Telegram: @LyDev');
                this.print('GitHub:   @LyoSU');
                this.print('LinkedIn: /in/lyubchak');
                this.print('Email:    yuri@lyubchak.com');
            },
            projects: () => {
                this.print('fStik      — 800K MAU, #1 sticker platform', '#cbafff');
                this.print('QuotLyBot  — 80K+ groups, 370+ stars');
                this.print('LyBot      — YouTube Music bot');
                this.print('LyOSBot    — Hacker simulator game');
                this.print('');
                this.print('40+ bots, 150+ projects total.', '#888');
                this.print('Follow @LyBlog for updates.', '#888');
            },
            neofetch: () => {
                this.print('ly@lyubchak.com', '#cbafff');
                this.print('─────────────────');
                this.print('OS:       LyOS v2.0');
                this.print('Host:     Ukraine');
                this.print('Uptime:   10+ years');
                this.print('Users:    3M+');
                this.print('Projects: 150+');
                this.print('Bots:     40+');
                this.print('Stars:    800+');
                this.print('Stack:    TypeScript, Node.js, React');
                this.print('AI:       OpenAI, Claude, Gemini');
            },
            exit: () => this.close(),
            whoami: () => this.print('guest'),
            date: () => this.print(new Date().toLocaleString()),
            ls: () => this.print('index.html  assets/  images/  README.md'),
            pwd: () => this.print('/home/guest/lyubchak.com'),
            sudo: () => this.print('Nice try 😏', '#f55'),
            rm: () => this.print('Permission denied. This is a read-only filesystem.', '#f55'),
            cat: () => {
                if (args[0] === 'readme.md' || args[0] === 'readme') {
                    this.print('# Yuri Lyubchak', '#cbafff');
                    this.print('Building things that scale.');
                    this.print('Open source enthusiast. 800+ GitHub stars.');
                } else {
                    this.print(`cat: ${args[0] || 'missing file'}: No such file`);
                }
            },
            echo: () => this.print(args.join(' ')),
            coffee: () => {
                this.print('☕ Brewing...');
                setTimeout(() => this.print('☕☕☕ Coffee ready!', '#cbafff'), 500);
            },
            matrix: () => {
                this.print('Wake up, Neo...', '#0f0');
                setTimeout(() => this.print('The Matrix has you...', '#0f0'), 1000);
                setTimeout(() => this.print('Follow the white rabbit. 🐇', '#0f0'), 2000);
            },
            ping: () => {
                this.print('PING lyubchak.com');
                this.print('64 bytes: time=0.042ms');
                this.print('64 bytes: time=0.038ms');
                this.print('--- lyubchak.com ping statistics ---');
                this.print('2 packets transmitted, 2 received, 0% loss');
            },
            hire: () => {
                this.print('📧 Sending email to yuri@lyubchak.com...', '#cbafff');
                setTimeout(() => {
                    this.print('Just kidding! Use the contact info above 😄');
                }, 800);
            },
        };

        if (commands[command]) {
            commands[command]();
        } else {
            this.print(`Command not found: ${command}`, '#f55');
        }

        this.output.scrollTop = this.output.scrollHeight;
    }

    print(text, color = '#0f0') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        line.style.color = color;
        this.output.appendChild(line);
    }
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Age display
    new AgeDisplay('age', new Date(1999, 1, 27));

    // Modals & navigation
    const modalManager = new ModalManager();
    new Navigation(modalManager);

    // Easter eggs
    new EasterEggs();

    // Terminal
    const terminal = new Terminal();

    // Terminal hint click + platform detection
    const terminalHint = document.getElementById('terminal-hint');
    if (terminalHint) {
        const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
        terminalHint.querySelector('kbd').textContent = isMac ? '⌘K' : 'Ctrl+K';
        terminalHint.addEventListener('click', () => terminal.open());
    }

    // Console branding
    console.log('%c LYUBCHAK.COM ', 'background: linear-gradient(135deg, #d6bfff, #b58dff); color: #1c132c; font-weight: bold; padding: 8px 16px; border-radius: 20px;');
});
