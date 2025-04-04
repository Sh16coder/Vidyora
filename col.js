document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#A29BFE"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#6C5CE7",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": true,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 0.5
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Sample collaborator data with more details
    const collaborators = [
        {
            name: "ADMIN",
            role: "development and design",
            roleDisplay: "Frontend Architect",
            contribution: "Building the whole website, creating different pages and integrating ai , mentor.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                twitter: "#",
                github: "#",
                linkedin: "#",
                codepen: "#"
            }
        },
        {
            name: "Aditya Chaturvedi",
            role: "MENTOR",
            roleDisplay: "UX Visionary",
            contribution: "Creating beautiful user interfaces with Figma and Adobe XD. Leads user research and testing to improve experience flows and accessibility.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
            social: {
                dribbble: "#",
                behance: "#",
                instagram: "#"
            }
        },
        {
            name: "Michael Chen",
            role: "content",
            roleDisplay: "Content Strategist",
            contribution: "Writing engaging content and optimizing for SEO. Develops content frameworks and maintains brand voice across all platforms.",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                medium: "#",
                twitter: "#",
                website: "#"
            }
        },
        {
            name: "Emily Rodriguez",
            role: "testing",
            roleDisplay: "QA Engineer",
            contribution: "Implementing automated testing with Cypress and Jest. Ensures bug-free releases through rigorous manual and automated testing protocols.",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                twitter: "#",
                github: "#"
            }
        },
        {
            name: "David Kim",
            role: "development",
            roleDisplay: "Backend Wizard",
            contribution: "Building scalable server infrastructure with Node.js and Django. Designs efficient database architectures and secure API endpoints.",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                github: "#",
                stackoverflow: "#",
                linkedin: "#"
            }
        },
        {
            name: "Jessica Lee",
            role: "management",
            roleDisplay: "Project Director",
            contribution: "Coordinating team efforts using Agile methodologies. Ensures project milestones are met while maintaining work-life balance for the team.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                linkedin: "#",
                twitter: "#"
            }
        },
        {
            name: "Raj Patel",
            role: "design",
            roleDisplay: "UI Designer",
            contribution: "Creating pixel-perfect interfaces and design systems. Specializes in micro-interactions and motion design to enhance user engagement.",
            image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                dribbble: "#",
                instagram: "#",
                twitter: "#"
            }
        },
        {
            name: "Olivia Martinez",
            role: "content",
            roleDisplay: "Technical Writer",
            contribution: "Creating comprehensive documentation and tutorials. Makes complex technical concepts accessible to all audience levels.",
            image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            social: {
                medium: "#",
                github: "#"
            }
        }
    ];

    const container = document.getElementById('collaboratorsContainer');
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');

    // Display all collaborators initially
    displayCollaborators(collaborators);

    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterCollaborators, 300);
    });
    
    roleFilter.addEventListener('change', filterCollaborators);

    function filterCollaborators() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRole = roleFilter.value;

        const filtered = collaborators.filter(collaborator => {
            const matchesSearch = 
                collaborator.name.toLowerCase().includes(searchTerm) || 
                collaborator.roleDisplay.toLowerCase().includes(searchTerm) || 
                collaborator.contribution.toLowerCase().includes(searchTerm);
            
            const matchesRole = selectedRole === 'all' || collaborator.role === selectedRole;
            
            return matchesSearch && matchesRole;
        });

        displayCollaborators(filtered);
    }

    function displayCollaborators(collabs) {
        container.innerHTML = '';

        if (collabs.length === 0) {
            container.innerHTML = '<p class="no-results">No collaborators found matching your criteria.</p>';
            return;
        }

        collabs.forEach((collab, index) => {
            const card = document.createElement('div');
            card.className = 'collaborator-card';
            card.style.animationDelay = `${index * 0.1}s`;

            // Get social icons based on available platforms
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
                       aria-label="${platform}" data-tooltip="${platform}">
                        <i class="${iconClass}"></i>
                    </a>
                `;
            }

            card.innerHTML = `
                <div class="collaborator-image" style="background-image: url('${collab.image}')">
                    <h3 class="collaborator-name">${collab.name}</h3>
                </div>
                <div class="collaborator-details">
                    <span class="collaborator-role">${collab.roleDisplay}</span>
                    <p class="collaborator-contribution">${collab.contribution}</p>
                    <div class="social-links">
                        ${socialIcons}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        // Initialize tooltips
        initTooltips();
    }

    function initTooltips() {
        const socialLinks = document.querySelectorAll('.social-links a');
        
        socialLinks.forEach(link => {
            const tooltip = link.getAttribute('data-tooltip');
            if (tooltip) {
                link.addEventListener('mouseenter', (e) => {
                    const tooltipEl = document.createElement('div');
                    tooltipEl.className = 'social-tooltip';
                    tooltipEl.textContent = tooltip;
                    document.body.appendChild(tooltipEl);
                    
                    const rect = link.getBoundingClientRect();
                    tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
                    tooltipEl.style.top = `${rect.top - 40}px`;
                    
                    link.addEventListener('mouseleave', () => {
                        tooltipEl.remove();
                    }, { once: true });
                });
            }
        });
    }

    // Add floating button click handler
    document.querySelector('.cta-button').addEventListener('click', function() {
        // Add your join team functionality here
        alert('Thank you for your interest in joining our team!');
    });
});
