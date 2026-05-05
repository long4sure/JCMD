/* ════════════════════════════════════════
   JCMD — script.js
════════════════════════════════════════ */
/* nav scroll state */
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), {passive:true});

  /* active nav link */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id], div[id]');
  const secObs = new IntersectionObserver(e => {
    e.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+id));
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  sections.forEach(s => secObs.observe(s));

  /* hamburger */
  const ham = document.getElementById('nav-ham');
  const mob = document.getElementById('nav-mobile');
  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    mob.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mob.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open'); mob.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* reveal */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, {threshold:0.08, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.reveal-l,.reveal-s').forEach((el,i) => {
    el.style.transitionDelay = (i % 5 * 0.07) + 's';
    obs.observe(el);
  });

  /* faq */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });

  /* form — Formspree real submission */
  const form      = document.getElementById('inquiry-form');
  const statusEl  = document.getElementById('q-status');
  const submitBtn = document.getElementById('q-submit');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name  = document.getElementById('q-name').value.trim();
    const phone = document.getElementById('q-phone').value.trim();
    const email = document.getElementById('q-email').value.trim();
    const type  = document.getElementById('q-type').value;

    if(!name || !phone || !email || !type){
      setStatus('Please fill in all required fields.', 'error'); return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setStatus('Please enter a valid email address.', 'error'); return;
    }

    // mirror email to _replyto hidden field so Formspree sets Reply-To correctly
    document.getElementById('reply-email').value = email;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const formAction = form.getAttribute('action');

    // If still using placeholder, fall back to mailto gracefully
    if(!formAction || !formAction || formAction.includes('YOUR_FORMSPREE_ENDPOINT')){
      const biz  = document.getElementById('q-business').value.trim();
      const msg  = document.getElementById('q-message').value.trim();
      const body = encodeURIComponent(`Hi Jerome,\n\nI'd like to inquire about a website.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nBusiness: ${biz||'N/A'}\nType: ${type}\n\n${msg?'Message:\n'+msg:''}\n\nLooking forward to hearing from you!`);
      const sub  = encodeURIComponent(`Website Inquiry from ${name}${biz?' — '+biz:''}`);
      window.location.href = `mailto:jeromemisa2020@gmail.com?subject=${sub}&body=${body}`;
      setStatus('Mail client opened. I\'ll get back to you within 24 hours.', 'success');
      form.reset(); submitBtn.disabled=false; submitBtn.textContent='Send Inquiry →';
      return;
    }

    try {
      const data = new FormData(form);
      const res  = await fetch(formAction, {
        method:'POST',
        body: data,
        headers:{ 'Accept':'application/json' }
      });

      if(res.ok){
        setStatus('Message sent! I\'ll get back to you within 24 hours.', 'success');
        form.reset();
      } else {
        const json = await res.json().catch(()=>({}));
        const msg  = json.errors ? json.errors.map(e=>e.message).join(', ') : 'Something went wrong. Please try again or message me on Facebook.';
        setStatus(msg, 'error');
      }
    } catch(err){
      setStatus('Could not send. Please try again or message me on Facebook.', 'error');
    }

    submitBtn.disabled=false;
    submitBtn.textContent='Send Inquiry →';
  });

  function setStatus(m,t){ statusEl.textContent=m; statusEl.className='form-status '+t; }
