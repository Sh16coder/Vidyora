document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);
    
    // Create quantum particles background
    createQuantumParticles();
    
    // Load collaborators data
    const collaborators = [
        {
            name: "NOVA PRIME",
            role: "design",
            roleDisplay: "DESIGN ORACLE",
            contribution: "Architect of visual realities. Crafts interfaces that bend perception and redefine user experience.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,1",
            social: {
                behance: "#",
                dribbble: "#",
                instagram: "#"
            }
        },
        {
            name: "QUANTUM VECTOR",
            role: "dev",
            roleDisplay: "CODE ARCHITECT",
            contribution: "Weaver of quantum algorithms. Builds systems that operate across multiple dimensions simultaneously.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,2",
            social: {
                github: "#",
                stackoverflow: "#",
                twitter: "#"
            }
        },
        {
            name: "SYNTAX OVERLORD",
            role: "dev",
            roleDisplay: "FRONTEND SHAMAN",
            contribution: "Channeler of browser spirits. Conjures responsive incantations that work across all planes of existence.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,3",
            social: {
                github: "#",
                codepen: "#",
                twitter: "#"
            }
        },
        {
            name: "NEURAL GHOST",
            role: "content",
            roleDisplay: "WORD WEAVER",
            contribution: "Manipulator of semantic fields. Crafts narratives that implant directly into the cerebral cortex.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,4",
            social: {
                medium: "#",
                twitter: "#",
                website: "#"
            }
        },
        {
            name: "BUG EXTERMINATOR",
            role: "testing",
            roleDisplay: "REALITY TESTER",
            contribution: "Hunter of dimensional anomalies. Ensures all code operates flawlessly across 11 spacetime dimensions.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,5",
            social: {
                github: "#",
                twitter: "#"
            }
        },
        {
            name: "TIME BENDER",
            role: "management",
            roleDisplay: "DIMENSION CURATOR",
            contribution: "Master of temporal logistics. Coordinates team efforts across multiple timelines simultaneously.",
            image: "https://source.unsplash.com/random/600x600/?cyberpunk,portrait,6",
            social: {
                linkedin: "#",
                twitter: "#"
            }
        }
    ];

    // Render initial collaborators
    renderPantheon(collaborators);
    
    // Set up search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    
    searchInput.addEventListener('input', debounce(filterPantheon, 300));
    roleFilter.addEventListener('change', filterPantheon);
    
    // Initialize hover sounds
    initHoverSounds();
    
    // Set up portal CTA
    const portalCTA = document.querySelector('.cta-portal');
    portalCTA.addEventListener('click', () => {
        gsap.to(portalCTA, {
            scale: 1.1,
            boxShadow: "0 0 50px rgba(0, 240, 255, 0.8)",
            duration: 0.3,
            yoyo: true,
            repeat: 1
        });
        // Add your join team functionality here
    });

    // Function to create quantum particles
    function createQuantumParticles() {
        const bg = document.querySelector('.quantum-bg');
        const particleCount = window.innerWidth < 768 ? 30 : 60;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * -20;
            const opacity = Math.random() * 0.5 + 0.1;
            
            // Apply styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = opacity;
            particle.style.animation = `quantumFloat ${duration}s ${delay}s infinite`;
            
            // Random color
            const colors = ['#00f0ff', '#ff00f5', '#a2ff00', '#c800ff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
            
            bg.appendChild(particle);
        }
    }
    
    // Function to render collaborators
    function renderPantheon(collabs) {
        const container = document.getElementById('pantheonGrid');
        container.innerHTML = '';
        
        if (collabs.length === 0) {
            container.innerHTML = `
                <div class="no-archons">
                    <i class="fas fa-question"></i>
                    <p>NO ARCHONS FOUND IN THIS DIMENSION</p>
                </div>
            `;
            return;
        }
        
        collabs.forEach((collab, index) => {
            const card = document.createElement('div');
            card.className = 'archon-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Generate social icons
            let socialIcons = '';
            for (const [platform, url] of Object.entries(collab.social)) {
                let iconClass;
                switch(platform) {
                    case 'twitter': iconClass = 'fab fa-twitter'; break;
                    case 'github': iconClass = 'fab fa-github'; break;
                    case 'linkedin': iconClass = 'fab fa-linkedin-in'; break;
                    case 'dribbble': iconClass = 'fab fa-dribbble'; break;
                    case 'behance': iconClass = 'fab fa-behance'; break;
                    case 'instagram': iconClass = 'fab fa-instagram'; break;
                    case 'medium': iconClass = 'fab fa-medium-m'; break;
                    case 'stackoverflow': iconClass = 'fab fa-stack-overflow'; break;
                    case 'codepen': iconClass = 'fab fa-codepen'; break;
                    case 'website': iconClass = 'fas fa-globe'; break;
                    default: iconClass = 'fas fa-link';
                }
                
                socialIcons += `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" 
                       class="social-link" data-platform="${platform}">
                        <i class="${iconClass}"></i>
                    </a>
                `;
            }
            
            card.innerHTML = `
                <div class="archon-image" style="background-image: url('${collab.image}')">
                    <h3 class="archon-name">${collab.name}</h3>
                </div>
                <div class="archon-details">
                    <span class="archon-role">${collab.roleDisplay}</span>
                    <p class="archon-contribution">${collab.contribution}</p>
                    <div class="archon-social">
                        ${socialIcons}
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            // GSAP animation for card entrance
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.05,
                ease: "back.out(1.2)"
            });
        });
        
        // Re-initialize hover sounds for new cards
        initHoverSounds();
    }
    
    // Function to filter collaborators
    function filterPantheon() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRole = roleFilter.value;
        
        const filtered = collaborators.filter(collab => {
            const matchesSearch = 
                collab.name.toLowerCase().includes(searchTerm) || 
                collab.roleDisplay.toLowerCase().includes(searchTerm) || 
                collab.contribution.toLowerCase().includes(searchTerm);
            
            const matchesRole = selectedRole === 'all' || collab.role === selectedRole;
            
            return matchesSearch && matchesRole;
        });
        
        renderPantheon(filtered);
    }
    
    // Function to initialize hover sounds
    function initHoverSounds() {
        const hoverSound = document.getElementById('hoverSound');
        const hoverElements = document.querySelectorAll('.archon-card, .social-link, .quantum-dropdown, .ai-search-field, .cta-portal');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoverSound.currentTime = 0;
                hoverSound.play();
            });
        });
    }
    
    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Add floating animation to quantum particles
    gsap.to('.quantum-particle', {
        y: () => Math.random() * 40 - 20,
        x: () => Math.random() * 40 - 20,
        duration: () => Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
    
    // Add parallax effect to header
    gsap.to('.pantheon-header', {
        scrollTrigger: {
            trigger: '.pantheon-container',
            start: "top top",
            end: "+=500",
            scrub: true
        },
        y: 100,
        opacity: 0.5,
        scale: 0.9
    });
});
