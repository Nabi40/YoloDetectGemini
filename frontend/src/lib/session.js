// Simple session helpers using localStorage
export function setSession(session) {
  try {
    localStorage.setItem('ydg_session', JSON.stringify(session));
  } catch (e) {
    // ignore storage errors
    console.error('Failed to save session', e);
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem('ydg_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read session', e);
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem('ydg_session');
  } catch (e) {
    // ignore
  }
}

const session = { setSession, getSession, clearSession };
export default session;
