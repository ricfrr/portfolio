document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.querySelector('.nav-links');
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
        if (!targetLi || !navLinksContainer) return;

        // Check if horizontal scrolling is active (when container has overflow)
        if (navLinksContainer.scrollWidth > navLinksContainer.clientWidth) {
            const containerRect = navLinksContainer.getBoundingClientRect();
            const linkRect = targetLi.getBoundingClientRect();
            
            // Calculate if the item is out of view
            const isItemVisible = linkRect.left >= containerRect.left && 
                                linkRect.right <= containerRect.right;
            
            if (!isItemVisible) {
                // Calculate scroll position to center the item
                const scrollLeft = targetLi.offsetLeft - (navLinksContainer.clientWidth / 2) + (targetLi.offsetWidth / 2);
                
                // Smooth scroll to the calculated position
                navLinksContainer.scrollTo({
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
        if (!navLinksContainer) return;
        
        // Only apply on small screens where scrolling is enabled
        if (window.innerWidth <= 480 && navLinksContainer.scrollWidth > navLinksContainer.clientWidth) {
            const scrollLeft = navLinksContainer.scrollLeft;
            const maxScrollLeft = navLinksContainer.scrollWidth - navLinksContainer.clientWidth;
            
            // Get or create fade elements
            const container = navLinksContainer;
            const beforeEl = container.querySelector('::before') || container;
            const afterEl = container.querySelector('::after') || container;
            
            // Update CSS custom properties for dynamic fade opacity
            if (scrollLeft <= 5) {
                container.style.setProperty('--fade-left-opacity', '0');
            } else {
                container.style.setProperty('--fade-left-opacity', '1');
            }
            
            if (scrollLeft >= maxScrollLeft - 5) {
                container.style.setProperty('--fade-right-opacity', '0');
            } else {
                container.style.setProperty('--fade-right-opacity', '1');
            }
        }
    }

    // Add scroll event listener for fade indicators
    if (navLinksContainer) {
        navLinksContainer.addEventListener('scroll', updateScrollFades);
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

}); // End DOMContentLoaded