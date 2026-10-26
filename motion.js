/* Progressive enhancement: content remains visible without JavaScript. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const active = new Set();
  const played = new WeakSet();
  const animate = (element, delay = 0) => {
    if (preference.matches || played.has(element)) return;
    played.add(element);
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(22px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    active.add(animation);
    animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
  };
  const brandObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!preference.matches) entry.target.classList.add('motion-playing');
      brandObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-brand-motion]').forEach(element => brandObserver.observe(element));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      if (element.matches('.goal-sequence')) {
        Array.from(element.children).forEach((card, index) => animate(card, index * 650));
        observer.unobserve(element);
        return;
      }
      const siblings = element.parentElement.matches('.grid, .overview, .course-pipeline ol')
        ? Array.from(element.parentElement.children) : [];
      animate(element, Math.max(0, siblings.indexOf(element)) * (element.closest('.course-pipeline') ? 220 : 90));
      observer.unobserve(element);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.overview > div, .chapter > .eyebrow, .chapter > h2, .chapter > .intro, .grid > *, .youtube-feature, .course-panel, .course-pipeline li, footer h2')
    .forEach(element => {
      if (!element.parentElement.matches('.goal-sequence')) observer.observe(element);
    });
  document.querySelectorAll('.goal-sequence').forEach(group => observer.observe(group));
  preference.addEventListener('change', () => {
    if (preference.matches) {
      active.forEach(animation => animation.cancel());
      active.clear();
    }
  });
})();
