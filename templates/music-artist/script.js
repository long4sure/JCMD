// nav scroll
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

// hamburger
const ham = document.getElementById('nav-ham');
const mob = document.getElementById('nav-mobile');
if (ham && mob) {
  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    mob.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open'); mob.classList.remove('open'); document.body.style.overflow = '';
  }));
}

// reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal,.reveal-s').forEach((el, i) => {
  el.style.transitionDelay = (i % 5 * 0.07) + 's';
  obs.observe(el);
});

// booking form
const bForm = document.getElementById('booking-form');
const bStatus = document.getElementById('br-status');
const bSubmit = document.getElementById('br-submit');
if (bForm) {
  bForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('br-name').value.trim();
    const email = document.getElementById('br-email-f').value.trim();
    const type = document.getElementById('br-type').value;
    if (!name || !email || !type) {
      bStatus.textContent = 'Please fill in all required fields.';
      bStatus.className = 'form-status error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      bStatus.textContent = 'Please enter a valid email.';
      bStatus.className = 'form-status error';
      return;
    }
    document.getElementById('br-email').value = email;
    bSubmit.disabled = true;
    bSubmit.textContent = 'Sending…';
    try {
      const res = await fetch(bForm.action, {
        method: 'POST',
        body: new FormData(bForm),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        bStatus.textContent = "Message sent! I'll hit you back soon.";
        bStatus.className = 'form-status success';
        bForm.reset();
      } else {
        bStatus.textContent = 'Something went wrong. Try messaging me on Facebook.';
        bStatus.className = 'form-status error';
      }
    } catch {
      bStatus.textContent = 'Could not send. Please try again.';
      bStatus.className = 'form-status error';
    }
    bSubmit.disabled = false;
    bSubmit.textContent = 'Send It →';
  });
}
