// ============================================
// MODERN PURPLE AESTHETIC - JS
// ============================================

// Collapsible Sections
const sectionButtons = document.querySelectorAll('[data-section]');
const closeBtns = document.querySelectorAll('[data-close]');

sectionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.getAttribute('data-section');

        // Handle projects modal separately
        if (sectionId === 'projects') {
            openProjectsModal();
            return;
        }

        const section = document.getElementById(sectionId);

        if (section) {
            // Close other sections
            document.querySelectorAll('.collapsible-section').forEach(s => {
                if (s !== section) {
                    s.classList.remove('active');
                }
            });

            // Toggle current section
            section.classList.toggle('active');
        }
    });
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.getAttribute('data-close');
        const section = document.getElementById(sectionId);

        if (section) {
            section.classList.remove('active');
        }
    });
});

// Projects Modal
const projectsModal = document.getElementById('projects-modal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

function openProjectsModal() {
    if (projectsModal) {
        projectsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProjectsModal() {
    if (projectsModal) {
        projectsModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (modalClose) {
    modalClose.addEventListener('click', closeProjectsModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeProjectsModal);
}

// Close modal and sections on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectsModal();

        // Close all collapsible sections
        document.querySelectorAll('.collapsible-section').forEach(s => {
            s.classList.remove('active');
        });
    }
});

// Hash Navigation
function handleHashChange() {
    const hash = window.location.hash.substring(1);

    if (hash === 'projects') {
        openProjectsModal();
    } else if (hash) {
        const section = document.getElementById(hash);
        if (section && section.classList.contains('collapsible-section')) {
            // Close all sections first
            document.querySelectorAll('.collapsible-section').forEach(s => {
                s.classList.remove('active');
            });

            // Open the target section
            section.classList.add('active');
        }
    }
}

// Handle initial hash
if (window.location.hash) {
    setTimeout(handleHashChange, 500);
}

// Handle hash changes
window.addEventListener('hashchange', handleHashChange);

// Update hash when opening sections
sectionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.getAttribute('data-section');
        window.location.hash = sectionId;
    });
});

// Clear hash when closing sections
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        history.replaceState(null, null, ' ');
    });
});

// Copy to clipboard functionality for inputs
document.querySelectorAll('input[readonly]').forEach(input => {
    input.addEventListener('click', function() {
        this.select();
        this.setSelectionRange(0, 99999); // For mobile devices

        // Modern clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.value).then(() => {
                showCopyFeedback(this);
            }).catch(() => {
                // Fallback to execCommand
                document.execCommand('copy');
                showCopyFeedback(this);
            });
        } else {
            // Fallback to execCommand
            document.execCommand('copy');
            showCopyFeedback(this);
        }
    });
});

function showCopyFeedback(input) {
    // Visual feedback
    const originalBorder = input.style.borderColor;
    input.style.borderColor = '#cbafff';
    input.style.boxShadow = '0 0 15px rgba(203, 175, 255, 0.5)';

    setTimeout(() => {
        input.style.borderColor = originalBorder;
        input.style.boxShadow = '';
    }, 400);
}

// Smooth hover effects for contact cards
document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Terminal typing effect (optional enhancement)
const terminalPrompt = document.querySelector('.terminal-header .prompt');
if (terminalPrompt) {
    const originalText = terminalPrompt.textContent;
    let index = 0;

    // Only run typing effect on first load
    if (!sessionStorage.getItem('terminalTyped')) {
        terminalPrompt.textContent = '';

        function typeCharacter() {
            if (index < originalText.length) {
                terminalPrompt.textContent += originalText.charAt(index);
                index++;
                setTimeout(typeCharacter, 50);
            } else {
                sessionStorage.setItem('terminalTyped', 'true');
            }
        }

        setTimeout(typeCharacter, 300);
    }
}

// Parallax effect for background
let lastScrollTop = 0;
const gridBg = document.querySelector('.grid-bg');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (gridBg) {
        gridBg.style.transform = `translateY(${scrollTop * 0.3}px)`;
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });

// Console welcome message
console.log(
    '%c LYUBCHAK.COM ',
    'background: linear-gradient(135deg, #d6bfff, #b58dff); color: #1c132c; font-weight: bold; padding: 10px 20px; font-size: 14px; border-radius: 3px;'
);
console.log(
    '%c Made in Ukraine ',
    'color: #cbafff; font-family: monospace; font-size: 12px;'
);
