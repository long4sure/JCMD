/* ════════════════════════════════════════════════
   JCMD — script.js
   ════════════════════════════════════════════════ */

/* ── NAV: scroll state + progress bar ── */
const mainNav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  if (mainNav) {
    mainNav.classList.toggle('scrolled', window.scrollY > 20);
  }
}, { passive: true });

/* ── NAV: active link highlight on scroll ── */
const navLinks = document.querySelectorAll('.nav-links button, .nav-links a');
const sections = document.querySelectorAll('section[id]');

const activeObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        const isActive = onClickAttr.includes(`'${id}'`) || onClickAttr.includes(`"${id}"`);
        btn.classList.toggle('active', isActive);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => s.id && activeObs.observe(s));

/* ── HAMBURGER MENU ── */
const ham     = document.getElementById('nav-ham');
const mobMenu = document.getElementById('nav-mobile');

if (ham && mobMenu) {
  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    mobMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  
  mobMenu.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('click', () => {
      ham.classList.remove('open');
      mobMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── SCROLL TO SECTION HELPER ── */
window.scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    // Clean hamburger menu if open
    if (ham && mobMenu) {
      ham.classList.remove('open');
      mobMenu.classList.remove('open');
    }
    document.body.style.overflow = '';

    const yOffset = -64; // height of navigation
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

/* ── SCROLL REVEAL ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el   = entry.target;
      const base = parseFloat(el.dataset.delay || 0);
      const idx  = parseInt(el.dataset.idx  || 0);
      el.style.transitionDelay = (base + idx * 0.06) + 's';
      requestAnimationFrame(() => el.classList.add('visible'));
      revealObs.unobserve(el);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-l, .reveal-s').forEach((el, i) => {
  el.dataset.idx = i % 5;
  revealObs.observe(el);
});

/* ── BUTTON RIPPLE EFFECT ── */
document.querySelectorAll('.btn, .form-submit, .nav-cta').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r    = this.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const rpl  = document.createElement('span');
    rpl.classList.add('btn-ripple');
    rpl.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${e.clientX - r.left - size / 2}px;
      top:    ${e.clientY - r.top  - size / 2}px;
      position: absolute;
      border-radius: 50%;
      background: rgba(74, 144, 217, 0.15);
      transform: scale(0);
      animation: ripple 0.55s linear;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(rpl);
    setTimeout(() => rpl.remove(), 600);
  });
});

// Add ripple keyframes dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(styleSheet);

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── PARALLAX BLOBS ── */
window.addEventListener('mousemove', e => {
  const xf = (e.clientX / window.innerWidth  - 0.5) * 2;
  const yf = (e.clientY / window.innerHeight - 0.5) * 2;
  document.querySelectorAll('.hero-blob').forEach((blob, i) => {
    const depth = (i + 1) * 0.015;
    blob.style.transform = `translate(${xf * 30 * depth}px, ${yf * 30 * depth}px)`;
  });
}, { passive: true });

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const dur    = 1600;
  const start  = performance.now();
  
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(2, -10 * p); // ease-out expo
    el.textContent = Math.round(e * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { 
      animateCounter(e.target); 
      cntObs.unobserve(e.target); 
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

/* ── LMS INSTRUCTIONS MODAL ── */
const lmsModal = document.getElementById('lms-modal');
window.openLmsModal = () => {
  if (lmsModal) {
    lmsModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};
window.closeLmsModal = () => {
  if (lmsModal) {
    lmsModal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close modal when clicking outside contents
if (lmsModal) {
  lmsModal.addEventListener('click', e => {
    if (e.target === lmsModal) {
      closeLmsModal();
    }
  });
}

/* ── CONTACT FORM — Formspree ── */
const form      = document.getElementById('inquiry-form');
const statusEl  = document.getElementById('q-status');
const submitBtn = document.getElementById('q-submit');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name  = document.getElementById('q-name')?.value.trim();
    const phone = document.getElementById('q-phone')?.value.trim();
    const email = document.getElementById('q-email')?.value.trim();
    const type  = document.getElementById('q-type')?.value;

    /* validation */
    if (!name || !phone || !email || !type) {
      setStatus('Please fill in all required fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.', 'error'); return;
    }

    /* mirror email into _replyto for Formspree reply-to header */
    const replyField = document.getElementById('reply-email');
    if (replyField) replyField.value = email;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    const action = form.getAttribute('action') || '';

    /* if Formspree endpoint is set, use fetch; otherwise fall back to mailto */
    if (action && action.includes('formspree.io')) {
      try {
        const res = await fetch(action, {
          method:  'POST',
          body:    new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          setStatus('Message sent! We\'ll get back to you within 24 hours.', 'success');
          form.reset();
        } else {
          const json = await res.json().catch(() => ({}));
          const msg  = json.errors
            ? json.errors.map(err => err.message).join(', ')
            : 'Something went wrong. Please try messaging us on Facebook.';
          setStatus(msg, 'error');
        }
      } catch {
        setStatus('Could not send. Please try messaging us on Facebook.', 'error');
      }
    } else {
      /* mailto fallback */
      const biz  = document.getElementById('q-business')?.value.trim() || '';
      const msg  = document.getElementById('q-message')?.value.trim()  || '';
      const body = encodeURIComponent(
        `Hi JCMD,\n\nI'd like to inquire about a project.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nBusiness: ${biz || 'N/A'}\nType: ${type}\n\n${msg ? 'Message:\n' + msg : ''}\n\nLooking forward to hearing from you!`
      );
      const sub = encodeURIComponent(`Project Inquiry from ${name}${biz ? ' — ' + biz : ''}`);
      window.location.href = `mailto:jeromemisa2020@gmail.com?subject=${sub}&body=${body}`;
      setStatus('Mail client opened. We\'ll get back to you within 24 hours.', 'success');
      form.reset();
    }

    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send Inquiry →';
  });
}

function setStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className   = 'form-status ' + type;
}
