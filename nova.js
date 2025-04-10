document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    setTimeout(function() {
        document.querySelector('.preloader').classList.add('fade-out');
    }, 2000);

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');

    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navbar.classList.toggle('active');
        
        // Toggle body scroll when menu is open
        if (navbar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function() {
            if (navbar.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navbar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            document.querySelector('.header').classList.add('scrolled');
        } else {
            document.querySelector('.header').classList.remove('scrolled');
        }
    });

    // Animated stats counter
    function animateValue(id, start, end, duration) {
        let startTimestamp = null;
        const element = document.getElementById(id);
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Start counters when hero section is in view
    const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateValue('study-hours', 0, 1274, 2000);
            animateValue('notes-taken', 0, 328, 2000);
            heroObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    heroObserver.observe(document.querySelector('.hero'));

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const diaryTabs = document.querySelectorAll('.diary-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter diary entries (in a real app, this would fetch different content)
            // For demo, we're just toggling a class that could be used for filtering
            document.querySelector('.diary-content').setAttribute('data-active-tab', tabId);
        });
    });

    // Category filter functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    const resourceCards = document.querySelectorAll('.resource-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter resources
            resourceCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Quick action buttons
    const quickNoteBtn = document.querySelector('.quick-note');
    quickNoteBtn.addEventListener('click', function() {
        alert("Quick note feature would open a note-taking modal in a real implementation!");
    });

    const studyTimerBtn = document.querySelector('.study-timer');
    studyTimerBtn.addEventListener('click', function() {
        alert("Study timer would open a timer/pomodoro app in a real implementation!");
    });

    // Music player functionality
    const playBtn = document.querySelector('.play-btn');
    playBtn.addEventListener('click', function() {
        this.classList.toggle('playing');
        const icon = this.querySelector('i');
        if (this.classList.contains('playing')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });

    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.tip-card, .diary-card, .resource-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animation
    const animatedElements = document.querySelectorAll('.tip-card, .diary-card, .resource-card');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load

    // Floating music player hide/show on scroll
    let lastScrollPosition = 0;
    const musicPlayer = document.querySelector('.music-player');
    
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.scrollY;
        
        if (currentScrollPosition > lastScrollPosition) {
            // Scrolling down
            musicPlayer.style.transform = 'translateY(100px)';
        } else {
            // Scrolling up
            musicPlayer.style.transform = 'translateY(0)';
        }
        
        lastScrollPosition = currentScrollPosition;
    });
});
