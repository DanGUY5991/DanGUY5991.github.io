document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    setupSmoothScroll();
    setupAnimations();
});

function loadContent() {
    if (typeof profileData === 'undefined') return;

    // --- Hero ---
    updateText('hero-name', profileData.name);
    updateText('hero-role', profileData.role);
    updateText('hero-subtitle', profileData.subtitle);

    // --- About ---
    const aboutContainer = document.getElementById('about-container');
    if (aboutContainer && profileData.about) {
        aboutContainer.innerHTML = profileData.about;
    }

    // --- Sensemaking (My Approach) ---
    const senseIntro = document.getElementById('sensemaking-intro');
    const senseGrid = document.getElementById('sensemaking-grid');
    if (profileData.sensemaking) {
        if (senseIntro) senseIntro.innerText = profileData.sensemaking.intro;
        if (senseGrid && profileData.sensemaking.aspects) {
            senseGrid.innerHTML = profileData.sensemaking.aspects.map(item => `
                <div class="sense-card">
                    <h4>${item.title}</h4>
                    <p class="sense-quote">"${item.quote}"</p>
                    <p class="sense-desc">${item.desc}</p>
                </div>
            `).join('');
        }
    }

    // --- Services ("What I Do") ---
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid && profileData.services) {
        const icons = ['fa-chess-u', 'fa-robot', 'fa-microscope']; // Character-like icons
        servicesGrid.innerHTML = profileData.services.map((service, index) => `
            <div class="service-card glass-panel">
                <div class="card-character-container">
                    <i class="fas ${icons[index]} card-character-icon anim-float"></i>
                </div>
                <h4>${service.category}</h4>
                <ul>
                    ${service.items.map(item => `<li><i class="fas fa-check-circle"></i> ${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    // --- Projects ("Work") ---
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid && profileData.projects) {
        const projIcons = ['fa-briefcase', 'fa-chalkboard-teacher', 'fa-file-alt'];
        projectsGrid.innerHTML = profileData.projects.map((project, index) => `
            <div class="project-card">
               <div class="card-character-container">
                    <i class="fas ${projIcons[index]} card-character-icon anim-pulse"></i>
                </div>
                <span class="project-type">${project.type}</span>
                <h4>${project.title}</h4>
                <p>${project.desc}</p>
            </div>
        `).join('');
    }

    // --- Writing / Thinking ---
    const writingContainer = document.getElementById('writing-container');
    if (writingContainer && profileData.writing) {
        writingContainer.innerHTML = profileData.writing.map(article => `
            <div class="article-item">
                <div class="article-icon"><i class="fas fa-pen-nib"></i></div>
                <div class="article-content">
                    <h4>${article.title}</h4>
                    <p>${article.summary}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Ethics ---
    const ethicsContent = document.getElementById('ethics-content');
    if (ethicsContent && profileData.ethics) {
        ethicsContent.innerHTML = profileData.ethics;
    }

    // --- Contact / Social ---
    const socialContainer = document.getElementById('social-links');
    if (socialContainer && profileData.socialLinks) {
        let linksHtml = '';
        if (profileData.socialLinks.email) linksHtml += `<a href="${profileData.socialLinks.email}" class="btn-primary huge-btn">Email Me</a>`;
        if (profileData.socialLinks.linkedin) linksHtml += `<br><br><a href="${profileData.socialLinks.linkedin}" target="_blank" class="social-text">LinkedIn</a>`;
        socialContainer.innerHTML = linksHtml;
    }
}

function updateText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.innerText = text;
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .service-card, .project-card, .sense-card').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
}
