document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6c5ce7" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#6c5ce7", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
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
    
    // Class card click handler
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.addEventListener('click', function() {
            const classNum = this.getAttribute('data-class');
            window.location.href = `notes_class_${classNum}.html`;
        });
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
    const chapterHeaders = document.querySelectorAll('.chapter-header');
    chapterHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const chapterCard = this.parentElement;
            chapterCard.classList.toggle('active');
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    function performSearch() {
        const query = searchInput.value.toLowerCase();
        if (!query) return;
        
        const activePane = document.querySelector('.subject-pane.active');
        const noteSections = activePane.querySelectorAll('.note-section');
        
        noteSections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(query)) {
                section.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
                setTimeout(() => {
                    section.style.backgroundColor = '';
                }, 2000);
                
                // Scroll to the section
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
    
    // Bookmark functionality
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('fas');
            this.classList.toggle('far');
            
            if (this.classList.contains('fas')) {
                this.style.color = 'var(--accent-color)';
            } else {
                this.style.color = '';
            }
        });
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
    printBtn.style.boxShadow = 'var(--shadow)';
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
    
    if (window.location.pathname.includes('notes_class')) {
        document.body.appendChild(printBtn);
    }
});