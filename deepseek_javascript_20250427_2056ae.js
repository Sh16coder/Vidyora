document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen initially
    document.querySelector('.loading-screen').classList.add('active');
    
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { 
                value: 80, 
                density: { 
                    enable: true, 
                    value_area: 800 
                } 
            },
            color: { 
                value: "#6c5ce7" 
            },
            shape: { 
                type: "circle" 
            },
            opacity: { 
                value: 0.5, 
                random: true 
            },
            size: { 
                value: 3, 
                random: true 
            },
            line_linked: { 
                enable: true, 
                distance: 150, 
                color: "#6c5ce7", 
                opacity: 0.4, 
                width: 1 
            },
            move: { 
                enable: true, 
                speed: 2, 
                direction: "none", 
                random: true, 
                straight: false, 
                out_mode: "out" 
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { 
                    enable: true, 
                    mode: "repulse" 
                },
                onclick: { 
                    enable: true, 
                    mode: "push" 
                }
            }
        }
    });
    
    // Hide loading screen after everything loads
    window.addEventListener('load', function() {
        setTimeout(function() {
            document.querySelector('.loading-screen').classList.remove('active');
        }, 1000);
    });
    
    // Theme toggle functionality
    const themeSwitch = document.getElementById('theme-switch');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeSwitch.checked = true;
        }
    }
    
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const panes = document.querySelectorAll('.subject-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(subject).classList.add('active');
        });
    });
    
    // Chapter accordion functionality
    function initChapterAccordions() {
        const chapterHeaders = document.querySelectorAll('.chapter-header');
        chapterHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const chapterCard = this.parentElement;
                chapterCard.classList.toggle('active');
            });
        });
    }
    
    initChapterAccordions();
    
    // Bookmark functionality
    function initBookmarkButtons() {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
        
        // Load saved bookmarks from localStorage
        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
        
        bookmarkBtns.forEach(btn => {
            // Get unique identifier for this note (you might need to add data attributes)
            const noteId = btn.closest('.note-section').querySelector('h4').textContent;
            
            // Set initial state if bookmarked
            if (savedBookmarks[noteId]) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-bookmark"></i>';
            }
            
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                
                // Update icon
                if (this.classList.contains('active')) {
                    this.innerHTML = '<i class="fas fa-bookmark"></i>';
                    savedBookmarks[noteId] = true;
                } else {
                    this.innerHTML = '<i class="far fa-bookmark"></i>';
                    delete savedBookmarks[noteId];
                }
                
                // Save to localStorage
                localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));
                
                // Animate
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
            });
        });
    }
    
    initBookmarkButtons();
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const activePane = document.querySelector('.subject-pane.active');
        const noteSections = activePane.querySelectorAll('.note-section');
        let found = false;
        
        noteSections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(query)) {
                found = true;
                section.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
                setTimeout(() => {
                    section.style.backgroundColor = '';
                }, 2000);
                
                // Expand chapter if collapsed
                const chapterCard = section.closest('.chapter-card');
                if (!chapterCard.classList.contains('active')) {
                    chapterCard.classList.add('active');
                }
                
                // Scroll to the section
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        if (!found) {
            showToast('No results found for "' + query + '"');
        }
    }
    
    // Help modal functionality
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    helpBtn.addEventListener('click', function() {
        helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close modal when clicking outside
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // FAB hover effect
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('mouseenter', function() {
            this.querySelector('.fab-options').style.opacity = '1';
            this.querySelector('.fab-options').style.pointerEvents = 'all';
            this.querySelector('.fab-options').style.transform = 'translateY(0)';
        });
        
        fab.addEventListener('mouseleave', function() {
            this.querySelector('.fab-options').style.opacity = '0';
            this.querySelector('.fab-options').style.pointerEvents = 'none';
            this.querySelector('.fab-options').style.transform = 'translateY(20px)';
        });
    }
    
    // Toast notification function
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Add toast styles dynamically
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            z-index: 1000;
            transition: transform 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(toastStyles);
    
    // Print button functionality
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print';
    printBtn.classList.add('print-btn');
    printBtn.style.position = 'fixed';
    printBtn.style.bottom = '2rem';
    printBtn.style.left = '2rem';
    printBtn.style.padding = '0.75rem 1.5rem';
    printBtn.style.background = 'var(--primary-color)';
    printBtn.style.color = 'white';
    printBtn.style.border = 'none';
    printBtn.style.borderRadius = 'var(--border-radius)';
    printBtn.style.cursor = 'pointer';
    printBtn.style.zIndex = '100';
    printBtn.style.display = 'flex';
    printBtn.style.alignItems = 'center';
    printBtn.style.gap = '0.5rem';
    printBtn.style.boxShadow = 'var(--card-shadow)';
    printBtn.style.transition = 'var(--transition)';
    
    printBtn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--accent-color)';
        this.style.transform = 'translateY(-3px)';
    });
    
    printBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--primary-color)';
        this.style.transform = '';
    });
    
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    document.body.appendChild(printBtn);
    
    // Filter functionality
    const chapterFilter = document.getElementById('chapter-filter');
    if (chapterFilter) {
        chapterFilter.addEventListener('change', function() {
            const value = this.value;
            const chapters = document.querySelectorAll('.chapter-card');
            
            chapters.forEach(chapter => {
                if (value === 'all') {
                    chapter.style.display = '';
                } else {
                    const chapterNum = chapter.querySelector('h3').textContent.match(/Chapter (\d+)/)[1];
                    chapter.style.display = chapterNum === value ? '' : 'none';
                }
            });
        });
    }
});