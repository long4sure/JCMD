redirectIfAuth('dashboard.html')

let isRegister = false

window.toggleMode = (e) => {
  e.preventDefault()
  isRegister = !isRegister
  document.getElementById('login-form').style.display = isRegister ? 'none' : 'block'
  document.getElementById('register-form').style.display = isRegister ? 'block' : 'none'
  document.getElementById('form-title').textContent = isRegister ? 'Create your account' : 'Sign in to your account'
  document.getElementById('toggle-text').textContent = isRegister ? 'Already have an account?' : "Don't have an account?"
  document.getElementById('toggle-link').textContent = isRegister ? ' Sign in' : ' Register'
  hideError('login-error')
}

window.handleLogin = async () => {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  if (!email || !password) { showError('login-error', 'Please fill in all fields'); return }
  const btn = document.getElementById('login-btn')
  btn.disabled = true; btn.textContent = 'Signing in…'
  try {
    await signIn(email, password)
    window.location.href = 'dashboard.html'
  } catch(e) {
    showError('login-error', e.message)
    btn.disabled = false; btn.textContent = 'Sign in'
  }
}

window.handleRegister = async () => {
  const name = document.getElementById('reg-name').value.trim()
  const email = document.getElementById('reg-email').value.trim()
  const password = document.getElementById('reg-password').value
  if (!name || !email || !password) { showError('login-error', 'Please fill in all fields'); return }
  const btn = document.getElementById('register-btn')
  btn.disabled = true; btn.textContent = 'Creating account…'
  try {
    await signUp(email, password, name)
    window.location.href = 'dashboard.html'
  } catch(e) {
    showError('login-error', e.message)
    btn.disabled = false; btn.textContent = 'Create account'
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') isRegister ? window.handleRegister() : window.handleLogin()
})
