export function setToken(token) { if (typeof window !== 'undefined') localStorage.setItem('token', token); }
export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }
export function parseToken() {
  const t = getToken();
  if (!t) return null;
  try {
    const base = t.split('.')[1];
    const payload = JSON.parse(atob(base));
    return payload;
  } catch {
    return null;
  }
}
export function logout() { if (typeof window !== 'undefined') localStorage.removeItem('token'); }
