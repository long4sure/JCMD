// Scroll reveal observer
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4 * 0.08) + 's';
  obs.observe(el);
});

// Nav scroll shadow toggle
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(59,31,14,0.1)' : 'none';
});
