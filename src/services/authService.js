const STORAGE_KEYS = {
  user: 'simpleInterest_user',
  auth: 'simpleInterest_auth',
  theme: 'simpleInterest_theme',
  history: 'simpleInterest_history',
  reports: 'simpleInterest_reports',
}

export function getStorageKeys() {
  return STORAGE_KEYS
}

function safeParse(value) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function getCurrentUser() {
  const storedUser = safeParse(localStorage.getItem(STORAGE_KEYS.user))
  if (!storedUser) {
    return null
  }

  return {
    fullName: storedUser.fullName || 'User',
    email: storedUser.email || '',
    password: storedUser.password || '',
    avatar: storedUser.avatar || getInitials(storedUser.fullName || 'User'),
  }
}

export function getAuthState() {
  const user = getCurrentUser()
  const auth = safeParse(localStorage.getItem(STORAGE_KEYS.auth))

  if (!user || !auth || !auth.loggedIn) {
    return { isAuthenticated: false, user: null }
  }

  return { isAuthenticated: true, user }
}

export function setAuthState(loggedIn, user) {
  if (loggedIn && user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({ loggedIn: true, userEmail: user.email }))
    return
  }

  localStorage.removeItem(STORAGE_KEYS.user)
  localStorage.removeItem(STORAGE_KEYS.auth)
}

export function signupUser({ fullName, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const existingUser = getCurrentUser()

  if (existingUser && existingUser.email.toLowerCase() === normalizedEmail) {
    return { ok: false, message: 'An account already exists for this email.' }
  }

  const nextUser = {
    fullName: String(fullName || '').trim(),
    email: normalizedEmail,
    password: String(password || ''),
    avatar: getInitials(String(fullName || '').trim()),
  }

  setAuthState(true, nextUser)
  return { ok: true, user: nextUser }
}

export function loginUser({ email, password }) {
  const user = getCurrentUser()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!user) {
    return { ok: false, message: 'No account found. Please sign up first.' }
  }

  if (user.email.toLowerCase() !== normalizedEmail || user.password !== String(password || '')) {
    return { ok: false, message: 'Invalid email or password.' }
  }

  setAuthState(true, user)
  return { ok: true, user }
}

export function logoutUser() {
  setAuthState(false, null)
}

export function updateUserProfile(nextUser) {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return null
  }

  const updatedUser = {
    ...currentUser,
    ...nextUser,
    email: currentUser.email,
    avatar: nextUser.avatar || getInitials(nextUser.fullName || currentUser.fullName || 'User'),
  }

  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser))
  localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({ loggedIn: true, userEmail: currentUser.email }))

  return updatedUser
}

export function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'
}
