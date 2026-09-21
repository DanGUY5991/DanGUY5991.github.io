// Progressive enhancement: the full page remains readable without JavaScript.
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const smallScreen = window.matchMedia('(max-width: 680px)');
function resetMenu() {
  if (!menu || !menuButton) return;
  menu.hidden = smallScreen.matches;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
}
if (menuButton && menu) {
  resetMenu();
  smallScreen.addEventListener('change', resetMenu);
  menuButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a') && smallScreen.matches) resetMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && smallScreen.matches && !menu.hidden) {
      resetMenu(); menuButton.focus();
    }
  });
}
