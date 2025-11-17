document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinksContainerWrapper = document.querySelector('.nav-links-container');
    const navIndicator = document.querySelector('.nav-indicator');
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-links li');
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const htmlElement = document.documentElement; // Target <html> tag for theme attribute

    // --- Theme Switching ---
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            if(sunIcon) sunIcon.style.display = 'none';
            if(moonIcon) moonIcon.style.display = 'block';
        } else {
            if(sunIcon) sunIcon.style.display = 'block';
            if(moonIcon) moonIcon.style.display = 'none';
        }
        // Recalculate indicator on theme change in case properties affecting layout change
        const currentActiveLi = document.querySelector('.nav-links li.active');
        if (currentActiveLi) {
            // Use setTimeout to allow rendering changes to apply before measuring
            setTimeout(() => moveIndicator(currentActiveLi), 50);
        }
    }

    // Apply saved or default theme on load
    applyTheme(savedTheme);

    themeToggleButton.addEventListener('click', () => {
        let currentTheme = htmlElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Save preference
    });


    // --- Navigation Indicator and Section Switching ---
    function moveIndicator(targetLi) {
        if (!targetLi || !navIndicator || !navLinksContainer) return;

        const linkRect = targetLi.getBoundingClientRect();
        const containerRect = navLinksContainer.getBoundingClientRect(); // Use navLinksContainer for relative positioning

        // Calculate position relative to the navLinksContainer, accounting for scroll
        const offsetLeft = targetLi.offsetLeft; // Use offsetLeft relative to parent UL
        const targetWidth = linkRect.width; // Use bounding rect for accurate width

        // Apply styles
        navIndicator.style.left = `${offsetLeft}px`;
        navIndicator.style.width = `${targetWidth}px`;

        // Update active class on list items
        navItems.forEach(item => item.classList.remove('active'));
        targetLi.classList.add('active');

        // Ensure the active item is visible in horizontal scroll
        scrollToActiveNavItem(targetLi);
    }

    function scrollToActiveNavItem(targetLi) {
        if (!targetLi || !navLinksContainerWrapper) return;

        // Check if horizontal scrolling is active (when container has overflow)
        if (navLinksContainerWrapper.scrollWidth > navLinksContainerWrapper.clientWidth) {
            const containerRect = navLinksContainerWrapper.getBoundingClientRect();
            const linkRect = targetLi.getBoundingClientRect();
            
            // Calculate if the item is out of view
            const isItemVisible = linkRect.left >= containerRect.left && 
                                linkRect.right <= containerRect.right;
            
            if (!isItemVisible) {
                // Calculate scroll position to center the item
                const scrollLeft = targetLi.offsetLeft - (navLinksContainerWrapper.clientWidth / 2) + (targetLi.offsetWidth / 2);
                
                // Smooth scroll to the calculated position
                navLinksContainerWrapper.scrollTo({
                    left: Math.max(0, scrollLeft),
                    behavior: 'smooth'
                });
            }
        }
    }

    function showSection(sectionId) {
        let found = false;
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active-section');
                found = true;
            } else {
                section.classList.remove('active-section');
            }
        });
        // Fallback if section ID doesn't match any section
        if (!found && sections.length > 0) {
             sections[0].classList.add('active-section'); // Show the first section
        }
    }

    // --- Initial Setup ---
    let initialActiveLi = null;
    const defaultActiveSection = document.querySelector('.content-section.active-section');

    if (defaultActiveSection) {
        const defaultSectionId = defaultActiveSection.id;
        initialActiveLi = document.querySelector(`.nav-links li[data-section-id="${defaultSectionId}"]`);
    } else if (navItems.length > 0) { // Fallback to first nav item if no section is active
        initialActiveLi = navItems[0];
        const fallbackSectionId = initialActiveLi.getAttribute('data-section-id');
        if(document.getElementById(fallbackSectionId)){
             showSection(fallbackSectionId); // Ensure corresponding section is shown
        } else if (sections.length > 0) {
            sections[0].classList.add('active-section'); // Show first available section
             initialActiveLi = document.querySelector(`.nav-links li[data-section-id="${sections[0].id}"]`);
        }
    }

    // Set initial indicator position
    if (initialActiveLi) {
        setTimeout(() => {
             moveIndicator(initialActiveLi);
             updateScrollFades(); // Set initial fade states
        }, 100); // Slightly longer delay to ensure layout is stable
    } else {
        console.warn("Could not determine initial active navigation item.");
    }


    // --- Event Listeners ---
    navLinksContainer.addEventListener('click', (event) => {
        const parentLi = event.target.closest('li');
        if (parentLi && parentLi.hasAttribute('data-section-id')) {
            event.preventDefault();
            const sectionId = parentLi.getAttribute('data-section-id');
            showSection(sectionId);
            moveIndicator(parentLi);
        }
    });

    // --- Dynamic fade indicators for scroll ---
    function updateScrollFades() {
        if (!navLinksContainer || !navLinksContainerWrapper) return;
        
        // Only apply on small screens where scrolling is enabled (expanded to include all small screens)
        if (window.innerWidth <= 480 && navLinksContainerWrapper.scrollWidth > navLinksContainerWrapper.clientWidth) {
            const scrollLeft = navLinksContainerWrapper.scrollLeft;
            const maxScrollLeft = navLinksContainerWrapper.scrollWidth - navLinksContainerWrapper.clientWidth;
            
            // Show left fade if we can scroll left (not at the beginning) - more generous threshold
            if (scrollLeft > 5) {
                navLinksContainerWrapper.classList.add('show-fade-left');
            } else {
                navLinksContainerWrapper.classList.remove('show-fade-left');
            }
            
            // Show right fade if we can scroll right (not at the end) - more generous threshold
            if (scrollLeft < maxScrollLeft - 5) {
                navLinksContainerWrapper.classList.add('show-fade-right');
            } else {
                navLinksContainerWrapper.classList.remove('show-fade-right');
            }
        } else {
            // Remove fade indicators on larger screens or when scrolling isn't needed
            navLinksContainerWrapper.classList.remove('show-fade-left', 'show-fade-right');
        }
    }

    // Add scroll event listener for fade indicators
    if (navLinksContainerWrapper) {
        navLinksContainerWrapper.addEventListener('scroll', updateScrollFades);
    }

    window.addEventListener('resize', () => {
        const currentActiveLi = document.querySelector('.nav-links li.active');
        if (currentActiveLi) {
            // Debounce or throttle this in a real application for performance
             setTimeout(() => {
                 moveIndicator(currentActiveLi);
                 updateScrollFades();
             }, 100);
        }
    });

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Typewriter Effect ---
    const typewriterText = document.getElementById('typewriter-text');
    const typewriterCursor = document.getElementById('typewriter-cursor');
    
    if (typewriterText && typewriterCursor) {
        const phrases = [
            'ROBOTICS AND AI',
            'Computer Vision Engineer',
            'Deep Learning Engineer'
        ];
        
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isTyping = true;
        let isDeleting = false;
        
        function typewriterEffect() {
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (isTyping && !isDeleting) {
                // Typing phase
                if (currentCharIndex < currentPhrase.length) {
                    typewriterText.textContent = currentPhrase.slice(0, currentCharIndex + 1);
                    currentCharIndex++;
                    setTimeout(typewriterEffect, 100); // Typing speed
                } else {
                    // Finished typing, wait then start deleting
                    isTyping = false;
                    setTimeout(() => {
                        isDeleting = true;
                        typewriterEffect();
                    }, 2000); // Pause before deleting
                }
            } else if (isDeleting) {
                // Deleting phase
                if (currentCharIndex > 0) {
                    typewriterText.textContent = currentPhrase.slice(0, currentCharIndex - 1);
                    currentCharIndex--;
                    setTimeout(typewriterEffect, 50); // Deleting speed (faster)
                } else {
                    // Finished deleting, move to next phrase
                    isDeleting = false;
                    isTyping = true;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    setTimeout(typewriterEffect, 500); // Pause before typing next phrase
                }
            }
        }
        
        // Start the typewriter effect after a short delay
        setTimeout(typewriterEffect, 1000);
    }

    // --- Video Toggle Functionality ---
    const videoToggles = document.querySelectorAll('.video-toggle');
    
    videoToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const videoContent = document.getElementById(toggle.getAttribute('aria-controls'));
            const iframe = videoContent.querySelector('iframe');
            const videoId = toggle.getAttribute('data-video-id');
            
            if (isExpanded) {
                // Collapse
                toggle.setAttribute('aria-expanded', 'false');
                videoContent.hidden = true;
            } else {
                // Expand and load video if not already loaded
                toggle.setAttribute('aria-expanded', 'true');
                videoContent.hidden = false;
                
                // Lazy load: only set src when expanding (if not already set)
                if (videoId && !iframe.src) {
                    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
                }
            }
        });
    });

}); // End DOMContentLoaded