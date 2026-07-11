document.addEventListener('DOMContentLoaded', () => {
    if (typeof profileData === 'undefined') return;

    setText('plain-name', profileData.name);
    setText('plain-role', profileData.role);

    const about = document.getElementById('plain-about');
    if (about && profileData.about) about.innerHTML = profileData.about;

    const services = document.getElementById('plain-services');
    if (services && profileData.services) {
        services.innerHTML = profileData.services.map(service => `
            <article class="plain-card">
                <h3>${service.category}</h3>
                <ul>
                    ${service.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </article>
        `).join('');
    }

    const projects = document.getElementById('plain-projects');
    if (projects && profileData.projects) {
        projects.innerHTML = profileData.projects.map(project => `
            <article class="plain-card">
                <span class="project-type">${project.type}</span>
                <h3>${project.title}</h3>
                <p>${project.desc}</p>
            </article>
        `).join('');
    }

    const writing = document.getElementById('plain-writing');
    if (writing && profileData.writing) {
        writing.innerHTML = profileData.writing.map(article => `
            <article class="plain-list-item">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
            </article>
        `).join('');
    }

    const contact = document.getElementById('plain-contact');
    if (contact && profileData.socialLinks) {
        const links = [];
        if (profileData.socialLinks.email) {
            links.push(`<a class="primary-link" href="${profileData.socialLinks.email}">Email me</a>`);
        }
        if (profileData.socialLinks.linkedin) {
            links.push(`<a class="secondary-link" href="${profileData.socialLinks.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`);
        }
        if (profileData.socialLinks.github) {
            links.push(`<a class="secondary-link" href="${profileData.socialLinks.github}" target="_blank" rel="noopener">GitHub</a>`);
        }
        contact.innerHTML = links.join('');
    }
});

function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value) element.innerText = value;
}
