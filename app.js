document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    let currentUser = null; // null if not logged in, object if logged in


    // --- SPA Routing Logic ---
    const navActions = document.querySelectorAll('.nav-action');
    const views = document.querySelectorAll('.view-section');

    function renderViewFromHash() {
        let hash = window.location.hash.replace('#', '');
        if (!hash) hash = 'home';

        // Hide all views
        views.forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${hash}-view`);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error(`View not found: ${hash}-view`);
            document.getElementById('home-view').classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateNavUI();
    }

    window.addEventListener('hashchange', renderViewFromHash);

    // Attach event listeners to all navigation elements
    navActions.forEach(action => {
        action.addEventListener('click', (e) => {
            e.preventDefault();
            const target = action.getAttribute('data-target');
            if (target) {
                window.location.hash = target;
            }
        });
    });


    // --- Authentication & Mock Handlers ---

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    const navAuthButtons = document.getElementById('nav-auth-buttons');
    const navUserProfile = document.getElementById('nav-user-profile');
    const navDashboardLink = document.getElementById('nav-dashboard-link');

    // MOCK LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Mock authentication
            currentUser = {
                name: "John Doe",
                blood: "A+",
                city: "New York",
                phone: "+1 234 567 8900"
            };
            window.location.hash = 'dashboard';
            populateProfile();
        });
    }

    // MOCK REGISTER
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const blood = document.getElementById('reg-blood').value;
            const city = document.getElementById('reg-city').value;
            const phone = document.getElementById('reg-phone').value;

            currentUser = {
                name: name || "New User",
                blood: blood || "A+",
                city: city || "Unknown",
                phone: phone || "+1 000 000 0000"
            };
            window.location.hash = 'dashboard';
            populateProfile();
        });
    }

    // MOCK LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            window.location.hash = 'home';
        });
    }

    function updateNavUI() {
        if (currentUser) {
            // User gets auth state
            navAuthButtons.style.display = 'none';
            navUserProfile.style.display = 'flex';
            navDashboardLink.style.display = 'block';
        } else {
            // User logged out
            navAuthButtons.style.display = 'flex';
            navUserProfile.style.display = 'none';
            navDashboardLink.style.display = 'none';
        }
    }

    function populateProfile() {
        if (!currentUser) return;
        
        // Dashboard welcome
        const dashWelcome = document.getElementById('dashboard-welcome');
        if (dashWelcome) dashWelcome.textContent = `Welcome, ${currentUser.name} 👋`;

        // Profile View specific
        const pName = document.getElementById('profile-name-disp');
        const pBlood = document.getElementById('profile-blood-disp');
        const pCity = document.getElementById('profile-city-disp');
        const pPhone = document.getElementById('profile-phone-disp');

        if (pName) pName.textContent = currentUser.name;
        if (pBlood) pBlood.textContent = currentUser.blood;
        if (pCity) pCity.textContent = currentUser.city;
        if (pPhone) pPhone.textContent = currentUser.phone;
    }


    // --- Emergency Request Form ---
    const emergencyForm = document.getElementById('emergency-form');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('em-name').value;
            const blood = document.getElementById('em-blood').value;
            const hospital = document.getElementById('em-hospital').value;
            const contact = document.getElementById('em-contact').value;

            // Prepend new request card
            const list = document.getElementById('emergency-list');
            const cardHtml = `
                <div class="card emergency-card border-danger mb-3" style="animation: fadeIn 0.4s">
                    <div class="flex-between">
                        <h4 class="text-danger">${name}</h4>
                        <div class="blood-badge danger">${blood}</div>
                    </div>
                    <p class="mb-1"><i class='bx bx-building-house'></i> ${hospital}</p>
                    <p class="mb-2"><i class='bx bx-time'></i> Just now</p>
                    <button class="btn btn-primary btn-sm"><i class='bx bxs-phone'></i> Contact: ${contact}</button>
                </div>
            `;
            list.insertAdjacentHTML('afterbegin', cardHtml);
            emergencyForm.reset();
        });
    }

    // --- Search Form ---
    const searchForm = document.getElementById('search-form');
    if(searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Just simulate a search reload/filter mock
            const grid = document.getElementById('donor-results-grid');
            grid.style.opacity = '0.5';
            setTimeout(() => {
                grid.style.opacity = '1';
                // You would dynamically redraw the list here depending on filters
                // e.g., grid.innerHTML = ...
            }, 300);
        });
    }


    // INIT
    renderViewFromHash();

    // --- Interactive Animations (Scroll Reveal) ---
    const animatedElements = document.querySelectorAll('.card, .section-title');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('animate-pop-in');
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        scrollObserver.observe(el);
    });

});
